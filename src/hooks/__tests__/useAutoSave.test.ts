/**
 * Auto-Save Hook Tests
 *
 * Tests for the useAutoSave hook functionality including debouncing,
 * error handling, and conflict resolution.
 */

import { renderHook, act } from '@testing-library/react';
import {
  useAutoSave,
  useWorkingCopyAutoSave,
  useFieldChangeTracking,
} from '../useAutoSave';
import { APD, APDWorkingCopy, FieldChange } from '../../types/apd';
import { storageService } from '../../services/database';

// Mock the storage service
jest.mock('../../services/database', () => ({
  storageService: {
    getAPD: jest.fn(),
    updateWorkingCopy: jest.fn(),
    storeFieldChange: jest.fn(),
    getFieldChanges: jest.fn(),
    deleteFieldChanges: jest.fn(),
  },
}));

// Mock timers
jest.useFakeTimers();

describe('useAutoSave', () => {
  const mockAPD: APD = {
    id: 'test-apd-1',
    type: 'PAPD',
    metadata: {
      stateName: 'Test State',
      stateAgency: 'Test Agency',
      primaryContact: {
        name: 'John Doe',
        title: 'Project Manager',
        email: 'john@test.gov',
        phone: '555-1234',
      },
      documentType: 'PAPD',
      benefitsMultiplePrograms: false,
      projectName: 'Test Project',
    },
    sections: {},
    validationState: {
      isValid: true,
      errors: [],
      warnings: [],
      lastValidated: new Date(),
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    currentVersion: 'v1.0',
    versions: [],
  };

  let mockOnSave: jest.Mock;

  beforeEach(() => {
    mockOnSave = jest.fn().mockResolvedValue(undefined);
    jest.clearAllMocks();
    jest.clearAllTimers();

    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.useFakeTimers();
  });

  it('should initialize with idle status', () => {
    const { result } = renderHook(() => useAutoSave(mockAPD, mockOnSave));

    expect(result.current[0].status).toBe('idle');
    expect(result.current[0].hasUnsavedChanges).toBe(false);
    expect(result.current[0].isOnline).toBe(true);
  });

  it('should debounce auto-save calls', async () => {
    const { result, rerender } = renderHook(
      ({ apd }) => useAutoSave(apd, mockOnSave, { debounceMs: 1000 }),
      { initialProps: { apd: mockAPD } }
    );

    // Update APD multiple times quickly
    const updatedAPD1 = { ...mockAPD, updatedAt: new Date() };
    const updatedAPD2 = { ...mockAPD, updatedAt: new Date() };
    const updatedAPD3 = { ...mockAPD, updatedAt: new Date() };

    rerender({ apd: updatedAPD1 });
    rerender({ apd: updatedAPD2 });
    rerender({ apd: updatedAPD3 });

    // Should mark as having unsaved changes
    expect(result.current[0].hasUnsavedChanges).toBe(true);

    // Should not have called save yet
    expect(mockOnSave).not.toHaveBeenCalled();

    // Fast-forward time to trigger debounced save
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Should have called save only once with the latest data
    await act(async () => {
      await Promise.resolve(); // Wait for async operations
    });

    expect(mockOnSave).toHaveBeenCalledTimes(1);
  });

  it('should handle manual save', async () => {
    const { result } = renderHook(() => useAutoSave(mockAPD, mockOnSave));

    await act(async () => {
      await result.current[1].save();
    });

    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'test-apd-1',
      })
    );
    expect(result.current[0].status).toBe('saved');
  });

  it('should handle save errors', async () => {
    const error = new Error('Save failed');
    mockOnSave.mockRejectedValue(error);

    const { result } = renderHook(() => useAutoSave(mockAPD, mockOnSave));

    await act(async () => {
      await result.current[1].save();
    });

    expect(result.current[0].status).toBe('error');
    expect(result.current[0].error).toBe('Save failed');
  });

  it('should retry failed saves', async () => {
    mockOnSave
      .mockRejectedValueOnce(new Error('First attempt failed'))
      .mockResolvedValueOnce(undefined);

    const { result } = renderHook(() =>
      useAutoSave(mockAPD, mockOnSave, { maxRetries: 1, retryDelayMs: 100 })
    );

    await act(async () => {
      await result.current[1].save();
    });

    expect(result.current[0].status).toBe('error');

    // Fast-forward to trigger retry
    act(() => {
      jest.advanceTimersByTime(100);
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockOnSave).toHaveBeenCalledTimes(2);
  });

  it('should handle conflict resolution', async () => {
    const conflictingAPD = {
      ...mockAPD,
      updatedAt: new Date(Date.now() + 1000),
    };
    (storageService.getAPD as jest.Mock).mockResolvedValue(conflictingAPD);

    const { result } = renderHook(() =>
      useAutoSave(mockAPD, mockOnSave, { enableConflictResolution: true })
    );

    await act(async () => {
      await result.current[1].save();
    });

    expect(result.current[0].status).toBe('conflict');
    expect(result.current[0].error).toContain('Another user has modified');
  });

  it('should not save when offline', () => {
    Object.defineProperty(navigator, 'onLine', {
      value: false,
    });

    const { result, rerender } = renderHook(
      ({ apd }) => useAutoSave(apd, mockOnSave),
      { initialProps: { apd: mockAPD } }
    );

    expect(result.current[0].isOnline).toBe(false);

    // Update APD
    const updatedAPD = { ...mockAPD, updatedAt: new Date() };
    rerender({ apd: updatedAPD });

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    // Should not have called save
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('should clear errors', () => {
    const { result } = renderHook(() => useAutoSave(mockAPD, mockOnSave));

    // Simulate error state
    act(() => {
      (result.current[0] as any).error = 'Test error';
      (result.current[0] as any).status = 'error';
    });

    act(() => {
      result.current[1].clearError();
    });

    expect(result.current[0].error).toBeUndefined();
    expect(result.current[0].status).toBe('idle');
  });
});

describe('useWorkingCopyAutoSave', () => {
  const mockWorkingCopy: APDWorkingCopy = {
    id: 'working-copy-1',
    apdId: 'test-apd-1',
    baseVersionId: 'version-1',
    sections: {},
    changes: [],
    lastModified: new Date(),
    hasUncommittedChanges: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (storageService.updateWorkingCopy as jest.Mock).mockResolvedValue(
      undefined
    );
  });

  it('should auto-save working copy changes', async () => {
    const { rerender } = renderHook(
      ({ workingCopy }) => useWorkingCopyAutoSave('test-apd-1', workingCopy),
      { initialProps: { workingCopy: mockWorkingCopy } }
    );

    // Update working copy
    const updatedWorkingCopy = {
      ...mockWorkingCopy,
      lastModified: new Date(),
    };
    rerender({ workingCopy: updatedWorkingCopy });

    // Fast-forward time to trigger save
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(storageService.updateWorkingCopy).toHaveBeenCalled();
  });
});

