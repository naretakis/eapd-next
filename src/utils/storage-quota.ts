/**
 * Storage Quota Management Utilities
 *
 * This module provides utilities for monitoring and managing IndexedDB
 * storage quota, including cleanup strategies and user notifications.
 */

import React from 'react';
import { storageService } from '../services/database';
import { StorageQuota } from '../types/database';

export interface QuotaWarning {
  level: 'info' | 'warning' | 'critical';
  message: string;
  percentUsed: number;
  suggestedActions: string[];
}

export interface CleanupOptions {
  deleteOldVersions?: boolean;
  deleteOldChanges?: boolean;
  compressData?: boolean;
  maxVersionsPerAPD?: number;
  maxChangeHistoryDays?: number;
}

const DEFAULT_CLEANUP_OPTIONS: Required<CleanupOptions> = {
  deleteOldVersions: true,
  deleteOldChanges: true,
  compressData: false,
  maxVersionsPerAPD: 10,
  maxChangeHistoryDays: 90,
};

/**
 * Get current storage quota information
 */
export async function getStorageQuotaInfo(): Promise<StorageQuota> {
  return await storageService.getStorageQuota();
}

/**
 * Check if storage quota warning should be shown
 */
export function getQuotaWarning(quota: StorageQuota): QuotaWarning | null {
  const { percentUsed } = quota;

  if (percentUsed >= 95) {
    return {
      level: 'critical',
      message: 'Storage space is critically low. Immediate action required.',
      percentUsed,
      suggestedActions: [
        'Delete old APD versions',
        'Remove unused APDs',
        'Clear change history',
        'Export and backup data',
      ],
    };
  }

  if (percentUsed >= 85) {
    return {
      level: 'warning',
      message: 'Storage space is running low. Consider cleaning up old data.',
      percentUsed,
      suggestedActions: [
        'Review and delete old APD versions',
        'Clean up change history older than 90 days',
        'Export data for backup',
      ],
    };
  }

  if (percentUsed >= 70) {
    return {
      level: 'info',
      message: 'Storage usage is moderate. Regular cleanup recommended.',
      percentUsed,
      suggestedActions: ['Enable automatic cleanup', 'Review storage settings'],
    };
  }

  return null;
}

/**
 * Perform automatic cleanup based on options
 */
export async function performCleanup(options: CleanupOptions = {}): Promise<{
  success: boolean;
  spaceSaved: number;
  errors: string[];
}> {
  const opts = { ...DEFAULT_CLEANUP_OPTIONS, ...options };
  const errors: string[] = [];
  let spaceSaved = 0;

  try {
    const quotaBefore = await getStorageQuotaInfo();

    // Clean up old field changes
    if (opts.deleteOldChanges) {
      try {
        await storageService.cleanupOldData(opts.maxChangeHistoryDays);
      } catch (error) {
        errors.push(
          `Failed to clean up old changes: ${(error as Error).message}`
        );
      }
    }

    // Clean up old versions
    if (opts.deleteOldVersions) {
      try {
        await cleanupOldVersions(opts.maxVersionsPerAPD);
      } catch (error) {
        errors.push(
          `Failed to clean up old versions: ${(error as Error).message}`
        );
      }
    }

    const quotaAfter = await getStorageQuotaInfo();
    spaceSaved = quotaBefore.usage - quotaAfter.usage;

    return {
      success: errors.length === 0,
      spaceSaved,
      errors,
    };
  } catch (error) {
    errors.push(`Cleanup failed: ${(error as Error).message}`);
    return {
      success: false,
      spaceSaved: 0,
      errors,
    };
  }
}

/**
 * Clean up old APD versions, keeping only the most recent ones
 */
