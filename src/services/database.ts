/**
 * IndexedDB Database Service Implementation
 *
 * This service provides a complete IndexedDB implementation using Dexie.js
 * for storing APD data, version control, and application settings.
 *
 * Features:
 * - APD storage with version control
 * - Change tracking and working copies
 * - Project grouping and templates
 * - Auto-migration and error handling
 * - Storage quota monitoring
 */

import Dexie, { Table } from 'dexie';
import {
  APD,
  APDVersion,
  APDWorkingCopy,
  FieldChange,
  Project,
  APDListItem,
} from '../types/apd';
import { APDTemplate } from '../types/template';
import {
  StorageService,
  StorageQuota,
  StorageError,
  StorageErrorCode,
  DatabaseConfig,
} from '../types/database';

/**
 * Main Database Class extending Dexie
 */
export class APDDatabase extends Dexie {
  // Table definitions
  apds!: Table<APD, string>;
  apdVersions!: Table<APDVersion, string>;
  workingCopies!: Table<APDWorkingCopy, string>;
  fieldChanges!: Table<FieldChange, string>;
  projects!: Table<Project, string>;
  templates!: Table<APDTemplate, string>;
  settings!: Table<{ key: string; value: any }, string>;

  constructor() {
    super('APDDatabase');

    // Define schema version 1
    this.version(1).stores({
      apds: 'id, type, metadata.projectName, updatedAt, currentVersion',
      apdVersions: 'id, apdId, versionNumber, timestamp, author',
      workingCopies:
        'apdId, baseVersionId, lastModified, hasUncommittedChanges',
      fieldChanges: 'id, apdId, versionId, fieldPath, timestamp, changeType',
      projects: 'id, name, createdAt',
      templates: 'id, type, version',
      settings: 'key',
    });

    // Add hooks for data validation and logging
    this.apds.hook('creating', (_primKey, obj, _trans) => {
      (obj as any).createdAt = (obj as any).createdAt || new Date();
      (obj as any).updatedAt = new Date();
    });

    this.apds.hook('updating', (modifications, _primKey, _obj, _trans) => {
      (modifications as any).updatedAt = new Date();
    });
  }
}

/**
 * Storage Service Implementation
 */
export class IndexedDBStorageService implements StorageService {
  private db: APDDatabase;
  private initialized = false;
  private config: DatabaseConfig;

  constructor(config?: Partial<DatabaseConfig>) {
    this.config = {
      name: 'APDDatabase',
      version: 1,
      migrations: [],
      enableLogging: false,
      quotaWarningThreshold: 80,
      ...config,
    };

    this.db = new APDDatabase();
  }

  /**
   * Initialize the database connection
   */
  async initialize(): Promise<void> {
    try {
      await this.db.open();
      this.initialized = true;

      if (this.config.enableLogging) {
        console.log('APD Database initialized successfully');
      }

      // Check storage quota
      const quota = await this.getStorageQuota();
      if (quota.percentUsed > this.config.quotaWarningThreshold!) {
        console.warn(`Storage quota warning: ${quota.percentUsed}% used`);
      }
    } catch (error) {
      throw new StorageError(
        'Failed to initialize database',
        StorageErrorCode.DATABASE_NOT_INITIALIZED,
        error as Error
      );
    }
  }

  /**
   * Close the database connection
   */
  async close(): Promise<void> {
    if (this.initialized) {
      this.db.close();
      this.initialized = false;
    }
  }

  /**
   * Clear all data from the database
   */
  async clear(): Promise<void> {
    this.ensureInitialized();

    try {
      await this.db.transaction('rw', this.db.tables, async () => {
        await Promise.all(this.db.tables.map(table => table.clear()));
      });
    } catch (error) {
      throw new StorageError(
        'Failed to clear database',
        StorageErrorCode.TRANSACTION_FAILED,
        error as Error
      );
    }
  }

  // APD Operations
  async storeAPD(apd: APD): Promise<void> {
    this.ensureInitialized();

    try {
      await this.db.apds.put(apd);
    } catch (error) {
      throw new StorageError(
        `Failed to store APD: ${apd.id}`,
        StorageErrorCode.TRANSACTION_FAILED,
        error as Error
      );
    }
  }