describe('useFieldChangeTracking', () => {
  const mockChange: FieldChange = {
    id: 'change-1',
    fieldPath: 'sections.executive-summary.content.overview',
    fieldLabel: 'Project Overview',
    oldValue: 'Old value',
    newValue: 'New value',
    changeType: 'modified',
    timestamp: new Date(),
    section: 'executive-summary',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (storageService.storeFieldChange as jest.Mock).mockResolvedValue(undefined);
    (storageService.getFieldChanges as jest.Mock).mockResolvedValue([
      mockChange,
    ]);
    (storageService.deleteFieldChanges as jest.Mock).mockResolvedValue(
      undefined
    );
  });

  it('should track field changes', async () => {
    const mockOnFieldChange = jest.fn();
    const { result } = renderHook(() =>
      useFieldChangeTracking('test-apd-1', mockOnFieldChange)
    );

    await act(async () => {
      await result.current.trackChange(
        'sections.executive-summary.content.overview',
        'Project Overview',
        'Old value',
        'New value',
        'executive-summary'
      );
    });

    expect(storageService.storeFieldChange).toHaveBeenCalled();
    expect(mockOnFieldChange).toHaveBeenCalled();
    expect(result.current.changes).toHaveLength(1);
  });

  it('should not track changes for same values', async () => {
    const { result } = renderHook(() => useFieldChangeTracking('test-apd-1'));

    await act(async () => {
      await result.current.trackChange(
        'sections.executive-summary.content.overview',
        'Project Overview',
        'Same value',
        'Same value',
        'executive-summary'
      );
    });

    expect(storageService.storeFieldChange).not.toHaveBeenCalled();
  });

  it('should get changes from storage', async () => {
    const { result } = renderHook(() => useFieldChangeTracking('test-apd-1'));

    await act(async () => {
      await result.current.getChanges();
    });

    expect(storageService.getFieldChanges).toHaveBeenCalledWith('test-apd-1');
    expect(result.current.changes).toEqual([mockChange]);
  });

  it('should clear changes', async () => {
    const { result } = renderHook(() => useFieldChangeTracking('test-apd-1'));

    // First add some changes
    await act(async () => {
      await result.current.getChanges();
    });

    expect(result.current.changes).toHaveLength(1);

    // Then clear them
    await act(async () => {
      await result.current.clearChanges();
    });

    expect(storageService.deleteFieldChanges).toHaveBeenCalledWith(
      'test-apd-1'
    );
    expect(result.current.changes).toHaveLength(0);
  });
});
