/**
 * Template Service - Main orchestrator for template parsing with Milkdown integration
 *
 * This service coordinates all template parsing functionality including:
 * - Markdown template parsing
 * - Content type detection
 * - Schema generation
 * - Milkdown configuration
 * - APD-specific customizations
 */

import { APDType } from '../../types/apd';
import {
  APDTemplate,
  ParsedTemplate,
  TemplateSection,
  TemplateField,
  ValidationRule,
} from '../../types/template';
import {
  MarkdownTemplateParser,
  MilkdownFieldConfig,
  SlashCommand,
} from './markdownTemplateParser';
import {
  TemplateSchemaGenerator,
  GeneratedSchema,
  FieldMapping,
} from './templateSchemaGenerator';
import { ContentTypeDetector, ContentAnalysis } from './contentTypeDetector';

export interface TemplateParsingResult {
  template: APDTemplate;
  schema: GeneratedSchema;
  milkdownConfigs: Map<string, MilkdownFieldConfig>;
  contentAnalyses: Map<string, ContentAnalysis>;
  slashCommands: SlashCommand[];
  fieldMappings: FieldMapping[];
  metadata: TemplateMetadata;
}

export interface TemplateMetadata {
  parseDate: Date;
  templateType: APDType;
  version: string;
  fieldCount: number;
  sectionCount: number;
  milkdownFieldCount: number;
  complexityDistribution: {
    simple: number;
    moderate: number;
    complex: number;
  };
}

export interface TemplateLoadOptions {
  enableMilkdown?: boolean;
  generateSchema?: boolean;
  analyzeContent?: boolean;
  customSlashCommands?: SlashCommand[];
  validationLevel?: 'basic' | 'strict' | 'comprehensive';
}

/**
 * Main template service for parsing and processing APD templates
 */
export class TemplateService {
  private parser: MarkdownTemplateParser;
  private schemaGenerator: TemplateSchemaGenerator;
  private contentDetector: ContentTypeDetector;

  constructor() {
    this.parser = new MarkdownTemplateParser();
    this.schemaGenerator = new TemplateSchemaGenerator();
    this.contentDetector = new ContentTypeDetector();
  }

  /**
   * Parse a markdown template file and generate complete configuration
   */
  public async parseTemplate(
    markdownContent: string,
    templateType: APDType,
    options: TemplateLoadOptions = {}
  ): Promise<TemplateParsingResult> {
    const {
      enableMilkdown = true,
      generateSchema = true,
      analyzeContent = true,
      customSlashCommands = [],
      validationLevel = 'comprehensive',
    } = options;

    // Step 1: Parse the markdown template
    const parsedTemplate = await this.parser.parseTemplate(
      markdownContent,
      templateType
    );

    // Step 2: Analyze content types if enabled
    const contentAnalyses = analyzeContent
      ? this.analyzeTemplateContent(parsedTemplate, templateType)
      : new Map<string, ContentAnalysis>();

    // Step 3: Get Milkdown configurations
    const milkdownConfigs = enableMilkdown
      ? this.parser.getAllMilkdownConfigs()
      : new Map<string, MilkdownFieldConfig>();

    // Step 4: Generate schema if enabled
    const schema = generateSchema
      ? this.schemaGenerator.generateSchema(parsedTemplate, milkdownConfigs)
      : this.createEmptySchema();

    // Step 5: Convert to APD template format
    const template = this.convertToAPDTemplate(parsedTemplate, validationLevel);

    // Step 6: Get slash commands
    const slashCommands = [
      ...this.parser.getSlashCommands(),
      ...customSlashCommands,
    ];

    // Step 7: Generate metadata
    const metadata = this.generateMetadata(
      parsedTemplate,
      templateType,
      milkdownConfigs,
      contentAnalyses
    );

    return {
      template,
      schema,
      milkdownConfigs,
      contentAnalyses,
      slashCommands,
      fieldMappings: schema.fieldMappings,
      metadata,
    };
  }

  /**
   * Load template from file path
   */
  public async loadTemplateFromFile(
    filePath: string,
    templateType: APDType,
    options?: TemplateLoadOptions
  ): Promise<TemplateParsingResult> {
    try {
      // In a real implementation, this would read from the file system
      // For now, we'll simulate loading from the docs directory
      const content = await this.loadTemplateContent(filePath);
      return this.parseTemplate(content, templateType, options);
    } catch (error) {
      throw new Error(`Failed to load template from ${filePath}: ${error}`);
    }
  }

