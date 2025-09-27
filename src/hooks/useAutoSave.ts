/**
 * Auto-Save Hook for APD Data
 *
 * This hook provides automatic saving functionality with debouncing,
 * conflict resolution, and error handling for APD data.
 *
 * Features:
 * - Debounced auto-save to prevent excessive database writes
 * - Visual save status indicators
 * - Error handling and retry logic
 * - Conflict resolution for concurrent edits
 * - Manual save trigger
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { APD, APDWorkingCopy, FieldChange } from '../types/apd';
import { storageService } from '../services/database';
import { StorageError, StorageErrorCode } from '../types/database';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'conflict';

export interface AutoSaveOptions {
  debounceMs?: number;
  maxRetries?: number;
  retryDelayMs?: number;
  enableConflictResolution?: boolean;
}

export interface AutoSaveState {
  status: SaveStatus;
  lastSaved?: Date;
  error?: string | undefined;
  hasUnsavedChanges: boolean;
  isOnline: boolean;
}

export interface AutoSaveActions {
  save: () => Promise<void>;
  retry: () => Promise<void>;
  markAsChanged: () => void;
  clearError: () => void;
}

const DEFAULT_OPTIONS: Required<AutoSaveOptions> = {
  debounceMs: 5000, // 5 seconds
  maxRetries: 3,
  retryDelayMs: 1000, // 1 second
  enableConflictResolution: true,
};

/**
 * Auto-save hook for APD data with debouncing and error handling
 */
