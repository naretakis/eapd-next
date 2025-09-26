/**
 * Database Initialization Utilities
 *
 * This module provides utilities for initializing the IndexedDB database,
 * handling migrations, and setting up default data.
 */

import { storageService } from '../services/database';
import { APDTemplate } from '../types/template';
import { StorageError, StorageErrorCode } from '../types/database';

/**
 * Initialize the database with default templates and settings
 */
export async function initializeDatabase(): Promise<void> {
  try {
    // Initialize the storage service
    await storageService.initialize();

    // Check if this is the first run
    const isFirstRun = await storageService.getSetting('initialized');

    if (!isFirstRun) {
      // Set up default data for first run
      await setupDefaultData();
      await storageService.setSetting('initialized', true);
      await storageService.setSetting('version', '1.0.0');
      await storageService.setSetting('lastCleanup', new Date().toISOString());
    }

    // Perform maintenance tasks
    await performMaintenanceTasks();

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw new StorageError(
      'Database initialization failed',
      StorageErrorCode.DATABASE_NOT_INITIALIZED,
      error as Error
    );
  }
}

/**
 * Set up default templates and settings
 */
async function setupDefaultData(): Promise<void> {
  // Create default PAPD template
  const papdTemplate: APDTemplate = {
    id: 'papd-template-v1',
    type: 'PAPD',
    version: '1.0',
    name: 'Planning APD Template',
    description: 'Standard template for Planning APDs',
    sections: [
      {
        id: 'executive-summary',
        title: 'Executive Summary',
        description: 'Project overview and intent',
        fields: [
          {
            id: 'project-overview',
            name: 'projectOverview',
            label: 'Project Overview',
            type: 'textarea',
            required: true,
            helpText:
              'Provide a high-level overview of the project and its objectives.',
            validation: [
              {
                type: 'required',
                message: 'Project overview is required',
              },
              {
                type: 'minLength',
                value: 100,
                message: 'Project overview must be at least 100 characters',
              },
            ],
          },
          {
            id: 'funding-type',
            name: 'fundingType',
            label: 'Funding Type',
            type: 'select',
            required: true,
            options: [
              {
                value: 'MMIS',
                label: 'MMIS (Medicaid Management Information System)',
              },
              { value: 'EE', label: 'E&E (Eligibility and Enrollment)' },
            ],
            helpText: 'Select the type of system this APD covers.',
          },
        ],
        isRequired: true,
        order: 1,
      },
      {
        id: 'project-management',
        title: 'Project Management Plan',
        description: 'Project organization and management approach',
        fields: [
          {
            id: 'project-manager',
            name: 'projectManager',
            label: 'Project Manager',
            type: 'text',
            required: true,
            helpText: 'Name and title of the project manager.',
          },
          {
            id: 'project-timeline',
            name: 'projectTimeline',
            label: 'Project Timeline',
            type: 'textarea',
            required: true,
            helpText: 'High-level project timeline and major milestones.',
          },
        ],
        isRequired: true,
        order: 2,
      },
    ],
    validationRules: [
      {
        type: 'required',
        message: 'All required fields must be completed',
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Create default IAPD template
  const iapdTemplate: APDTemplate = {
    id: 'iapd-template-v1',
    type: 'IAPD',
    version: '1.0',
    name: 'Implementation APD Template',
    description: 'Standard template for Implementation APDs',
    sections: [
      {
        id: 'executive-summary',
        title: 'Executive Summary',
        description: 'Project overview and implementation approach',
        fields: [
          {
            id: 'implementation-overview',
            name: 'implementationOverview',
            label: 'Implementation Overview',
            type: 'textarea',
            required: true,
            helpText: 'Describe the implementation approach and methodology.',
          },
        ],
        isRequired: true,
        order: 1,
      },
      {
        id: 'budget-tables',
        title: 'Budget Tables',
        description: 'Detailed project budget and cost breakdown',
        fields: [
          {
            id: 'personnel-costs',
            name: 'personnelCosts',
            label: 'Personnel Costs',
            type: 'table',
            required: true,
            columns: [
              {
                id: 'role',
                label: 'Role',
                type: 'text',
                required: true,
              },
              {
                id: 'hours',
                label: 'Hours',
                type: 'number',
                required: true,
              },
              {
                id: 'rate',
                label: 'Hourly Rate',
                type: 'currency',
                required: true,
              },
              {
                id: 'total',
                label: 'Total Cost',
                type: 'currency',
                calculation: {
                  formula: 'hours * rate',
                  dependsOn: ['hours', 'rate'],
                },
              },
            ],
            helpText: 'Enter personnel costs for the project.',
          },
        ],
        isRequired: true,
        order: 2,
      },
    ],
    validationRules: [
      {
        type: 'required',
        message: 'All required fields must be completed',
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Create default OAPD template
  const oapdTemplate: APDTemplate = {
    id: 'oapd-template-v1',
    type: 'OAPD',
    version: '1.0',
    name: 'Operational APD Template',
    description: 'Standard template for Operational APDs',
    sections: [
      {
        id: 'executive-summary',
        title: 'Executive Summary',
        description: 'Operational overview and maintenance activities',
        fields: [
          {
            id: 'operational-overview',
            name: 'operationalOverview',
            label: 'Operational Overview',
            type: 'textarea',
            required: true,
            helpText:
              'Describe the operational activities and maintenance approach.',
          },
        ],
        isRequired: true,
        order: 1,
      },
    ],
    validationRules: [
      {
        type: 'required',
        message: 'All required fields must be completed',
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Store default templates
  await storageService.storeTemplate(papdTemplate);
  await storageService.storeTemplate(iapdTemplate);
  await storageService.storeTemplate(oapdTemplate);

  // Set default application settings
  await storageService.setSetting('autoSaveInterval', 5000); // 5 seconds
  await storageService.setSetting('maxVersionHistory', 50);
  await storageService.setSetting('enableChangeTracking', true);
  await storageService.setSetting('theme', 'light');
  await storageService.setSetting('language', 'en');
}

/**
 * Perform routine maintenance tasks
 */
async function performMaintenanceTasks(): Promise<void> {
  try {
    // Check when last cleanup was performed
    const lastCleanup = await storageService.getSetting('lastCleanup');
    const now = new Date();
    const lastCleanupDate = lastCleanup ? new Date(lastCleanup) : new Date(0);

    // Perform cleanup if it's been more than 7 days
    const daysSinceCleanup = Math.floor(
      (now.getTime() - lastCleanupDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceCleanup >= 7) {
      // Clean up data older than 90 days
      await storageService.cleanupOldData(90);
      await storageService.setSetting('lastCleanup', now.toISOString());

      console.log('Database maintenance completed');
    }

    // Check storage quota
    const quota = await storageService.getStorageQuota();
    if (quota.percentUsed > 90) {
      console.warn('Storage quota critical: ' + quota.percentUsed + '% used');
      // Could trigger more aggressive cleanup here
    }
  } catch (error) {
    console.warn('Maintenance tasks failed:', error);
    // Don't throw error for maintenance failures
  }
}

/**
 * Reset database to initial state (for development/testing)
 */
export async function resetDatabase(): Promise<void> {
  try {
    await storageService.clear();
    await setupDefaultData();
    await storageService.setSetting('initialized', true);

    console.log('Database reset completed');
  } catch (error) {
    throw new StorageError(
      'Failed to reset database',
      StorageErrorCode.TRANSACTION_FAILED,
      error as Error
    );
  }
}

/**
 * Check database health and connectivity
 */
export async function checkDatabaseHealth(): Promise<{
  isHealthy: boolean;
  issues: string[];
  quota: any;
}> {
  const issues: string[] = [];
  let isHealthy = true;

  try {
    // Test basic connectivity
    await storageService.getAllSettings();

    // Check storage quota
    const quota = await storageService.getStorageQuota();
    if (quota.percentUsed > 95) {
      issues.push('Storage quota critically low');
      isHealthy = false;
    }

    // Test basic operations
    const testSetting = 'health-check-' + Date.now();
    await storageService.setSetting(testSetting, 'test');
    const retrieved = await storageService.getSetting(testSetting);
    await storageService.deleteSetting(testSetting);

    if (retrieved !== 'test') {
      issues.push('Basic read/write operations failing');
      isHealthy = false;
    }

    return {
      isHealthy,
      issues,
      quota,
    };
  } catch (error) {
    return {
      isHealthy: false,
      issues: ['Database connectivity failed: ' + (error as Error).message],
      quota: null,
    };
  }
}