  /**
   * Get available templates
   */
  public getAvailableTemplates(): Array<{
    type: APDType;
    name: string;
    path: string;
    description: string;
  }> {
    return [
      {
        type: 'PAPD',
        name: 'MES APD Template (PAPD/IAPD/APDU)',
        path: 'docs/apd templates/markdown apd templates/MES APD Template.md',
        description:
          'Main APD template for Planning, Implementation, and Updates',
      },
      {
        type: 'OAPD',
        name: 'MES OAPD Template',
        path: 'docs/apd templates/markdown apd templates/MES OAPD Template.md',
        description:
          'Operational APD template for ongoing maintenance and operations',
      },
      {
        type: 'PAPD', // AoA is typically part of PAPD process
        name: 'MES AoA Template',
        path: 'docs/apd templates/markdown apd templates/MES AoA Template.md',
        description:
          'Analysis of Alternatives template for solution evaluation',
      },
    ];
  }

  /**
   * Validate template structure
   */
  public validateTemplate(template: APDTemplate): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required sections
    const requiredSections = this.getRequiredSections(template.type);
    requiredSections.forEach(sectionId => {
      const section = template.sections.find(s => s.id === sectionId);
      if (!section) {
        errors.push(`Missing required section: ${sectionId}`);
      }
    });

