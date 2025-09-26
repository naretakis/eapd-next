/**
 * Change Tracking Service for APD Field-Level Changes
 *
 * This service provides detailed field-level change tracking for APDs,
 * including real-time change detection, highlighting, and diff generation.
 *
 * Features:
 * - Field-level change detection and tracking
 * - Real-time change highlighting for UI
 * - Change aggregation and summarization
 * - Diff generation for text and structured data
 * - Change persistence and retrieval
 */

import { v4 as uuidv4 } from 'uuid';
import {
  FieldChange,
  ChangeStatus,
  ChangeHighlight,
  InlineDiff,
  ChangeType,
  APDSectionData,
} from '../types/apd';
import { storageService } from './database';
import { StorageError, StorageErrorCode } from '../types/database';

export interface ChangeDetectionOptions {
  trackMetadata?: boolean;
  trackSectionStructure?: boolean;
  ignoreTimestamps?: boolean;
  customIgnoreFields?: string[];
}

export interface ChangeAggregation {
  totalChanges: number;
  changesBySection: Record<string, number>;
  changesByType: Record<ChangeType, number>;
  recentChanges: FieldChange[];
  oldestChange?: Date | undefined;
  newestChange?: Date | undefined;
}

export interface HighlightOptions {
  showTooltips?: boolean;
  groupSimilarChanges?: boolean;
  maxHighlights?: number;
}

/**
 * Change Tracking Service Implementation
 */
export class ChangeTrackingService {
  private changeCache = new Map<string, FieldChange[]>();
  private lastDetectionTime = new Map<string, Date>();

  /**
   * Track a field change
   */
  async trackFieldChange(
    apdId: string,
    fieldPath: string,
    fieldLabel: string,
    oldValue: any,
    newValue: any,
    section: string,
    author?: string
  ): Promise<FieldChange> {
    try {
      // Don't track if values are the same
      if (this.valuesEqual(oldValue, newValue)) {
        throw new Error('Values are identical, no change to track');
      }

      const change: FieldChange = {
        id: uuidv4(),
        fieldPath,
        fieldLabel,
        oldValue,
        newValue,
        changeType: this.determineChangeType(oldValue, newValue),
        timestamp: new Date(),
        author: author || undefined,
        section,
      };

      // Store the change
      await storageService.storeFieldChange(change);

      // Update cache
      this.updateChangeCache(apdId, change);

      return change;
    } catch (error) {
      throw new StorageError(
        `Failed to track field change: ${fieldPath}`,
        StorageErrorCode.TRANSACTION_FAILED,
        error as Error
      );
    }
  }

  /**
   * Detect changes between two APD states
   */
  detectChanges(
    _apdId: string,
    originalSections: Record<string, APDSectionData>,
    modifiedSections: Record<string, APDSectionData>,
    options: ChangeDetectionOptions = {}
  ): FieldChange[] {
    const changes: FieldChange[] = [];
    const opts = {
      trackMetadata: true,
      trackSectionStructure: true,
      ignoreTimestamps: true,
      customIgnoreFields: [],
      ...options,
    };

    // Get all section IDs
    const allSectionIds = new Set([
      ...Object.keys(originalSections),
      ...Object.keys(modifiedSections),
    ]);

    for (const sectionId of allSectionIds) {
      const originalSection = originalSections[sectionId];
      const modifiedSection = modifiedSections[sectionId];

      if (!originalSection && modifiedSection) {
        // Section added
        changes.push(...this.detectSectionAddition(sectionId, modifiedSection));
      } else if (originalSection && !modifiedSection) {
        // Section deleted
        changes.push(...this.detectSectionDeletion(sectionId, originalSection));
      } else if (originalSection && modifiedSection) {
        // Section modified
        changes.push(
          ...this.detectSectionChanges(
            sectionId,
            originalSection,
            modifiedSection,
            opts
          )
        );
      }
    }

    return changes;
  }

