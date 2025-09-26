/**
 * Version Control Service for APD Management
 *
 * This service provides Git-like version control functionality for APDs,
 * including working copies, commits, version history, and change tracking.
 *
 * Features:
 * - Working copy management (uncommitted changes)
 * - Commit workflow with messages and automatic versioning
 * - Version history and comparison
 * - Change tracking at field level
 * - Revert and rollback capabilities
 */

import { v4 as uuidv4 } from 'uuid';
import {
  APD,
  APDVersion,
  APDWorkingCopy,
  FieldChange,
  VersionDiff,
  ChangeHighlight,
  InlineDiff,
  ChangeType,
} from '../types/apd';
import { storageService } from './database';
import { StorageError, StorageErrorCode } from '../types/database';

export interface CommitOptions {
  message: string;
  author: string;
  createNewVersion?: boolean;
}

export interface CompareOptions {
  showFieldChanges?: boolean;
  showSectionChanges?: boolean;
  includeMetadata?: boolean;
}

export interface RevertOptions {
  preserveWorkingCopy?: boolean;
  createBackup?: boolean;
}

/**
 * Version Control Service Implementation
 */
export class VersionControlService {
  /**
   * Get working copy for an APD (creates one if it doesn't exist)
   */
  async getWorkingCopy(apdId: string): Promise<APDWorkingCopy> {
    try {
      let workingCopy = await storageService.getWorkingCopy(apdId);

      if (!workingCopy) {
        // Create working copy from current APD state
        const apd = await storageService.getAPD(apdId);
        if (!apd) {
          throw new Error(`APD not found: ${apdId}`);
        }

        workingCopy = {
          id: uuidv4(),
          apdId,
          baseVersionId: apd.currentVersion,
          sections: { ...apd.sections },
          changes: [],
          lastModified: new Date(),
          hasUncommittedChanges: false,
        };

        await storageService.storeWorkingCopy(workingCopy);
      }

      return workingCopy;
    } catch (error) {
      throw new StorageError(
        `Failed to get working copy for APD: ${apdId}`,
        StorageErrorCode.TRANSACTION_FAILED,
        error as Error
      );
    }
  }

  /**
   * Update working copy with changes
   */
  async updateWorkingCopy(
    apdId: string,
    changes: Partial<APDWorkingCopy>
  ): Promise<APDWorkingCopy> {
    try {
      const workingCopy = await this.getWorkingCopy(apdId);

      const updatedWorkingCopy: APDWorkingCopy = {
        ...workingCopy,
        ...changes,
        lastModified: new Date(),
        hasUncommittedChanges: true,
      };

      await storageService.updateWorkingCopy(updatedWorkingCopy);
      return updatedWorkingCopy;
    } catch (error) {
      throw new StorageError(
        `Failed to update working copy for APD: ${apdId}`,
        StorageErrorCode.TRANSACTION_FAILED,
        error as Error
      );
    }
  }

  /**
   * Commit working copy changes to create a new version
   */
  async commitChanges(
    apdId: string,
    options: CommitOptions
  ): Promise<APDVersion> {
    try {
      const [apd, workingCopy] = await Promise.all([
        storageService.getAPD(apdId),
        this.getWorkingCopy(apdId),
      ]);

      if (!apd) {
        throw new Error(`APD not found: ${apdId}`);
      }

      if (!workingCopy.hasUncommittedChanges) {
        throw new Error('No uncommitted changes to commit');
      }

      // Generate new version number
      const versionHistory = await storageService.getVersionHistory(apdId);
      const newVersionNumber = this.generateNextVersionNumber(versionHistory);

      // Create version snapshot
      const version: APDVersion = {
        id: uuidv4(),
        apdId,
        versionNumber: newVersionNumber,
        commitMessage: options.message,
        author: options.author,
        timestamp: new Date(),
        sections: { ...workingCopy.sections },
        changesSinceLastVersion: [...workingCopy.changes],
        parentVersionId: apd.currentVersion,
      };

      // Store the version
      await storageService.storeVersion(version);

      // Update APD with new current version and working copy data
      const updatedAPD: APD = {
        ...apd,
        sections: { ...workingCopy.sections },
        currentVersion: version.id,
        updatedAt: new Date(),
      };

      await storageService.updateAPD(updatedAPD);

      // Reset working copy
      const resetWorkingCopy: APDWorkingCopy = {
        ...workingCopy,
        baseVersionId: version.id,
        changes: [],
        hasUncommittedChanges: false,
        lastModified: new Date(),
      };

      await storageService.updateWorkingCopy(resetWorkingCopy);

      return version;
    } catch (error) {
      throw new StorageError(
        `Failed to commit changes for APD: ${apdId}`,
        StorageErrorCode.TRANSACTION_FAILED,
        error as Error
      );
    }
  }

