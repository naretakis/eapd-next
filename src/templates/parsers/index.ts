/**
 * Template Parsers - Advanced Markdown Template Parser with Milkdown Integration
 *
 * This module provides comprehensive template parsing functionality for APD templates
 * with specialized Milkdown editor configurations and content type detection.
 */

import { MilkdownContentType } from './markdownTemplateParser';

// Main parser classes
export { MarkdownTemplateParser } from './markdownTemplateParser';
export { TemplateSchemaGenerator } from './templateSchemaGenerator';
export { ContentTypeDetector } from './contentTypeDetector';
export { TemplateService } from './templateService';

// Types and interfaces
export type {
  MilkdownFieldConfig,
  MilkdownPlugin,
  MilkdownContentType,
  SlashCommand,
  CustomNodeConfig,
  MilkdownThemeConfig,
  FieldContext,
  TemplateFrontMatter,
} from './markdownTemplateParser';

export type {
  GeneratedSchema,
  ValidationSchema,
  SectionValidation,
  FieldValidation,
  FieldMapping,
} from './templateSchemaGenerator';

export type {
  ContentAnalysis,
  SpecialFeature,
  ContentPattern,
} from './contentTypeDetector';

export type {
  TemplateParsingResult,
  TemplateMetadata,
  TemplateLoadOptions,
} from './templateService';

// Utility functions
import { TemplateService } from './templateService';
import { MarkdownTemplateParser } from './markdownTemplateParser';
import { ContentTypeDetector } from './contentTypeDetector';
import { TemplateSchemaGenerator } from './templateSchemaGenerator';

export const createTemplateService = (): TemplateService => {
  return new TemplateService();
};

export const createMarkdownParser = (): MarkdownTemplateParser => {
  return new MarkdownTemplateParser();
};

export const createContentDetector = (): ContentTypeDetector => {
  return new ContentTypeDetector();
};

export const createSchemaGenerator = (): TemplateSchemaGenerator => {
  return new TemplateSchemaGenerator();
};

// Constants
export const SUPPORTED_APD_TYPES = ['PAPD', 'IAPD', 'OAPD'] as const;

export const DEFAULT_MILKDOWN_PLUGINS = [
  '@milkdown/plugin-commonmark',
  '@milkdown/plugin-gfm',
  '@milkdown/plugin-history',
  '@milkdown/plugin-clipboard',
] as const;

export const CONTENT_TYPE_PLUGINS = {
  'budget-table': ['@milkdown/plugin-table', '@milkdown/plugin-math'],
  'personnel-table': ['@milkdown/plugin-table'],
  'technical-specification': [
    '@milkdown/plugin-prism',
    '@milkdown/plugin-diagram',
  ],
  timeline: ['@milkdown/plugin-block'],
  'regulatory-reference': [],
  'executive-summary': ['@milkdown/plugin-block'],
  'structured-list': ['@milkdown/plugin-block'],
  'calculation-field': ['@milkdown/plugin-math'],
  diagram: ['@milkdown/plugin-diagram'],
  'rich-text': [
    '@milkdown/plugin-block',
    '@milkdown/plugin-slash',
    '@milkdown/plugin-tooltip',
  ],
} as const;

// Template validation helpers
export const validateAPDType = (
  type: string
): type is 'PAPD' | 'IAPD' | 'OAPD' => {
  return ['PAPD', 'IAPD', 'OAPD'].includes(type);
};

export const getRequiredSectionsForAPDType = (
  apdType: 'PAPD' | 'IAPD' | 'OAPD'
): string[] => {
  const commonSections = [
    'executive_summary',
    'project_management',
    'statement_of_needs',
    'proposed_budget',
  ];

  const typeSpecificSections = {
    PAPD: [...commonSections, 'project_management_plan'],
    IAPD: [...commonSections, 'requirements_analysis', 'cost_benefit_analysis'],
    OAPD: [...commonSections, 'summary_of_activities', 'annual_budget'],
  };

  return typeSpecificSections[apdType];
};

// Content type detection helpers
export const detectContentTypeFromText = (
  text: string
): MilkdownContentType => {
  // Simple text-based detection for utility use
  if (/budget|cost|ffp|federal.*share|state.*share/i.test(text)) {
    return 'budget-table';
  }
  if (/personnel|staff|resource|contractor/i.test(text)) {
    return 'personnel-table';
  }
  if (/\d+\s+cfr|regulation|compliance/i.test(text)) {
    return 'regulatory-reference';
  }
  if (/schedule|timeline|milestone|activity/i.test(text)) {
    return 'timeline';
  }
  if (/technical|system|architecture|specification/i.test(text)) {
    return 'technical-specification';
  }
  if (/executive.*summary|overview|intent/i.test(text)) {
    return 'executive-summary';
  }
  if (/calculation|formula|total|sum/i.test(text)) {
    return 'calculation-field';
  }
  if (/diagram|chart|flow|architecture.*design/i.test(text)) {
    return 'diagram';
  }

  return 'rich-text';
};

// Milkdown configuration helpers
export const getPluginsForContentType = (
  contentType: MilkdownContentType
): string[] => {
  const basePlugins = [...DEFAULT_MILKDOWN_PLUGINS];
  const contentPlugins = (CONTENT_TYPE_PLUGINS as any)[contentType] || [];

  return [...basePlugins, ...contentPlugins];
};

export const shouldUseMilkdown = (
  fieldType: string,
  contentType: MilkdownContentType
): boolean => {
  // Use Milkdown for rich text content and specialized content types
  return (
    fieldType === 'textarea' ||
    fieldType === 'text' ||
    contentType !== 'rich-text'
  );
};

// Error handling
export class TemplateParsingError extends Error {
  constructor(
    message: string,
    public readonly templatePath?: string,
    public readonly section?: string,
    public readonly field?: string
  ) {
    super(message);
    this.name = 'TemplateParsingError';
  }
}

export class ContentTypeDetectionError extends Error {
  constructor(
    message: string,
    public readonly fieldPath?: string,
    public readonly analysisText?: string
  ) {
    super(message);
    this.name = 'ContentTypeDetectionError';
  }
}

export class SchemaGenerationError extends Error {
  constructor(
    message: string,
    public readonly templateId?: string,
    public readonly interfaceName?: string
  ) {
    super(message);
    this.name = 'SchemaGenerationError';
  }
}