  async getAPD(id: string): Promise<APD | null> {
    this.ensureInitialized();

    try {
      const apd = await this.db.apds.get(id);
      return apd || null;
    } catch (error) {
      throw new StorageError(
        `Failed to get APD: ${id}`,
        StorageErrorCode.TRANSACTION_FAILED,
        error as Error
      );
    }
  }

  async updateAPD(apd: APD): Promise<void> {
    this.ensureInitialized();

    try {
      const existing = await this.db.apds.get(apd.id);
      if (!existing) {
        throw new StorageError(
          `APD not found: ${apd.id}`,
          StorageErrorCode.ITEM_NOT_FOUND
        );
      }

      await this.db.apds.put(apd);
    } catch (error) {
      if (error instanceof StorageError) throw error;

      throw new StorageError(
        `Failed to update APD: ${apd.id}`,
        StorageErrorCode.TRANSACTION_FAILED,
        error as Error
      );
    }
  }

  async deleteAPD(id: string): Promise<void> {
    this.ensureInitialized();

    try {
      await this.db.transaction(
        'rw',
        [
          this.db.apds,
          this.db.apdVersions,
          this.db.workingCopies,
          this.db.fieldChanges,
        ],
        async () => {
          // Delete APD and all related data
          await this.db.apds.delete(id);
          await this.db.apdVersions.where('apdId').equals(id).delete();
          await this.db.workingCopies.where('apdId').equals(id).delete();
          await this.db.fieldChanges.where('apdId').equals(id).delete();
        }
      );
    } catch (error) {
      throw new StorageError(
        `Failed to delete APD: ${id}`,
        StorageErrorCode.TRANSACTION_FAILED,
        error as Error
      );
    }
  }

  async getAllAPDs(): Promise<APDListItem[]> {
    this.ensureInitialized();

    try {
      const apds = await this.db.apds.toArray();

      return apds.map(apd => ({
        id: apd.id,
        type: apd.type,
        projectName: apd.metadata.projectName,
        lastModified: apd.updatedAt,
        completionStatus: this.calculateCompletionStatus(apd),
        isComplete:
          apd.validationState.isValid &&
          apd.validationState.errors.length === 0,
        currentVersion: apd.currentVersion,
        hasUncommittedChanges: apd.workingCopy?.hasUncommittedChanges || false,
      }));
    } catch (error) {
      throw new StorageError(
        'Failed to get all APDs',
        StorageErrorCode.TRANSACTION_FAILED,
        error as Error
      );
    }
  }

  // Version Control Operations
  async storeVersion(version: APDVersion): Promise<void> {
    this.ensureInitialized();

    try {
      await this.db.apdVersions.put(version);
    } catch (error) {
      throw new StorageError(
        `Failed to store version: ${version.id}`,
        StorageErrorCode.TRANSACTION_FAILED,
        error as Error
      );
    }
  }

  async getVersion(versionId: string): Promise<APDVersion | null> {
    this.ensureInitialized();

    try {
      const version = await this.db.apdVersions.get(versionId);
      return version || null;
    } catch (error) {
      throw new StorageError(
        `Failed to get version: ${versionId}`,
        StorageErrorCode.TRANSACTION_FAILED,
        error as Error
      );
    }
  }

  async getVersionHistory(apdId: string): Promise<APDVersion[]> {
    this.ensureInitialized();

    try {
      const versions = await this.db.apdVersions
        .where('apdId')
        .equals(apdId)
        .toArray();

      // Sort by timestamp, newest first
      versions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      return versions;
    } catch (error) {
      throw new StorageError(
        `Failed to get version history for APD: ${apdId}`,
        StorageErrorCode.TRANSACTION_FAILED,
        error as Error
      );
    }
  }

  async deleteVersion(versionId: string): Promise<void> {
    this.ensureInitialized();

    try {
      await this.db.apdVersions.delete(versionId);
    } catch (error) {
      throw new StorageError(
        `Failed to delete version: ${versionId}`,
        StorageErrorCode.TRANSACTION_FAILED,
        error as Error
      );
    }
  }

  // Working Copy Operations
  async storeWorkingCopy(workingCopy: APDWorkingCopy): Promise<void> {
    this.ensureInitialized();

    try {
      await this.db.workingCopies.put(workingCopy);
    } catch (error) {
      throw new StorageError(
        `Failed to store working copy for APD: ${workingCopy.apdId}`,
        StorageErrorCode.TRANSACTION_FAILED,
        error as Error
      );
    }
  }

