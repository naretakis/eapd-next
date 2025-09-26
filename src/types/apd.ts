/**
 * APD Data Models and TypeScript Interfaces
 *
 * This file contains all the TypeScript interfaces for APD data models,
 * including version control, change tracking, and metadata structures.
 *
 * Based on the design document specifications for eAPD-Next application.
 */

// Core APD Types
export type APDType =
  | 'PAPD'
  | 'IAPD'
  | 'OAPD'
  | 'AoA'
  | 'Acquisition Checklist';

export type ChangeType = 'added' | 'modified' | 'deleted';
export type ChangeStatus = 'unchanged' | 'modified' | 'added' | 'deleted';

// Contact Information
export interface ContactInfo {
  name: string;
  title: string;
  email: string;
  phone: string;
  address?: string;
}

// APD Metadata
export interface APDMetadata {
  stateName: string;
  stateAgency: string;
  primaryContact: ContactInfo;
  submissionDate?: Date;
  documentType: APDType;
  benefitsMultiplePrograms: boolean;
  projectName: string;
}

// APD Section Data
export interface APDSectionData {
  sectionId: string;
  title: string;
  content: Record<string, any>;
  isComplete: boolean;
  lastModified: Date;
}

// Field Change Tracking
export interface FieldChange {
  id: string;
  fieldPath: string; // e.g., "sections.budget.personnel.row1.federalShare"
  fieldLabel: string; // Human-readable field name
  oldValue: any;
  newValue: any;
  changeType: ChangeType;
  timestamp: Date;
  author?: string | undefined;
  section: string; // Which APD section this belongs to
}

// APD Working Copy (uncommitted changes)
export interface APDWorkingCopy {
  id: string;
  apdId: string;
  baseVersionId: string; // Version this working copy was created from
  sections: Record<string, APDSectionData>;
  changes: FieldChange[]; // All uncommitted changes
  lastModified: Date;
  hasUncommittedChanges: boolean;
}

// APD Version (committed snapshot)
export interface APDVersion {
  id: string; // Unique version identifier
  apdId: string;
  versionNumber: string; // v1.0, v1.1, v1.2, etc.
  commitMessage: string; // User-provided description of changes
  author: string; // Who made this commit
  timestamp: Date;
  sections: Record<string, APDSectionData>; // Full snapshot
  changesSinceLastVersion: FieldChange[]; // What changed from previous version
  parentVersionId?: string | undefined; // Previous version (for history chain)
}

// Validation State
export interface ValidationState {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  lastValidated: Date;
}

export interface ValidationError {
  fieldId: string;
  sectionId: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  fieldId: string;
  sectionId: string;
  message: string;
  type: 'completeness' | 'consistency' | 'best-practice';
}

// Main APD Interface
export interface APD {
  id: string;
  type: APDType;
  metadata: APDMetadata;
  sections: Record<string, APDSectionData>;
  validationState: ValidationState;
  createdAt: Date;
  updatedAt: Date;

  // Version control
  currentVersion: string; // Points to latest committed version
  workingCopy?: APDWorkingCopy; // Current uncommitted changes
  versions: APDVersion[]; // All committed versions
}

// Version Comparison and Diff
export interface VersionDiff {
  fromVersion: string;
  toVersion: string;
  changes: FieldChange[];
  summary: {
    sectionsModified: string[];
    fieldsAdded: number;
    fieldsModified: number;
    fieldsDeleted: number;
  };
}

// Change Highlighting for UI
export interface ChangeHighlight {
  fieldPath: string;
  changeType: ChangeType;
  displayType: 'inline' | 'background' | 'border';
  tooltip: string; // Description of what changed
}

// Inline Diff for Text Changes
export interface InlineDiff {
  fieldPath: string;
  oldText: string;
  newText: string;
  diffHtml: string; // HTML with change highlighting
}

// APD List Item (for dashboard display)
export interface APDListItem {
  id: string;
  type: APDType;
  projectName: string;
  lastModified: Date;
  completionStatus: number; // 0-100
  isComplete: boolean;
  currentVersion: string;
  hasUncommittedChanges: boolean;
}

// Project Grouping
export interface Project {
  id: string;
  name: string;
  description?: string | undefined;
  apdIds: string[];
  createdAt: Date;
  updatedAt: Date;
}
