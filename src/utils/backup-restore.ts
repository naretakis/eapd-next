/**
 * Backup and Restore Utilities
 *
 * This module provides comprehensive backup and restore functionality
 * for APD data, including version control and user data portability.
 */

import { storageService } from '../services/database';
import {
  APD,
  Project,
  APDVersion,
  APDWorkingCopy,
  FieldChange,
} from '../types/apd';
import { APDTemplate } from '../types/template';
import { BackupOptions, RestoreOptions } from '../types/database';

export interface BackupData {
  metadata: {
    version: string;
    exportDate: string;
    appVersion: string;
    totalAPDs: number;
    totalProjects: number;
    includesVersionHistory: boolean;
    includesWorkingCopies: boolean;
    includesSettings: boolean;
    timestamp: Date;
  };
  apds: APD[];
  apdVersions?: APDVersion[];
  workingCopies?: APDWorkingCopy[];
  fieldChanges?: FieldChange[];
  projects: Project[];
  templates: APDTemplate[];
  settings?: Record<string, unknown>;
}

export interface RestoreResult {
  success: boolean;
  imported: {
    apds: number;
    projects: number;
    templates: number;
    versions?: number;
    workingCopies?: number;
    settings?: number;
  };
  errors: string[];
  warnings: string[];
}

export interface BackupValidationResult {
  isValid: boolean;
  version: string;
  errors: string[];
  warnings: string[];
  metadata: BackupData['metadata'];
}

const CURRENT_BACKUP_VERSION = '1.0';
const SUPPORTED_VERSIONS = ['1.0'];

/**
 * Create a complete backup of all APD data
 */
export async function createBackup(options: BackupOptions = {}): Promise<Blob> {
  const opts = {
    includeVersionHistory: true,
    includeWorkingCopies: true,
    includeSettings: true,
    compress: false,
    ...options,
  };

  try {
    // Gather all data
    const apds = await getAllAPDsForBackup();
    const projects = await storageService.getAllProjects();
    const templates = await getAllTemplates();

    const backupData: BackupData = {
      metadata: {
        version: CURRENT_BACKUP_VERSION,
        exportDate: new Date().toISOString(),
        appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
        totalAPDs: apds.length,
        totalProjects: projects.length,
        includesVersionHistory: opts.includeVersionHistory,
        includesWorkingCopies: opts.includeWorkingCopies,
        includesSettings: opts.includeSettings,
        timestamp: new Date(),
      },
      apds,
      projects,
      templates,
    };

    // Add optional data
    if (opts.includeVersionHistory) {
      backupData.apdVersions = await getAllVersionsForBackup();
      backupData.fieldChanges = await getAllFieldChangesForBackup();
    }

    if (opts.includeWorkingCopies) {
      backupData.workingCopies = await getAllWorkingCopiesForBackup();
    }

    if (opts.includeSettings) {
      backupData.settings = await storageService.getAllSettings();
    }

    // Create blob
    const jsonString = JSON.stringify(backupData, null, opts.compress ? 0 : 2);
    return new Blob([jsonString], { type: 'application/json' });
  } catch (error) {
    throw new Error(`Failed to create backup: ${(error as Error).message}`);
  }
}

/**
 * Validate backup data before restore
 */