async function cleanupOldVersions(maxVersionsPerAPD: number): Promise<void> {
  const apds = await storageService.getAllAPDs();

  for (const apd of apds) {
    const versions = await storageService.getVersionHistory(apd.id);

    // Sort by timestamp, newest first
    const sortedVersions = versions.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );

    // Delete versions beyond the limit
    const versionsToDelete = sortedVersions.slice(maxVersionsPerAPD);

    for (const version of versionsToDelete) {
      await storageService.deleteVersion(version.id);
    }
  }
}

/**
 * Get storage usage breakdown by data type
 */
export async function getStorageBreakdown(): Promise<{
  apds: number;
  versions: number;
  workingCopies: number;
  changes: number;
  templates: number;
  settings: number;
  total: number;
}> {
  // This is an approximation since IndexedDB doesn't provide exact size per table
  const quota = await getStorageQuotaInfo();
  const totalUsage = quota.usage;

  // Estimate breakdown based on typical data sizes
  // These are rough estimates and could be improved with actual measurement
  const breakdown = {
    apds: Math.round(totalUsage * 0.4), // APDs typically largest
    versions: Math.round(totalUsage * 0.3), // Version history significant
    workingCopies: Math.round(totalUsage * 0.1), // Working copies moderate
    changes: Math.round(totalUsage * 0.15), // Change tracking moderate
    templates: Math.round(totalUsage * 0.03), // Templates small
    settings: Math.round(totalUsage * 0.02), // Settings very small
    total: totalUsage,
  };

  return breakdown;
}

/**
 * Monitor storage quota and trigger warnings/cleanup
 */
export class StorageQuotaMonitor {
  private checkInterval: NodeJS.Timeout | null = null;
  private listeners: ((warning: QuotaWarning | null) => void)[] = [];

  constructor(
    private checkIntervalMs: number = 60000, // Check every minute
    private autoCleanupThreshold: number = 90 // Auto cleanup at 90%
  ) {}

  /**
   * Start monitoring storage quota
   */
  start(): void {
    if (this.checkInterval) return;

    this.checkInterval = setInterval(async () => {
      try {
        const quota = await getStorageQuotaInfo();
        const warning = getQuotaWarning(quota);

        // Notify listeners
        this.listeners.forEach(listener => listener(warning));

        // Auto cleanup if threshold exceeded
        if (quota.percentUsed >= this.autoCleanupThreshold) {
          console.log('Auto-cleanup triggered due to high storage usage');
          await performCleanup();
        }
      } catch (error) {
        console.error('Storage quota monitoring error:', error);
      }
    }, this.checkIntervalMs);
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Add listener for quota warnings
   */
  addListener(listener: (warning: QuotaWarning | null) => void): void {
    this.listeners.push(listener);
  }

  /**
   * Remove listener
   */
  removeListener(listener: (warning: QuotaWarning | null) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Perform immediate quota check
   */
  async checkNow(): Promise<QuotaWarning | null> {
    const quota = await getStorageQuotaInfo();
    return getQuotaWarning(quota);
  }
}

/**
 * Singleton quota monitor instance
 */
export const quotaMonitor = new StorageQuotaMonitor();

/**
 * Hook for React components to monitor storage quota
 */
export function useStorageQuota() {
  const [quota, setQuota] = React.useState<StorageQuota | null>(null);
  const [warning, setWarning] = React.useState<QuotaWarning | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;

    const updateQuota = async () => {
      try {
        const quotaInfo = await getStorageQuotaInfo();
        const quotaWarning = getQuotaWarning(quotaInfo);

        if (mounted) {
          setQuota(quotaInfo);
          setWarning(quotaWarning);
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to get storage quota:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Initial load
    updateQuota();

    // Set up monitoring
    quotaMonitor.addListener(setWarning);
    quotaMonitor.start();

    return () => {
      mounted = false;
      quotaMonitor.removeListener(setWarning);
    };
  }, []);

  const cleanup = React.useCallback(async (options?: CleanupOptions) => {
    return await performCleanup(options);
  }, []);

  return {
    quota,
    warning,
    loading,
    cleanup,
  };
}