    // Check field completeness
    template.sections.forEach(section => {
      if (
        section.fields.length === 0 &&
        (!section.subsections || section.subsections.length === 0)
      ) {
        warnings.push(
          `Section "${section.title}" has no fields or subsections`
        );
      }

      section.fields.forEach(field => {
        if (
          field.required &&
          !field.validation?.some(rule => rule.type === 'required')
        ) {
          warnings.push(
            `Required field "${field.label}" missing required validation rule`
          );
        }
      });
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Get Milkdown configuration for a specific field
   */
  public getMilkdownConfigForField(
    fieldPath: string,
    templateResult: TemplateParsingResult
  ): MilkdownFieldConfig | undefined {
    return templateResult.milkdownConfigs.get(fieldPath);
  }

  /**
   * Get content analysis for a field
   */
  public getContentAnalysisForField(
    fieldPath: string,
    templateResult: TemplateParsingResult
  ): ContentAnalysis | undefined {
    return templateResult.contentAnalyses.get(fieldPath);
  }

  /**
   * Generate custom slash commands for specific APD context
   */
  public generateCustomSlashCommands(
    _apdType: APDType,
    projectContext?: {
      projectName?: string;
      stateName?: string;
      systemType?: 'MMIS' | 'E&E';
    }
  ): SlashCommand[] {
    const customCommands: SlashCommand[] = [];

    if (projectContext?.stateName) {
      customCommands.push({
        id: 'state-name',
        label: `Insert ${projectContext.stateName}`,
        description: `Insert the state name: ${projectContext.stateName}`,
        keywords: ['state', 'name'],
        category: 'apd',
        handler: 'insertStateName',
        insertContent: projectContext.stateName,
      });
    }

    if (projectContext?.projectName) {
      customCommands.push({
        id: 'project-name',
        label: `Insert ${projectContext.projectName}`,
        description: `Insert the project name: ${projectContext.projectName}`,
        keywords: ['project', 'name'],
        category: 'apd',
        handler: 'insertProjectName',
        insertContent: projectContext.projectName,
      });
    }

    if (projectContext?.systemType) {
      const systemDescription =
        projectContext.systemType === 'MMIS'
          ? 'Medicaid Management Information System'
          : 'Eligibility and Enrollment System';

      customCommands.push({
        id: 'system-type',
        label: `Insert ${projectContext.systemType}`,
        description: `Insert system type: ${systemDescription}`,
        keywords: ['system', 'type', projectContext.systemType.toLowerCase()],
        category: 'apd',
        handler: 'insertSystemType',
        insertContent: `${projectContext.systemType} (${systemDescription})`,
      });
    }

    return customCommands;
  }

  // Private helper methods

  private async loadTemplateContent(filePath: string): Promise<string> {
    // This would typically use fs.readFile or similar
    // For now, return a placeholder that indicates the file should be loaded
    throw new Error(`Template loading not implemented for: ${filePath}`);
  }

  private analyzeTemplateContent(
    parsedTemplate: ParsedTemplate,
    templateType: APDType
  ): Map<string, ContentAnalysis> {
    const analyses = new Map<string, ContentAnalysis>();

    parsedTemplate.sections.forEach(section => {
      const sectionAnalyses = this.contentDetector.analyzeSectionContent(
        section,
        templateType
      );
      sectionAnalyses.forEach((analysis, fieldPath) => {
        analyses.set(fieldPath, analysis);
      });
    });

    return analyses;
  }

  private convertToAPDTemplate(
    parsedTemplate: ParsedTemplate,
    validationLevel: 'basic' | 'strict' | 'comprehensive'
  ): APDTemplate {
    const sections: TemplateSection[] = parsedTemplate.sections.map(section =>
      this.convertSection(section)
    );

    return {
      id: `template_${parsedTemplate.metadata.type.toLowerCase()}_${Date.now()}`,
      type: parsedTemplate.metadata.type,
      version: parsedTemplate.metadata.version,
      name: parsedTemplate.metadata.title,
      description: parsedTemplate.metadata.description || '',
      sections,
      validationRules: this.enhanceValidationRules(
        parsedTemplate.validationRules,
        validationLevel
      ),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private convertSection(
    parsedSection: ParsedTemplate['sections'][0]
  ): TemplateSection {
    const fields: TemplateField[] = parsedSection.fields.map(field =>
      this.convertField(field)
    );

    const subsections: TemplateSection[] =
      parsedSection.subsections?.map(subsection =>
        this.convertSection(subsection)
      ) || [];

    return {
      id: this.generateSectionId(parsedSection.title),
      title: parsedSection.title,
      description: parsedSection.description || '',
      fields,
      subsections,
      isRequired: true,
      helpText: parsedSection.helpText || '',
      order: 0, // Will be set by parent
    };
  }

  private convertField(
    parsedField: ParsedTemplate['sections'][0]['fields'][0]
  ): TemplateField {
    return {
      id: this.generateFieldId(parsedField.name),
      name: parsedField.name,
      label: parsedField.label,
      type: parsedField.type,
      required: parsedField.required,
      validation: parsedField.validation || [],
      helpText: parsedField.helpText || '',
      options: parsedField.options || [],
      defaultValue: parsedField.defaultValue,
    };
  }

  private enhanceValidationRules(
    baseRules: ValidationRule[],
    level: 'basic' | 'strict' | 'comprehensive'
  ): ValidationRule[] {
    const rules = [...baseRules];

    if (level === 'strict' || level === 'comprehensive') {
      // Add stricter validation rules
      rules.push({
        type: 'custom',
        message: 'Content must meet APD formatting standards',
        validator: () => {
          // Implement APD-specific validation
          return true;
        },
      });
    }

    if (level === 'comprehensive') {
      // Add comprehensive validation rules
      rules.push({
        type: 'custom',
        message: 'Content must be complete and consistent across sections',
        validator: () => {
          // Implement cross-section validation
          return true;
        },
      });
    }

    return rules;
  }

  private generateMetadata(
    parsedTemplate: ParsedTemplate,
    templateType: APDType,
    milkdownConfigs: Map<string, MilkdownFieldConfig>,
    contentAnalyses: Map<string, ContentAnalysis>
  ): TemplateMetadata {
    const fieldCount = this.countFields(parsedTemplate.sections);
    const sectionCount = this.countSections(parsedTemplate.sections);
    const milkdownFieldCount = milkdownConfigs.size;

    const complexityDistribution = {
      simple: 0,
      moderate: 0,
      complex: 0,
    };

    contentAnalyses.forEach(analysis => {
      complexityDistribution[analysis.complexity]++;
    });

    return {
      parseDate: new Date(),
      templateType,
      version: parsedTemplate.metadata.version,
      fieldCount,
      sectionCount,
      milkdownFieldCount,
      complexityDistribution,
    };
  }

  private countFields(sections: ParsedTemplate['sections']): number {
    return sections.reduce((count, section) => {
      const sectionFields = section.fields.length;
      const subsectionFields =
        section.subsections?.reduce(
          (subCount, subsection) => subCount + subsection.fields.length,
          0
        ) || 0;
      return count + sectionFields + subsectionFields;
    }, 0);
  }

  private countSections(sections: ParsedTemplate['sections']): number {
    return sections.reduce((count, section) => {
      const subsectionCount = section.subsections?.length || 0;
      return count + 1 + subsectionCount;
    }, 0);
  }

  private createEmptySchema(): GeneratedSchema {
    return {
      interfaces: '',
      validationSchema: { sections: [], globalRules: [] },
      milkdownConfigs: {},
      fieldMappings: [],
    };
  }

  private getRequiredSections(_apdType: APDType): string[] {
    // For now, only require sections that are commonly present
    // This can be made more strict in the future
    return ['executive_summary'];
  }

  private generateSectionId(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  }

  private generateFieldId(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  }
}