export function validateBackup(
  backupBlob: Blob
): Promise<BackupValidationResult> {
  return new Promise(resolve => {
    const reader = new FileReader();

    reader.onload = event => {
      try {
        const jsonString = event.target?.result as string;
        const backupData = JSON.parse(jsonString) as BackupData;

        const errors: string[] = [];
        const warnings: string[] = [];

        // Check version compatibility
        if (!backupData.metadata?.version) {
          errors.push('Backup file is missing version information');
        } else if (!SUPPORTED_VERSIONS.includes(backupData.metadata.version)) {
          errors.push(
            `Unsupported backup version: ${backupData.metadata.version}`
          );
        }

        // Check required fields
        if (!backupData.apds || !Array.isArray(backupData.apds)) {
          errors.push('Backup file is missing APD data');
        }

        if (!backupData.projects || !Array.isArray(backupData.projects)) {
          warnings.push('Backup file is missing project data');
        }

        if (!backupData.templates || !Array.isArray(backupData.templates)) {
          warnings.push('Backup file is missing template data');
        }

        // Validate APD structure
        if (backupData.apds) {
          backupData.apds.forEach((apd, index) => {
            if (!apd.id || !apd.type || !apd.metadata) {
              errors.push(`APD at index ${index} is missing required fields`);
            }
          });
        }

        resolve({
          isValid: errors.length === 0,
          version: backupData.metadata?.version || 'unknown',
          errors,
          warnings,
          metadata: backupData.metadata,
        });
      } catch (error) {
        resolve({
          isValid: false,
          version: 'unknown',
          errors: [`Failed to parse backup file: ${(error as Error).message}`],
          warnings: [],
          metadata: {
            version: 'unknown',
            exportDate: new Date().toISOString(),
            appVersion: 'unknown',
            totalAPDs: 0,
            totalProjects: 0,
            includesVersionHistory: false,
            includesWorkingCopies: false,
            includesSettings: false,
            timestamp: new Date(),
          },
        });
      }
    };

    reader.onerror = () => {
      resolve({
        isValid: false,
        version: 'unknown',
        errors: ['Failed to read backup file'],
        warnings: [],
        metadata: {
          version: 'unknown',
          exportDate: new Date().toISOString(),
          appVersion: 'unknown',
          totalAPDs: 0,
          totalProjects: 0,
          includesVersionHistory: false,
          includesWorkingCopies: false,
          includesSettings: false,
          timestamp: new Date(),
        },
      });
    };

    reader.readAsText(backupBlob);
  });
}

/**
 * Restore data from backup
 */
export async function restoreFromBackup(
  backupBlob: Blob,
  options: RestoreOptions = {}
): Promise<RestoreResult> {
  const opts = {
    overwriteExisting: false,
    preserveIds: true,
    validateData: true,
    ...options,
  };

  const result: RestoreResult = {
    success: false,
    imported: {
      apds: 0,
      projects: 0,
      templates: 0,
    },
    errors: [],
    warnings: [],
  };

  try {
    // Validate backup first
    if (opts.validateData) {
      const validation = await validateBackup(backupBlob);
      if (!validation.isValid) {
        result.errors = validation.errors;
        return result;
      }
      result.warnings = validation.warnings;
    }

    // Parse backup data
    const jsonString = await backupBlob.text();
    const backupData = JSON.parse(jsonString) as BackupData;

    // Restore APDs
    for (const apd of backupData.apds) {
      try {
        if (!opts.overwriteExisting) {
          const existing = await storageService.getAPD(apd.id);
          if (existing) {
            result.warnings.push(
              `Skipped existing APD: ${apd.metadata.projectName}`
            );
            continue;
          }
        }

        await storageService.storeAPD(apd);
        result.imported.apds++;
      } catch (error) {
        result.errors.push(
          `Failed to import APD ${apd.id}: ${(error as Error).message}`
        );
      }
    }

    // Restore projects
    for (const project of backupData.projects) {
      try {
        if (!opts.overwriteExisting) {
          const existing = await storageService.getProject(project.id);
          if (existing) {
            result.warnings.push(`Skipped existing project: ${project.name}`);
            continue;
          }
        }

        await storageService.storeProject(project);
        result.imported.projects++;
      } catch (error) {
        result.errors.push(
          `Failed to import project ${project.id}: ${(error as Error).message}`
        );
      }
    }

    // Restore templates
    for (const template of backupData.templates) {
      try {
        if (!opts.overwriteExisting) {
          const existing = await storageService.getTemplate(template.id);
          if (existing) {
            result.warnings.push(`Skipped existing template: ${template.name}`);
            continue;
          }
        }

        await storageService.storeTemplate(template);
        result.imported.templates++;
      } catch (error) {
        result.errors.push(
          `Failed to import template ${template.id}: ${(error as Error).message}`
        );
      }
    }

    // Restore version history if included
    if (backupData.apdVersions) {
      result.imported.versions = 0;
      for (const version of backupData.apdVersions) {
        try {
          await storageService.storeVersion(version);
          result.imported.versions++;
        } catch (error) {
          result.errors.push(
            `Failed to import version ${version.id}: ${(error as Error).message}`
          );
        }
      }
    }

    // Restore working copies if included
    if (backupData.workingCopies) {
      result.imported.workingCopies = 0;
      for (const workingCopy of backupData.workingCopies) {
        try {
          await storageService.storeWorkingCopy(workingCopy);
          result.imported.workingCopies++;
        } catch (error) {
          result.errors.push(
            `Failed to import working copy ${workingCopy.id}: ${(error as Error).message}`
          );
        }
      }
    }

    // Restore settings if included
    if (backupData.settings) {
      result.imported.settings = 0;
      for (const [key, value] of Object.entries(backupData.settings)) {
        try {
          if (!opts.overwriteExisting) {
            const existing = await storageService.getSetting(key);
            if (existing !== undefined) {
              continue;
            }
          }

          await storageService.setSetting(key, value);
          result.imported.settings++;
        } catch (error) {
          result.errors.push(
            `Failed to import setting ${key}: ${(error as Error).message}`
          );
        }
      }
    }

    result.success = result.errors.length === 0;
    return result;
  } catch (error) {
    result.errors.push(`Restore failed: ${(error as Error).message}`);
    return result;
  }
}