  async getWorkingCopy(apdId: string): Promise<APDWorkingCopy | null> {
    this.ensureInitialized();

    try {
      const workingCopy = await this.db.workingCopies.get(apdId);
      return workingCopy || null;
    } catch (error) {
      throw new StorageError(
        `Failed to get working copy for APD: ${apdId}`,
        StorageErrorCode.TRANSACTION_FAILED,
        error as Error
      );
    }
  }

  async updateWorkingCopy(workingCopy: APDWorkingCopy): Promise<void> {
    this.ensureInitialized();

    try {
      await this.db.workingCopies.put(workingCopy);
    } catch (error) {
      throw new StorageError(
        `Failed to update working copy for APD: ${workingCopy.apdId}`,
        StorageErrorCode.TRANSACTION_FAILED,
        error as Error
      );
    }
  }

  async deleteWorkingCopy(apdId: string): Promise<void> {
    this.ensureInitialized();

    try {
      await this.db.workingCopies.delete(apdId);
    } catch (error) {
      throw new StorageError(
        `Failed to delete working copy for APD: ${apdId}`,
        StorageErrorCode.TRANSACTION_FAILED,
        error as Error
      );
    }
  }

  // Change Tracking Operations
  async storeFieldChange(change: FieldChange): Promise<void> {
    this.ensureInitialized();

    try {
      await this.db.fieldChanges.put(change);
    } catch (error) {
      throw new StorageError(
        `Failed to store field change: ${change.id}`,
        StorageErrorCode.TRANSACTION_FAILED,
        error as Error
      );
    }
  }

  async getFieldChanges(apdId: string): Promise<FieldChange[]> {
    this.ensureInitialized();

    try {
      const changes = await this.db.fieldChanges
        .where('apdId')
        .equals(apdId)
        .toArray();

      // Sort by timestamp, newest first
      changes.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      return changes;
    } catch (error) {
      throw new StorageError(
        `Failed to get field changes for APD: ${apdId}`,
        StorageErrorCode.TRANSACTION_FAILED,
        error as Error
      );
    }
  }

  async getFieldChangesByVersion(versionId: string): Promise<FieldChange[]> {
    this.ensureInitialized();

    try {
      const changes = await this.db.fieldChanges
        .where('versionId')
        .equals(versionId)
        .toArray();

      // Sort by timestamp
      changes.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      return changes;
    } catch (error) {
      throw new StorageError(
        `Failed to get field changes for version: ${versionId}`,
        StorageErrorCode.TRANSACTION_FAILED,
        error as Error
      );
    }
  }

  async deleteFieldChanges(apdId: string): Promise<void> {
    this.ensureInitialized();

    try {
      await this.db.fieldChanges.where('apdId').equals(apdId).delete();
    } catch (error) {
      throw new StorageError(
        `Failed to delete field changes for APD: ${apdId}`,
        StorageErrorCode.TRANSACTION_FAILED,
        error as Error
      );
    }
  }

  // Project Operations
  async storeProject(project: Project): Promise<void> {
    this.ensureInitialized();

    try {
      await this.db.projects.put(project);
    } catch (error) {
      throw new StorageError(
        `Failed to store project: ${project.id}`,
        StorageErrorCode.TRANSACTION_FAILED,
        error as Error
      );
    }
  }

  async getProject(id: string): Promise<Project | null> {
    this.ensureInitialized();

    try {
      const project = await this.db.projects.get(id);
      return project || null;
    } catch (error) {
      throw new StorageError(
        `Failed to get project: ${id}`,
        StorageErrorCode.TRANSACTION_FAILED,
        error as Error
      );
    }
  }

  async updateProject(project: Project): Promise<void> {
    this.ensureInitialized();

    try {
      await this.db.projects.put(project);
    } catch (error) {
      throw new StorageError(
        `Failed to update project: ${project.id}`,
        StorageErrorCode.TRANSACTION_FAILED,
        error as Error
      );
    }
  }

  async deleteProject(id: string): Promise<void> {
    this.ensureInitialized();

    try {
      await this.db.projects.delete(id);
    } catch (error) {
      throw new StorageError(
        `Failed to delete project: ${id}`,
        StorageErrorCode.TRANSACTION_FAILED,
        error as Error
      );
    }
  }