export function useAutoSave(
  apd: APD | null,
  onSave: (apd: APD) => Promise<void>,
  options: AutoSaveOptions = {}
): [AutoSaveState, AutoSaveActions] {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // State management
  const [state, setState] = useState<AutoSaveState>({
    status: 'idle',
    hasUnsavedChanges: false,
    isOnline: navigator.onLine,
  });

  // Refs for managing timers and retry logic
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const retryCountRef = useRef(0);
  const lastSaveDataRef = useRef<string>('');

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () =>
      setState(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Perform the actual save operation
   */
  const performSave = useCallback(
    async (apdToSave: APD): Promise<void> => {
      try {
        setState(prev => ({ ...prev, status: 'saving', error: undefined }));

        // Check for conflicts if enabled
        if (opts.enableConflictResolution) {
          const existingAPD = await storageService.getAPD(apdToSave.id);
          if (existingAPD && existingAPD.updatedAt > apdToSave.updatedAt) {
            setState(prev => ({
              ...prev,
              status: 'conflict',
              error:
                'Another user has modified this APD. Please refresh and try again.',
            }));
            return;
          }
        }

        // Update the APD's timestamp
        const updatedAPD = {
          ...apdToSave,
          updatedAt: new Date(),
        };

        // Perform the save
        await onSave(updatedAPD);

        // Update state on successful save
        setState(prev => ({
          ...prev,
          status: 'saved',
          lastSaved: new Date(),
          hasUnsavedChanges: false,
          error: undefined,
        }));

        // Store the saved data hash for change detection
        lastSaveDataRef.current = JSON.stringify(updatedAPD);
        retryCountRef.current = 0;

        // Reset status to idle after a short delay
        setTimeout(() => {
          setState(prev =>
            prev.status === 'saved' ? { ...prev, status: 'idle' } : prev
          );
        }, 2000);
      } catch (error) {
        console.error('Auto-save failed:', error);

        const errorMessage =
          error instanceof StorageError
            ? error.message
            : 'Failed to save changes';

        setState(prev => ({
          ...prev,
          status: 'error',
          error: errorMessage,
        }));

        // Retry logic for certain types of errors
        if (
          retryCountRef.current < opts.maxRetries &&
          error instanceof StorageError &&
          error.code !== StorageErrorCode.QUOTA_EXCEEDED
        ) {
          retryCountRef.current++;
          setTimeout(() => {
            if (apd) {
              performSave(apd);
            }
          }, opts.retryDelayMs * retryCountRef.current);
        }
      }
    },
    [
      apd,
      onSave,
      opts.enableConflictResolution,
      opts.maxRetries,
      opts.retryDelayMs,
    ]
  );

  /**
   * Schedule a debounced save
   */
  const scheduleSave = useCallback(
    (apdToSave: APD) => {
      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Check if data has actually changed
      const currentDataHash = JSON.stringify(apdToSave);
      if (currentDataHash === lastSaveDataRef.current) {
        return; // No changes to save
      }

      // Mark as having unsaved changes
      setState(prev => ({ ...prev, hasUnsavedChanges: true }));

      // Schedule the save
      saveTimeoutRef.current = setTimeout(() => {
        performSave(apdToSave);
      }, opts.debounceMs);
    },
    [performSave, opts.debounceMs]
  );

  /**
   * Trigger auto-save when APD data changes
   */
  useEffect(() => {
    if (apd && state.isOnline) {
      scheduleSave(apd);
    }
  }, [apd, scheduleSave, state.isOnline]);

  /**
   * Manual save function
   */
  const save = useCallback(async (): Promise<void> => {
    if (!apd) return;

    // Clear any pending auto-save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    await performSave(apd);
  }, [apd, performSave]);

  /**
   * Retry failed save
   */
  const retry = useCallback(async (): Promise<void> => {
    if (!apd) return;

    retryCountRef.current = 0;
    await performSave(apd);
  }, [apd, performSave]);

  /**
   * Mark data as changed (useful for external change detection)
   */
  const markAsChanged = useCallback((): void => {
    setState(prev => ({ ...prev, hasUnsavedChanges: true }));
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback((): void => {
    setState(prev => ({ ...prev, error: undefined, status: 'idle' }));
  }, []);

  const actions: AutoSaveActions = {
    save,
    retry,
    markAsChanged,
    clearError,
  };

  return [state, actions];
}

/**
 * Hook for managing working copy auto-save
 */
export function useWorkingCopyAutoSave(
  _apdId: string | null,
  workingCopy: APDWorkingCopy | null,
  options: AutoSaveOptions = {}
): [AutoSaveState, AutoSaveActions] {
  const saveWorkingCopy = useCallback(
    async (wc: APDWorkingCopy): Promise<void> => {
      await storageService.updateWorkingCopy(wc);
    },
    []
  );

  // Convert working copy to APD-like structure for the hook
  const apdLike = workingCopy
    ? {
        ...workingCopy,
        type: 'PAPD' as const,
        metadata: {
          stateName: '',
          stateAgency: '',
          primaryContact: { name: '', title: '', email: '', phone: '' },
          documentType: 'PAPD' as const,
          benefitsMultiplePrograms: false,
          projectName: '',
        },
        validationState: {
          isValid: false,
          errors: [],
          warnings: [],
          lastValidated: new Date(),
        },
        createdAt: new Date(),
        updatedAt: workingCopy.lastModified,
        currentVersion: workingCopy.baseVersionId,
        versions: [],
      }
    : null;

  return useAutoSave(
    apdLike,
    (apd: APD) => {
      // Convert APD back to APDWorkingCopy for saving
      const workingCopy: APDWorkingCopy = {
        id: apd.id,
        apdId: apd.id,
        baseVersionId: apd.currentVersion,
        sections: apd.sections,
        changes: [],
        lastModified: new Date(),
        hasUncommittedChanges: true,
      };
      return saveWorkingCopy(workingCopy);
    },
    options
  );
}

/**
 * Hook for tracking field changes with auto-save
 */
export function useFieldChangeTracking(
  apdId: string | null,
  onFieldChange?: (change: FieldChange) => void
) {
  const [changes, setChanges] = useState<FieldChange[]>([]);

  const trackChange = useCallback(
    async (
      fieldPath: string,
      fieldLabel: string,
      oldValue: unknown,
      newValue: unknown,
      section: string
    ): Promise<void> => {
      if (!apdId || oldValue === newValue) return;

      const change: FieldChange = {
        id: `${apdId}-${fieldPath}-${Date.now()}`,
        fieldPath,
        fieldLabel,
        oldValue,
        newValue,
        changeType: oldValue === undefined ? 'added' : 'modified',
        timestamp: new Date(),
        section,
      };

      // Store the change
      await storageService.storeFieldChange(change);

      // Update local state
      setChanges(prev => [change, ...prev]);

      // Notify callback
      if (onFieldChange) {
        onFieldChange(change);
      }
    },
    [apdId, onFieldChange]
  );

  const getChanges = useCallback(async (): Promise<FieldChange[]> => {
    if (!apdId) return [];

    const storedChanges = await storageService.getFieldChanges(apdId);
    setChanges(storedChanges);
    return storedChanges;
  }, [apdId]);

  const clearChanges = useCallback(async (): Promise<void> => {
    if (!apdId) return;

    await storageService.deleteFieldChanges(apdId);
    setChanges([]);
  }, [apdId]);

  return {
    changes,
    trackChange,
    getChanges,
    clearChanges,
  };
}