  /**
   * Get version history for an APD
   */
  async getVersionHistory(apdId: string): Promise<APDVersion[]> {
    try {
      return await storageService.getVersionHistory(apdId);
    } catch (error) {
      throw new StorageError(
        `Failed to get version history for APD: ${apdId}`,
        StorageErrorCode.TRANSACTION_FAILED,
        error as Error
      );
    }
  }

  /**
   * Get specific version by ID
   */
  async getVersion(versionId: string): Promise<APDVersion | null> {
    try {
      return await storageService.getVersion(versionId);
    } catch (error) {
      throw new StorageError(
        `Failed to get version: ${versionId}`,
        StorageErrorCode.TRANSACTION_FAILED,
        error as Error
      );
    }
  }

  /**
   * Compare two versions and generate diff
   */
  async compareVersions(
    _apdId: string,
    fromVersionId: string,
    toVersionId: string,
    _options: CompareOptions = {}
  ): Promise<VersionDiff> {
    try {
      const [fromVersion, toVersion] = await Promise.all([
        this.getVersion(fromVersionId),
        this.getVersion(toVersionId),
      ]);

      if (!fromVersion || !toVersion) {
        throw new Error('One or both versions not found');
      }

      const changes = this.detectChanges(
        fromVersion.sections,
        toVersion.sections
      );

      const sectionsModified = Array.from(
        new Set(changes.map(change => change.section))
      );

      return {
        fromVersion: fromVersionId,
        toVersion: toVersionId,
        changes,
        summary: {
          sectionsModified,
          fieldsAdded: changes.filter(c => c.changeType === 'added').length,
          fieldsModified: changes.filter(c => c.changeType === 'modified')
            .length,
          fieldsDeleted: changes.filter(c => c.changeType === 'deleted').length,
        },
      };
    } catch (error) {
      throw new StorageError(
        `Failed to compare versions: ${fromVersionId} -> ${toVersionId}`,
        StorageErrorCode.TRANSACTION_FAILED,
        error as Error
      );
    }
  }

  /**
   * Revert APD to a specific version
   */
  async revertToVersion(
    apdId: string,
    versionId: string,
    options: RevertOptions = {}
  ): Promise<APDWorkingCopy> {
    try {
      const [apd, targetVersion] = await Promise.all([
        storageService.getAPD(apdId),
        this.getVersion(versionId),
      ]);

      if (!apd || !targetVersion) {
        throw new Error('APD or target version not found');
      }

      // Create backup if requested
      if (options.createBackup) {
        await this.commitChanges(apdId, {
          message: `Backup before reverting to ${targetVersion.versionNumber}`,
          author: 'system',
        });
      }

      // Create new working copy from target version
      const workingCopy: APDWorkingCopy = {
        id: uuidv4(),
        apdId,
        baseVersionId: versionId,
        sections: { ...targetVersion.sections },
        changes: [],
        lastModified: new Date(),
        hasUncommittedChanges: !options.preserveWorkingCopy,
      };

      await storageService.storeWorkingCopy(workingCopy);

      // Update APD if not preserving working copy
      if (!options.preserveWorkingCopy) {
        const updatedAPD: APD = {
          ...apd,
          sections: { ...targetVersion.sections },
          updatedAt: new Date(),
        };

        await storageService.updateAPD(updatedAPD);
      }

      return workingCopy;
    } catch (error) {
      throw new StorageError(
        `Failed to revert APD to version: ${apdId} -> ${versionId}`,
        StorageErrorCode.TRANSACTION_FAILED,
        error as Error
      );
    }
  }