  async getAllProjects(): Promise<Project[]> {
    this.ensureInitialized();

    try {
      const projects = await this.db.projects.orderBy('name').toArray();
      return projects;
    } catch (error) {
      throw new StorageError(
        'Failed to get all projects',
        StorageErrorCode.TRANSACTION_FAILED,
        error as Error
      );
    }
  }

  // Template Operations
  async storeTemplate(template: APDTemplate): Promise<void> {
    this.ensureInitialized();

    try {
      await this.db.templates.put(template);
    } catch (error) {
      throw new StorageError(
        `Failed to store template: ${template.id}`,
        StorageErrorCode.TRANSACTION_FAILED,
        error as Error
      );
    }
  }

  async getTemplate(id: string): Promise<APDTemplate | null> {
    this.ensureInitialized();

    try {
      const template = await this.db.templates.get(id);
      return template || null;
    } catch (error) {
      throw new StorageError(
        `Failed to get template: ${id}`,
        StorageErrorCode.TRANSACTION_FAILED,
        error as Error
      );
    }
  }

  async getTemplatesByType(type: string): Promise<APDTemplate[]> {
    this.ensureInitialized();

    try {
      const templates = await this.db.templates
        .where('type')
        .equals(type)
        .toArray();

      return templates;
    } catch (error) {
      throw new StorageError(
        `Failed to get templates by type: ${type}`,
        StorageErrorCode.TRANSACTION_FAILED,
        error as Error
      );
    }
  }

  async updateTemplate(template: APDTemplate): Promise<void> {
    this.ensureInitialized();

    try {
      await this.db.templates.put(template);
    } catch (error) {
      throw new StorageError(
        `Failed to update template: ${template.id}`,
        StorageErrorCode.TRANSACTION_FAILED,
        error as Error
      );
    }
  }

  async deleteTemplate(id: string): Promise<void> {
    this.ensureInitialized();

    try {
      await this.db.templates.delete(id);
    } catch (error) {
      throw new StorageError(
        `Failed to delete template: ${id}`,
        StorageErrorCode.TRANSACTION_FAILED,
        error as Error
      );
    }
  }

  // Settings Operations
  async setSetting(key: string, value: any): Promise<void> {
    this.ensureInitialized();

    try {
      await this.db.settings.put({ key, value });
    } catch (error) {
      throw new StorageError(
        `Failed to set setting: ${key}`,
        StorageErrorCode.TRANSACTION_FAILED,
        error as Error
      );
    }
  }

  async getSetting(key: string): Promise<any> {
    this.ensureInitialized();

    try {
      const setting = await this.db.settings.get(key);
      return setting?.value;
    } catch (error) {
      throw new StorageError(
        `Failed to get setting: ${key}`,
        StorageErrorCode.TRANSACTION_FAILED,
        error as Error
      );
    }
  }

  async deleteSetting(key: string): Promise<void> {
    this.ensureInitialized();

    try {
      await this.db.settings.delete(key);
    } catch (error) {
      throw new StorageError(
        `Failed to delete setting: ${key}`,
        StorageErrorCode.TRANSACTION_FAILED,
        error as Error
      );
    }
  }

  async getAllSettings(): Promise<Record<string, any>> {
    this.ensureInitialized();

    try {
      const settings = await this.db.settings.toArray();
      const result: Record<string, any> = {};

      settings.forEach(setting => {
        result[setting.key] = setting.value;
      });

      return result;
    } catch (error) {
      throw new StorageError(
        'Failed to get all settings',
        StorageErrorCode.TRANSACTION_FAILED,
        error as Error
      );
    }
  }

  // Backup and Restore
  async exportData(): Promise<Blob> {
    this.ensureInitialized();

    try {
      const data = {
        apds: await this.db.apds.toArray(),
        apdVersions: await this.db.apdVersions.toArray(),
        workingCopies: await this.db.workingCopies.toArray(),
        fieldChanges: await this.db.fieldChanges.toArray(),
        projects: await this.db.projects.toArray(),
        templates: await this.db.templates.toArray(),
        settings: await this.db.settings.toArray(),
        exportDate: new Date().toISOString(),
        version: this.config.version,
      };

      const jsonString = JSON.stringify(data, null, 2);
      return new Blob([jsonString], { type: 'application/json' });
    } catch (error) {
      throw new StorageError(
        'Failed to export data',
        StorageErrorCode.EXPORT_FAILED,
        error as Error
      );
    }
  }

