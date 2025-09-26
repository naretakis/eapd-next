/**
 * Storage Layer Demo Script
 *
 * This script demonstrates the storage layer functionality for development
 * and testing purposes. It provides comprehensive examples of how to use
 * the APD storage services.
 *
 * @example
 * ```typescript
 * import { runCompleteDemo } from './testing/storage-demo';
 *
 * // Run all demos
 * runCompleteDemo().then(results => {
 *   console.log('Demo completed:', results);
 * });
 * ```
 */

import { storageService } from '../services/database';
import { apdService } from '../services/apdService';
import { versionControlService } from '../services/versionControlService';
import { initializeDatabase } from '../utils/database-init';

/**
 * Demo function to test basic storage operations
 */
export async function demoBasicStorage() {
  console.log('🚀 Starting Storage Layer Demo...');

  try {
    // 1. Initialize the database
    console.log('📦 Initializing database...');
    await initializeDatabase();
    console.log('✅ Database initialized successfully');

    // 2. Test APD creation
    console.log('📝 Creating a new APD...');
    const apd = await apdService.createAPD('PAPD', {
      stateName: 'Demo State',
      stateAgency: 'Demo Agency',
      projectName: 'Demo Project',
      primaryContact: {
        name: 'John Demo',
        title: 'Demo Manager',
        email: 'john@demo.gov',
        phone: '555-DEMO',
      },
    });
    console.log('✅ APD created:', apd.id);

    // 3. Test APD retrieval
    console.log('🔍 Retrieving APD...');
    const retrievedAPD = await apdService.getAPD(apd.id);
    console.log('✅ APD retrieved:', retrievedAPD?.metadata.projectName);

    // 4. Test working copy creation
    console.log('📋 Creating working copy...');
    const workingCopy = await versionControlService.getWorkingCopy(apd.id);
    console.log('✅ Working copy created:', workingCopy.id);

    // 5. Test version commit
    console.log('💾 Committing changes...');
    // First, make some changes to the working copy
    await versionControlService.updateWorkingCopy(apd.id, {
      sections: {
        'executive-summary': {
          sectionId: 'executive-summary',
          title: 'Executive Summary',
          content: { overview: 'Updated demo overview' },
          isComplete: true,
          lastModified: new Date(),
        },
      },
    });

    const version = await versionControlService.commitChanges(apd.id, {
      message: 'Demo commit',
      author: 'Demo User',
    });
    console.log('✅ Version committed:', version.versionNumber);

    // 6. Test project creation and APD association
    console.log('📁 Creating project...');
    const project = await apdService.createProject(
      'Demo Project Group',
      'A demo project for testing'
    );
    await apdService.addAPDToProject(apd.id, project.id);
    console.log('✅ Project created and APD associated:', project.name);

    // 7. Test storage quota
    console.log('💾 Checking storage quota...');
    const quota = await storageService.getStorageQuota();
    console.log('✅ Storage quota:', {
      used: `${quota.percentUsed}%`,
      available: `${Math.round(quota.available / 1024 / 1024)}MB`,
    });

    console.log('🎉 Demo completed successfully!');
    return {
      apdId: apd.id,
      projectId: project.id,
      versionId: version.id,
      quota,
    };
  } catch (error) {
    console.error('❌ Demo failed:', error);
    throw error;
  }
}

/**
 * Demo function to test advanced features
 */
export async function demoAdvancedFeatures(apdId: string) {
  console.log('🔬 Starting Advanced Features Demo...');

  try {
    // 1. Test APD validation
    console.log('✅ Testing APD validation...');
    const apd = await apdService.getAPD(apdId);
    if (apd) {
      const validationResult = await apdService.validateAPD(apd);
      console.log('✅ Validation result:', {
        isValid: validationResult.isValid,
        errorCount: validationResult.errors.length,
        warningCount: validationResult.warnings.length,
      });
    }

    // 2. Test version history
    console.log('📚 Testing version history...');
    const versions = await versionControlService.getVersionHistory(apdId);
    console.log(
      '✅ Version history:',
      versions.map(v => ({
        version: v.versionNumber,
        message: v.commitMessage,
        author: v.author,
      }))
    );

    // 3. Test APD duplication
    console.log('📄 Testing APD duplication...');
    const duplicatedAPD = await apdService.duplicateAPD(apdId, {
      projectName: 'Duplicated Demo Project',
    });
    console.log('✅ APD duplicated:', duplicatedAPD.id);

    // 4. Test completion statistics
    console.log('📊 Testing completion statistics...');
    const stats = await apdService.getCompletionStats();
    console.log('✅ Completion stats:', stats);

    // 5. Test backup/restore
    console.log('💾 Testing backup...');
    const backupBlob = await storageService.exportData();
    console.log(
      '✅ Backup created:',
      `${Math.round(backupBlob.size / 1024)}KB`
    );

    console.log('🎉 Advanced demo completed successfully!');
    return {
      duplicatedAPDId: duplicatedAPD.id,
      backupSize: backupBlob.size,
      stats,
    };
  } catch (error) {
    console.error('❌ Advanced demo failed:', error);
    throw error;
  }
}

/**
 * Demo function to test error handling
 */
export async function demoErrorHandling() {
  console.log('⚠️ Starting Error Handling Demo...');

  try {
    // 1. Test non-existent APD retrieval
    console.log('🔍 Testing non-existent APD retrieval...');
    const nonExistentAPD = await apdService.getAPD('non-existent-id');
    console.log('✅ Non-existent APD result:', nonExistentAPD); // Should be null

    // 2. Test invalid APD update
    console.log('📝 Testing invalid APD update...');
    try {
      await storageService.updateAPD({
        id: 'non-existent',
        type: 'PAPD',
        metadata: {} as any,
        sections: {},
        validationState: {} as any,
        createdAt: new Date(),
        updatedAt: new Date(),
        currentVersion: 'v1.0',
        versions: [],
      });
    } catch (error) {
      console.log('✅ Expected error caught:', (error as Error).message);
    }

    // 3. Test storage quota when full (simulated)
    console.log('💾 Testing storage management...');
    await storageService.cleanupOldData(30); // Clean up data older than 30 days
    console.log('✅ Cleanup completed');

    console.log('🎉 Error handling demo completed successfully!');
  } catch (error) {
    console.error('❌ Error handling demo failed:', error);
    throw error;
  }
}

/**
 * Complete demo runner
 */
export async function runCompleteDemo() {
  console.log('🎬 Starting Complete Storage Demo...');

  try {
    const basicResults = await demoBasicStorage();
    const advancedResults = await demoAdvancedFeatures(basicResults.apdId);
    await demoErrorHandling();

    console.log('🏆 Complete demo finished successfully!');
    console.log('📊 Final Results:', {
      ...basicResults,
      ...advancedResults,
    });

    return { basicResults, advancedResults };
  } catch (error) {
    console.error('💥 Complete demo failed:', error);
    throw error;
  }
}
