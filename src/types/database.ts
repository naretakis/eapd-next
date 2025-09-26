/**
 * Database Schema and Service Interfaces
 *
 * This file contains all the TypeScript interfaces for IndexedDB schema,
 * storage operations, and database service definitions.
 *
 * Based on the design document specifications for eAPD-Next application.
 */

import {
  APD,
  APDVersion,
  APDWorkingCopy,
  FieldChange,
  Project,
  APDListItem,
} from './apd';
import { APDTemplate } from './template';

// IndexedDB Schema Definition
export interface APDDatabase {
  // Main APD storage
  apds: {
    key: string; // APD ID
    value: APD;
    indexes: {
      type: string;
      projectName: string;
      lastModified: Date;
      currentVersion: string;
    };
  };

  // Version history storage
  apdVersions: {
    key: string; // Version ID
    value: APDVersion;
    indexes: {
      apdId: string;
      versionNumber: string;
      timestamp: Date;
      author: string;
    };
  };

  // Working copies (uncommitted changes)
  workingCopies: {
    key: string; // APD ID (one working copy per APD)
    value: APDWorkingCopy;
    indexes: {
      apdId: string;
      baseVersionId: string;
      lastModified: Date;
      hasUncommittedChanges: boolean;
    };
  };

  // Field-level change tracking
  fieldChanges: {
    key: string; // Change ID
    value: FieldChange;
    indexes: {
      apdId: string;
      versionId: string;
      fieldPath: string;
      timestamp: Date;
      changeType: string;
    };
  };

  // Project grouping
  projects: {
    key: string; // Project ID
    value: Project;
    indexes: {
      name: string;
      createdAt: Date;
    };
  };

  // Template storage
  templates: {
    key: string; // Template ID
    value: APDTemplate;
    indexes: {
      type: string;
      version: string;
    };
  };

  // Application settings
  settings: {
    key: string; // Setting key
    value: any;
  };
}

// Storage Service Interface
export interface StorageService {
  // Database lifecycle
  initialize(): Promise<void>;
  close(): Promise<void>;
  clear(): Promise<void>;

  // APD operations
  storeAPD(apd: APD): Promise<void>;
  getAPD(id: string): Promise<APD | null>;
  updateAPD(apd: APD): Promise<void>;
  deleteAPD(id: string): Promise<void>;
  getAllAPDs(): Promise<APDListItem[]>;

  // Version control operations
  storeVersion(version: APDVersion): Promise<void>;
  getVersion(versionId: string): Promise<APDVersion | null>;
  getVersionHistory(apdId: string): Promise<APDVersion[]>;
  deleteVersion(versionId: string): Promise<void>;

  // Working copy operations
  storeWorkingCopy(workingCopy: APDWorkingCopy): Promise<void>;
  getWorkingCopy(apdId: string): Promise<APDWorkingCopy | null>;
  updateWorkingCopy(workingCopy: APDWorkingCopy): Promise<void>;
  deleteWorkingCopy(apdId: string): Promise<void>;

  // Change tracking operations
  storeFieldChange(change: FieldChange): Promise<void>;
  getFieldChanges(apdId: string): Promise<FieldChange[]>;
  getFieldChangesByVersion(versionId: string): Promise<FieldChange[]>;
  deleteFieldChanges(apdId: string): Promise<void>;

  // Project operations
  storeProject(project: Project): Promise<void>;
  getProject(id: string): Promise<Project | null>;
  updateProject(project: Project): Promise<void>;
  deleteProject(id: string): Promise<void>;
  getAllProjects(): Promise<Project[]>;

  // Template operations
  storeTemplate(template: APDTemplate): Promise<void>;
  getTemplate(id: string): Promise<APDTemplate | null>;
  getTemplatesByType(type: string): Promise<APDTemplate[]>;
  updateTemplate(template: APDTemplate): Promise<void>;
  deleteTemplate(id: string): Promise<void>;

  // Settings operations
  setSetting(key: string, value: any): Promise<void>;
  getSetting(key: string): Promise<any>;
  deleteSetting(key: string): Promise<void>;
  getAllSettings(): Promise<Record<string, any>>;

  // Backup and restore
  exportData(): Promise<Blob>;
  importData(data: Blob): Promise<void>;

  // Storage management
  getStorageQuota(): Promise<StorageQuota>;
  cleanupOldData(olderThanDays: number): Promise<void>;
}

// Storage Quota Information
export interface StorageQuota {
  quota: number;
  usage: number;
  available: number;
  percentUsed: number;
}

// Database Migration Interface
export interface DatabaseMigration {
  version: number;
  description: string;
  migrate(db: any): Promise<void>;
}

// Error Types
export class StorageError extends Error {
  constructor(
    message: string,
    public code: StorageErrorCode,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'StorageError';
  }
}

export enum StorageErrorCode {
  DATABASE_NOT_INITIALIZED = 'DATABASE_NOT_INITIALIZED',
  ITEM_NOT_FOUND = 'ITEM_NOT_FOUND',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  MIGRATION_FAILED = 'MIGRATION_FAILED',
  IMPORT_FAILED = 'IMPORT_FAILED',
  EXPORT_FAILED = 'EXPORT_FAILED',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

// Database Configuration
export interface DatabaseConfig {
  name: string;
  version: number;
  migrations: DatabaseMigration[];
  enableLogging?: boolean;
  quotaWarningThreshold?: number; // Percentage (0-100)
}

// Transaction Options
export interface TransactionOptions {
  mode?: 'readonly' | 'readwrite';
  durability?: 'default' | 'strict' | 'relaxed';
  timeout?: number;
}

// Query Options
export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  filter?: Record<string, any>;
}

// Backup/Restore Options
export interface BackupOptions {
  includeVersionHistory?: boolean;
  includeWorkingCopies?: boolean;
  includeSettings?: boolean;
  compress?: boolean;
}

export interface RestoreOptions {
  overwriteExisting?: boolean;
  preserveIds?: boolean;
  validateData?: boolean;
}