  /**
   * Get field change status for a specific field
   */
  async getFieldChangeStatus(
    apdId: string,
    fieldPath: string
  ): Promise<ChangeStatus> {
    try {
      const changes = await this.getChangesForAPD(apdId);
      const fieldChanges = changes.filter(
        change => change.fieldPath === fieldPath
      );

      if (fieldChanges.length === 0) {
        return 'unchanged';
      }

      // Get the most recent change
      const latestChange = fieldChanges.sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
      )[0];

      if (!latestChange) {
        return 'unchanged';
      }

      return latestChange.changeType === 'deleted'
        ? 'deleted'
        : latestChange.changeType === 'added'
          ? 'added'
          : 'modified';
    } catch (error) {
      throw new StorageError(
        `Failed to get field change status: ${fieldPath}`,
        StorageErrorCode.TRANSACTION_FAILED,
        error as Error
      );
    }
  }

  /**
   * Generate change highlights for UI display
   */
  async generateChangeHighlights(
    apdId: string,
    options: HighlightOptions = {}
  ): Promise<ChangeHighlight[]> {
    try {
      const changes = await this.getChangesForAPD(apdId);
      const opts = {
        showTooltips: true,
        groupSimilarChanges: false,
        maxHighlights: 100,
        ...options,
      };

      let highlights = changes.map(change => ({
        fieldPath: change.fieldPath,
        changeType: change.changeType,
        displayType: this.getDisplayType(change.changeType),
        tooltip: opts.showTooltips ? this.generateTooltip(change) : '',
      }));

      // Group similar changes if requested
      if (opts.groupSimilarChanges) {
        highlights = this.groupSimilarHighlights(highlights);
      }

      // Limit number of highlights
      if (highlights.length > opts.maxHighlights) {
        highlights = highlights.slice(0, opts.maxHighlights);
      }

      return highlights;
    } catch (error) {
      throw new StorageError(
        `Failed to generate change highlights for APD: ${apdId}`,
        StorageErrorCode.TRANSACTION_FAILED,
        error as Error
      );
    }
  }

  /**
   * Generate inline diff for a specific field change
   */
  generateInlineDiff(change: FieldChange): InlineDiff {
    const oldText = this.valueToString(change.oldValue);
    const newText = this.valueToString(change.newValue);

    return {
      fieldPath: change.fieldPath,
      oldText,
      newText,
      diffHtml: this.generateDiffHtml(oldText, newText, change.changeType),
    };
  }

  /**
   * Get changes for a specific APD
   */
  async getChangesForAPD(apdId: string): Promise<FieldChange[]> {
    try {
      // Check cache first
      if (this.changeCache.has(apdId)) {
        const lastDetection = this.lastDetectionTime.get(apdId);
        if (lastDetection && Date.now() - lastDetection.getTime() < 30000) {
          // 30 seconds
          return this.changeCache.get(apdId)!;
        }
      }

      // Fetch from storage
      const changes = await storageService.getFieldChanges(apdId);

      // Update cache
      this.changeCache.set(apdId, changes);
      this.lastDetectionTime.set(apdId, new Date());

      return changes;
    } catch (error) {
      throw new StorageError(
        `Failed to get changes for APD: ${apdId}`,
        StorageErrorCode.TRANSACTION_FAILED,
        error as Error
      );
    }
  }

  /**
   * Aggregate changes for reporting and statistics
   */
  async aggregateChanges(apdId: string): Promise<ChangeAggregation> {
    try {
      const changes = await this.getChangesForAPD(apdId);

      const changesBySection: Record<string, number> = {};
      const changesByType: Record<ChangeType, number> = {
        added: 0,
        modified: 0,
        deleted: 0,
      };

      let oldestChange: Date | undefined;
      let newestChange: Date | undefined;

      for (const change of changes) {
        // Count by section
        changesBySection[change.section] =
          (changesBySection[change.section] || 0) + 1;

        // Count by type
        changesByType[change.changeType]++;

        // Track oldest and newest
        if (!oldestChange || change.timestamp < oldestChange) {
          oldestChange = change.timestamp;
        }
        if (!newestChange || change.timestamp > newestChange) {
          newestChange = change.timestamp;
        }
      }

      // Get recent changes (last 10)
      const recentChanges = changes
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 10);

      return {
        totalChanges: changes.length,
        changesBySection,
        changesByType,
        recentChanges,
        oldestChange,
        newestChange,
      };
    } catch (error) {
      throw new StorageError(
        `Failed to aggregate changes for APD: ${apdId}`,
        StorageErrorCode.TRANSACTION_FAILED,
        error as Error
      );
    }
  }

  /**
   * Clear all changes for an APD
   */
  async clearChanges(apdId: string): Promise<void> {
    try {
      await storageService.deleteFieldChanges(apdId);

      // Clear cache
      this.changeCache.delete(apdId);
      this.lastDetectionTime.delete(apdId);
    } catch (error) {
      throw new StorageError(
        `Failed to clear changes for APD: ${apdId}`,
        StorageErrorCode.TRANSACTION_FAILED,
        error as Error
      );
    }
  }

  /**
   * Get changes by date range
   */
  async getChangesByDateRange(
    apdId: string,
    startDate: Date,
    endDate: Date
  ): Promise<FieldChange[]> {
    try {
      const allChanges = await this.getChangesForAPD(apdId);

      return allChanges.filter(
        change => change.timestamp >= startDate && change.timestamp <= endDate
      );
    } catch (error) {
      throw new StorageError(
        `Failed to get changes by date range for APD: ${apdId}`,
        StorageErrorCode.TRANSACTION_FAILED,
        error as Error
      );
    }
  }

  // Private helper methods

  private valuesEqual(oldValue: any, newValue: any): boolean {
    // Handle null/undefined
    if (oldValue === newValue) return true;
    if (oldValue == null && newValue == null) return true;
    if (oldValue == null || newValue == null) return false;

    // Handle arrays
    if (Array.isArray(oldValue) && Array.isArray(newValue)) {
      if (oldValue.length !== newValue.length) return false;
      return oldValue.every((item, index) =>
        this.valuesEqual(item, newValue[index])
      );
    }

    // Handle objects
    if (typeof oldValue === 'object' && typeof newValue === 'object') {
      const oldKeys = Object.keys(oldValue);
      const newKeys = Object.keys(newValue);

      if (oldKeys.length !== newKeys.length) return false;

      return oldKeys.every(
        key =>
          newKeys.includes(key) &&
          this.valuesEqual(oldValue[key], newValue[key])
      );
    }

    // Handle primitives
    return oldValue === newValue;
  }

  private determineChangeType(oldValue: any, newValue: any): ChangeType {
    if (oldValue == null && newValue != null) return 'added';
    if (oldValue != null && newValue == null) return 'deleted';
    return 'modified';
  }

  private updateChangeCache(apdId: string, change: FieldChange): void {
    const cached = this.changeCache.get(apdId) || [];
    cached.push(change);
    this.changeCache.set(apdId, cached);
  }

  private detectSectionAddition(
    sectionId: string,
    section: APDSectionData
  ): FieldChange[] {
    const changes: FieldChange[] = [];

    if (section.content) {
      for (const [fieldName, value] of Object.entries(section.content)) {
        changes.push({
          id: uuidv4(),
          fieldPath: `sections.${sectionId}.content.${fieldName}`,
          fieldLabel: this.formatFieldLabel(fieldName),
          oldValue: undefined,
          newValue: value,
          changeType: 'added',
          timestamp: new Date(),
          section: sectionId,
        });
      }
    }

    return changes;
  }

  private detectSectionDeletion(
    sectionId: string,
    section: APDSectionData
  ): FieldChange[] {
    const changes: FieldChange[] = [];

    if (section.content) {
      for (const [fieldName, value] of Object.entries(section.content)) {
        changes.push({
          id: uuidv4(),
          fieldPath: `sections.${sectionId}.content.${fieldName}`,
          fieldLabel: this.formatFieldLabel(fieldName),
          oldValue: value,
          newValue: undefined,
          changeType: 'deleted',
          timestamp: new Date(),
          section: sectionId,
        });
      }
    }

    return changes;
  }

  private detectSectionChanges(
    sectionId: string,
    originalSection: APDSectionData,
    modifiedSection: APDSectionData,
    options: ChangeDetectionOptions
  ): FieldChange[] {
    const changes: FieldChange[] = [];

    // Compare content
    if (originalSection.content && modifiedSection.content) {
      const allFieldNames = new Set([
        ...Object.keys(originalSection.content),
        ...Object.keys(modifiedSection.content),
      ]);

      for (const fieldName of allFieldNames) {
        // Skip ignored fields
        if (options.customIgnoreFields?.includes(fieldName)) continue;
        if (
          options.ignoreTimestamps &&
          fieldName.toLowerCase().includes('timestamp')
        )
          continue;

        const oldValue = originalSection.content[fieldName];
        const newValue = modifiedSection.content[fieldName];

        if (!this.valuesEqual(oldValue, newValue)) {
          changes.push({
            id: uuidv4(),
            fieldPath: `sections.${sectionId}.content.${fieldName}`,
            fieldLabel: this.formatFieldLabel(fieldName),
            oldValue,
            newValue,
            changeType: this.determineChangeType(oldValue, newValue),
            timestamp: new Date(),
            section: sectionId,
          });
        }
      }
    }

    return changes;
  }

  private getDisplayType(
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

  private generateTooltip(change: FieldChange): string {
    const timestamp = change.timestamp.toLocaleString();
    const author = change.author ? ` by ${change.author}` : '';

    switch (change.changeType) {
      case 'added':
        return `Added "${change.fieldLabel}" on ${timestamp}${author}`;
      case 'deleted':
        return `Deleted "${change.fieldLabel}" on ${timestamp}${author}`;
      case 'modified':
        return `Modified "${change.fieldLabel}" on ${timestamp}${author}`;
      default:
        return `Changed "${change.fieldLabel}" on ${timestamp}${author}`;
    }
  }

  private groupSimilarHighlights(
    highlights: ChangeHighlight[]
  ): ChangeHighlight[] {
    const grouped = new Map<string, ChangeHighlight>();

    for (const highlight of highlights) {
      const key = `${highlight.changeType}-${highlight.displayType}`;
      if (!grouped.has(key)) {
        grouped.set(key, highlight);
      }
    }

    return Array.from(grouped.values());
  }

  private valueToString(value: any): string {
    if (value == null) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  }

  private generateDiffHtml(
    oldText: string,
    newText: string,
    changeType: ChangeType
  ): string {
    if (changeType === 'added') {
      return `<span class="diff-added">${this.escapeHtml(newText)}</span>`;
    }

    if (changeType === 'deleted') {
      return `<span class="diff-deleted">${this.escapeHtml(oldText)}</span>`;
    }

    // For modified, show both old and new
    if (oldText === newText) {
      return this.escapeHtml(newText);
    }

    // Simple word-based diff
    const oldWords = oldText.split(/\s+/);
    const newWords = newText.split(/\s+/);

    let html = '';
    const maxLength = Math.max(oldWords.length, newWords.length);

    for (let i = 0; i < maxLength; i++) {
      const oldWord = oldWords[i];
      const newWord = newWords[i];

      if (oldWord === newWord) {
        html += this.escapeHtml(oldWord || '') + ' ';
      } else {
        if (oldWord) {
          html += `<span class="diff-deleted">${this.escapeHtml(oldWord)}</span> `;
        }
        if (newWord) {
          html += `<span class="diff-added">${this.escapeHtml(newWord)}</span> `;
        }
      }
    }

    return html.trim();
  }

  private formatFieldLabel(fieldName: string): string {
    // Convert camelCase to Title Case
    return fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Export singleton instance
export const changeTrackingService = new ChangeTrackingService();