  /**
   * Create working copy from specific version (branching)
   */
  async createWorkingCopyFromVersion(
    apdId: string,
    versionId: string
  ): Promise<APDWorkingCopy> {
    try {
      const version = await this.getVersion(versionId);
      if (!version) {
        throw new Error(`Version not found: ${versionId}`);
      }

      const workingCopy: APDWorkingCopy = {
        id: uuidv4(),
        apdId,
        baseVersionId: versionId,
        sections: { ...version.sections },
        changes: [],
        lastModified: new Date(),
        hasUncommittedChanges: false,
      };

      await storageService.storeWorkingCopy(workingCopy);
      return workingCopy;
    } catch (error) {
      throw new StorageError(
        `Failed to create working copy from version: ${versionId}`,
        StorageErrorCode.TRANSACTION_FAILED,
        error as Error
      );
    }
  }

  /**
   * Get current changes in working copy
   */
  async getCurrentChanges(apdId: string): Promise<FieldChange[]> {
    try {
      return await storageService.getFieldChanges(apdId);
    } catch (error) {
      throw new StorageError(
        `Failed to get current changes for APD: ${apdId}`,
        StorageErrorCode.TRANSACTION_FAILED,
        error as Error
      );
    }
  }

  /**
   * Generate change highlights for UI display
   */
  generateChangeHighlights(changes: FieldChange[]): ChangeHighlight[] {
    return changes.map(change => ({
      fieldPath: change.fieldPath,
      changeType: change.changeType,
      displayType: this.getDisplayTypeForChange(change.changeType),
      tooltip: this.generateChangeTooltip(change),
    }));
  }

  /**
   * Generate inline diff for text changes
   */
  generateInlineDiff(change: FieldChange): InlineDiff {
    const oldText = String(change.oldValue || '');
    const newText = String(change.newValue || '');

    return {
      fieldPath: change.fieldPath,
      oldText,
      newText,
      diffHtml: this.generateDiffHtml(oldText, newText),
    };
  }

  // Private helper methods

  private generateNextVersionNumber(versions: APDVersion[]): string {
    if (versions.length === 0) {
      return 'v1.0';
    }

    // Sort versions by timestamp to get the latest
    const sortedVersions = versions.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );

    const latestVersion = sortedVersions[0]?.versionNumber;
    if (!latestVersion) {
      return 'v1.0';
    }

    const match = latestVersion.match(/v(\d+)\.(\d+)/);

    if (match && match[1] && match[2]) {
      const major = parseInt(match[1]);
      const minor = parseInt(match[2]);
      return `v${major}.${minor + 1}`;
    }