/**
 * Export specific APDs to a backup file
 */
export async function exportAPDs(
  apdIds: string[],
  options: BackupOptions = {}
): Promise<Blob> {
  const apds: APD[] = [];
  const projects: Project[] = [];
  const projectIds = new Set<string>();

  // Get specified APDs
  for (const apdId of apdIds) {
    const apd = await storageService.getAPD(apdId);
    if (apd) {
      apds.push(apd);
    }
  }

  // Get related projects
  const allProjects = await storageService.getAllProjects();
  for (const project of allProjects) {
    if (project.apdIds.some(id => apdIds.includes(id))) {
      projects.push(project);
      projectIds.add(project.id);
    }
  }

  const backupData: BackupData = {
    metadata: {
      version: CURRENT_BACKUP_VERSION,
      exportDate: new Date().toISOString(),
      appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      totalAPDs: apds.length,
      totalProjects: projects.length,
      includesVersionHistory: options.includeVersionHistory || false,
      includesWorkingCopies: options.includeWorkingCopies || false,
      includesSettings: false,
      timestamp: new Date(),
    },
    apds,
    projects,
    templates: [], // Don't include templates in partial exports
  };

  const jsonString = JSON.stringify(backupData, null, 2);
  return new Blob([jsonString], { type: 'application/json' });
}

/**
 * Generate a filename for backup files
 */
export function generateBackupFilename(prefix: string = 'eapd-backup'): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  return `${prefix}-${timestamp}.json`;
}

// Helper functions for gathering data

async function getAllAPDsForBackup(): Promise<APD[]> {
  const apdList = await storageService.getAllAPDs();
  const apds: APD[] = [];

  for (const apdItem of apdList) {
    const apd = await storageService.getAPD(apdItem.id);
    if (apd) {
      apds.push(apd);
    }
  }

  return apds;
}

async function getAllVersionsForBackup(): Promise<APDVersion[]> {
  const versions: APDVersion[] = [];
  const apdList = await storageService.getAllAPDs();

  for (const apdItem of apdList) {
    const apdVersions = await storageService.getVersionHistory(apdItem.id);
    versions.push(...apdVersions);
  }

  return versions;
}

async function getAllFieldChangesForBackup(): Promise<FieldChange[]> {
  const changes: FieldChange[] = [];
  const apdList = await storageService.getAllAPDs();

  for (const apdItem of apdList) {
    const apdChanges = await storageService.getFieldChanges(apdItem.id);
    changes.push(...apdChanges);
  }

  return changes;
}

async function getAllWorkingCopiesForBackup(): Promise<APDWorkingCopy[]> {
  const workingCopies: APDWorkingCopy[] = [];
  const apdList = await storageService.getAllAPDs();

  for (const apdItem of apdList) {
    const workingCopy = await storageService.getWorkingCopy(apdItem.id);
    if (workingCopy) {
      workingCopies.push(workingCopy);
    }
  }

  return workingCopies;
}

async function getAllTemplates(): Promise<APDTemplate[]> {
  const templates: APDTemplate[] = [];
  const types = ['PAPD', 'IAPD', 'OAPD', 'AoA', 'Acquisition Checklist'];

  for (const type of types) {
    const typeTemplates = await storageService.getTemplatesByType(type);
    templates.push(...typeTemplates);
  }

  return templates;
}