  async importData(data: Blob): Promise<void> {
    this.ensureInitialized();

    try {
      const jsonString = await data.text();
      const importData = JSON.parse(jsonString);

      // Validate import data structure
      if (!importData.version || !importData.exportDate) {
        throw new Error('Invalid import data format');
      }

      // Import data in transaction
      await this.db.transaction('rw', this.db.tables, async () => {
        // Clear existing data
        await Promise.all(this.db.tables.map(table => table.clear()));

        // Import new data
        if (importData.apds) await this.db.apds.bulkAdd(importData.apds);
        if (importData.apdVersions)
          await this.db.apdVersions.bulkAdd(importData.apdVersions);
        if (importData.workingCopies)
          await this.db.workingCopies.bulkAdd(importData.workingCopies);
        if (importData.fieldChanges)
          await this.db.fieldChanges.bulkAdd(importData.fieldChanges);
        if (importData.projects)
          await this.db.projects.bulkAdd(importData.projects);
        if (importData.templates)
          await this.db.templates.bulkAdd(importData.templates);
        if (importData.settings)
          await this.db.settings.bulkAdd(importData.settings);
      });
    } catch (error) {
      throw new StorageError(
        'Failed to import data',
        StorageErrorCode.IMPORT_FAILED,
        error as Error
      );
    }
  }

  // Storage Management
  async getStorageQuota(): Promise<StorageQuota> {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const quota = estimate.quota || 0;
        const usage = estimate.usage || 0;
        const available = quota - usage;
        const percentUsed = quota > 0 ? Math.round((usage / quota) * 100) : 0;

        return {
          quota,
          usage,
          available,
          percentUsed,
        };
      }

      // Fallback for browsers without storage API
      return {
        quota: 0,
        usage: 0,
        available: 0,
        percentUsed: 0,
      };
    } catch (error) {
      throw new StorageError(
        'Failed to get storage quota',
        StorageErrorCode.UNKNOWN_ERROR,
        error as Error
      );
    }
  }

  async cleanupOldData(olderThanDays: number): Promise<void> {
    this.ensureInitialized();

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      await this.db.transaction(
        'rw',
        [this.db.fieldChanges, this.db.apdVersions],
        async () => {
          // Clean up old field changes
          await this.db.fieldChanges
            .where('timestamp')
            .below(cutoffDate)
            .delete();

          // Keep at least the last 5 versions for each APD
          const apds = await this.db.apds.toArray();

          for (const apd of apds) {
            const versions = await this.db.apdVersions
              .where('apdId')
              .equals(apd.id)
              .toArray();

            // Sort by timestamp, newest first
            versions.sort(
              (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
            );

            // Keep the 5 most recent versions, delete older ones
            const versionsToDelete = versions.slice(5);
            for (const version of versionsToDelete) {
              if (version.timestamp < cutoffDate) {
                await this.db.apdVersions.delete(version.id);
              }
            }
          }
        }
      );
    } catch (error) {
      throw new StorageError(
        'Failed to cleanup old data',
        StorageErrorCode.TRANSACTION_FAILED,
        error as Error
      );
    }
  }

  // Private helper methods
  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new StorageError(
        'Database not initialized. Call initialize() first.',
        StorageErrorCode.DATABASE_NOT_INITIALIZED
      );
    }
  }

  private calculateCompletionStatus(apd: APD): number {
    // Calculate completion percentage based on filled sections
    const totalSections = Object.keys(apd.sections).length;
    if (totalSections === 0) return 0;

    const completedSections = Object.values(apd.sections).filter(
      section => section.isComplete
    ).length;

    return Math.round((completedSections / totalSections) * 100);
  }
}

// Export singleton instance
let _storageService: IndexedDBStorageService | null = null;

export const getStorageService = (): IndexedDBStorageService => {
  if (!_storageService) {
    _storageService = new IndexedDBStorageService({
      enableLogging: process.env.NODE_ENV === 'development',
      quotaWarningThreshold: 80,
    });
  }
  return _storageService;
};

// For backward compatibility
export const storageService = getStorageService();
