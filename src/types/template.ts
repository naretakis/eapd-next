/**
 * Template Data Models and TypeScript Interfaces
 *
 * This file contains all the TypeScript interfaces for APD templates,
 * form generation, and validation rules.
 *
 * Based on the design document specifications for eAPD-Next application.
 */

import { APDType } from './apd';

// Field Types for Form Generation
export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'currency'
  | 'percentage'
  | 'date'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'radio'
  | 'table'
  | 'file';

// Select Options
export interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

// Validation Rules
export interface ValidationRule {
  type:
    | 'required'
    | 'minLength'
    | 'maxLength'
    | 'pattern'
    | 'min'
    | 'max'
    | 'custom';
  value?: unknown;
  message: string;
  validator?: (value: unknown, context: Record<string, unknown>) => boolean;
}

// Template Field Definition
export interface TemplateField {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  validation?: ValidationRule[];
  helpText?: string;
  placeholder?: string;
  options?: SelectOption[]; // For select/radio fields
  defaultValue?: unknown;

  // Table-specific properties
  columns?: TemplateTableColumn[];
  rows?: TemplateTableRow[];

  // Conditional display
  showWhen?: {
    fieldId: string;
    value: unknown;
  };

  // Calculation properties
  calculation?: {
    formula: string;
    dependsOn: string[];
  };
}

// Table Column Definition
export interface TemplateTableColumn {
  id: string;
  label: string;
  type: FieldType;
  width?: string;
  required?: boolean;
  validation?: ValidationRule[];
  calculation?: {
    formula: string;
    dependsOn: string[];
  };
}

// Table Row Definition
export interface TemplateTableRow {
  id: string;
  label?: string;
  cells: Record<string, unknown>;
  isCalculated?: boolean;
}

// Template Section
export interface TemplateSection {
  id: string;
  title: string;
  description?: string;
  fields: TemplateField[];
  subsections?: TemplateSection[];
  isRequired: boolean;
  helpText?: string;
  order: number;
}

// Main Template Interface
export interface APDTemplate {
  id: string;
  type: APDType;
  version: string;
  name: string;
  description?: string;
  sections: TemplateSection[];
  validationRules: ValidationRule[];
  createdAt: Date;
  updatedAt: Date;
}

// Validation Result
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  fieldResults: Record<string, FieldValidationResult>;
}

export interface ValidationError {
  fieldId: string;
  sectionId: string;
  message: string;
  severity: 'error' | 'warning';
  rule?: string;
}

export interface ValidationWarning {
  fieldId: string;
  sectionId: string;
  message: string;
  type: 'completeness' | 'consistency' | 'best-practice';
}

export interface FieldValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Form Generation Context
export interface FormGenerationContext {
  template: APDTemplate;
  data: Record<string, unknown>;
  validationState: ValidationResult;
  readOnly?: boolean;
}

// Budget Calculation Interfaces
export interface BudgetCalculationRule {
  id: string;
  name: string;
  formula: string;
  dependsOn: string[];
  description?: string;
}

export interface FFPRate {
  type: 'enhanced_ddi' | 'enhanced_operations' | 'regular';
  federalPercent: number;
  statePercent: number;
  description: string;
}

// Template Parsing Interfaces
export interface ParsedTemplate {
  metadata: {
    title: string;
    type: APDType;
    version: string;
    description?: string;
  };
  sections: ParsedSection[];
  validationRules: ValidationRule[];
}

export interface ParsedSection {
  title: string;
  description?: string;
  fields: ParsedField[];
  subsections?: ParsedSection[];
  helpText?: string;
}

export interface ParsedField {
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  helpText?: string;
  validation?: ValidationRule[];
  options?: SelectOption[];
  defaultValue?: unknown;
}