    return 'v1.0';
  }

  private detectChanges(
    oldSections: Record<string, any>,
    newSections: Record<string, any>
  ): FieldChange[] {
    const changes: FieldChange[] = [];
    const allSectionIds = new Set([
      ...Object.keys(oldSections),
      ...Object.keys(newSections),
    ]);

    for (const sectionId of allSectionIds) {
      const oldSection = oldSections[sectionId];
      const newSection = newSections[sectionId];

      if (!oldSection && newSection) {
        // Section added
        this.detectSectionChanges(null, newSection, sectionId, changes);
      } else if (oldSection && !newSection) {
        // Section deleted
        this.detectSectionChanges(oldSection, null, sectionId, changes);
      } else if (oldSection && newSection) {
        // Section modified
        this.detectSectionChanges(oldSection, newSection, sectionId, changes);
      }
    }

    return changes;
  }

  private detectSectionChanges(
    oldSection: any,
    newSection: any,
    sectionId: string,
    changes: FieldChange[]
  ): void {
    if (!oldSection && newSection) {
      // Entire section added
      this.addFieldChangesForSection(newSection, sectionId, 'added', changes);
    } else if (oldSection && !newSection) {
      // Entire section deleted
      this.addFieldChangesForSection(oldSection, sectionId, 'deleted', changes);
    } else {
      // Compare section content
      this.compareObjects(
        oldSection.content || {},
        newSection.content || {},
        `sections.${sectionId}.content`,
        sectionId,
        changes
      );
    }
  }

  private compareObjects(
    oldObj: any,
    newObj: any,
    basePath: string,
    sectionId: string,
    changes: FieldChange[]
  ): void {
    const allKeys = new Set([
      ...Object.keys(oldObj || {}),
      ...Object.keys(newObj || {}),
    ]);

    for (const key of allKeys) {
      const fieldPath = `${basePath}.${key}`;
      const oldValue = oldObj?.[key];
      const newValue = newObj?.[key];

      if (oldValue === undefined && newValue !== undefined) {
        changes.push(
          this.createFieldChange(
            fieldPath,
            key,
            oldValue,
            newValue,
            'added',
            sectionId
          )
        );
      } else if (oldValue !== undefined && newValue === undefined) {
        changes.push(
          this.createFieldChange(
            fieldPath,
            key,
            oldValue,
            newValue,
            'deleted',
            sectionId
          )
        );
      } else if (oldValue !== newValue) {
        changes.push(
          this.createFieldChange(
            fieldPath,
            key,
            oldValue,
            newValue,
            'modified',
            sectionId
          )
        );
      }
    }
  }

  private addFieldChangesForSection(
    section: any,
    sectionId: string,
    changeType: ChangeType,
    changes: FieldChange[]
  ): void {
    if (section.content) {
      for (const [key, value] of Object.entries(section.content)) {
        const fieldPath = `sections.${sectionId}.content.${key}`;
        changes.push(
          this.createFieldChange(
            fieldPath,
            key,
            changeType === 'added' ? undefined : value,
            changeType === 'deleted' ? undefined : value,
            changeType,
            sectionId
          )
        );
      }
    }
  }

  private createFieldChange(
    fieldPath: string,
    fieldLabel: string,
    oldValue: any,
    newValue: any,
    changeType: ChangeType,
    section: string
  ): FieldChange {
    return {
      id: uuidv4(),
      fieldPath,
      fieldLabel,
      oldValue,
      newValue,
      changeType,
      timestamp: new Date(),
      section,
    };
  }

  private getDisplayTypeForChange(
    changeType: ChangeType
  ): 'inline' | 'background' | 'border' {
    switch (changeType) {
      case 'added':
        return 'background';
      case 'deleted':
        return 'border';
      case 'modified':
        return 'inline';
      default:
        return 'background';
    }
  }

  private generateChangeTooltip(change: FieldChange): string {
    const timestamp = change.timestamp.toLocaleString();

    switch (change.changeType) {
      case 'added':
        return `Added "${change.fieldLabel}" on ${timestamp}`;
      case 'deleted':
        return `Deleted "${change.fieldLabel}" on ${timestamp}`;
      case 'modified':
        return `Modified "${change.fieldLabel}" on ${timestamp}`;
      default:
        return `Changed "${change.fieldLabel}" on ${timestamp}`;
    }
  }

  private generateDiffHtml(oldText: string, newText: string): string {
    // Simple diff implementation - in a real app, you might use a library like diff2html
    if (oldText === newText) {
      return newText;
    }

    const oldWords = oldText.split(/\s+/);
    const newWords = newText.split(/\s+/);

    let html = '';
    let oldIndex = 0;
    let newIndex = 0;

    while (oldIndex < oldWords.length || newIndex < newWords.length) {
      if (oldIndex >= oldWords.length) {
        // Only new words left
        html += `<span class="diff-added">${newWords.slice(newIndex).join(' ')}</span>`;
        break;
      } else if (newIndex >= newWords.length) {
        // Only old words left
        html += `<span class="diff-deleted">${oldWords.slice(oldIndex).join(' ')}</span>`;
        break;
      } else if (oldWords[oldIndex] === newWords[newIndex]) {
        // Words match
        html += oldWords[oldIndex] + ' ';
        oldIndex++;
        newIndex++;
      } else {
        // Words differ
        html += `<span class="diff-deleted">${oldWords[oldIndex]}</span> `;
        html += `<span class="diff-added">${newWords[newIndex]}</span> `;
        oldIndex++;
        newIndex++;
      }
    }

    return html.trim();
  }
}

// Export singleton instance
export const versionControlService = new VersionControlService();
