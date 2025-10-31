/**
 * Advanced Markdown Template Parser with Milkdown Integration
 *
 * This parser extracts sections, fields, and metadata from markdown APD templates
 * and generates structured field definitions with Milkdown editor configurations.
 *
 * Features:
 * - Front matter parsing for template metadata
 * - Section and subsection extraction
 * - Field type detection with Milkdown content type mapping
 * - Help text and instruction parsing
 * - Table structure analysis for budget and personnel tables
 * - APD-specific content identification for specialized plugins
 */

import { APDType } from '../../types/apd';
import {
  ValidationRule,
  ParsedTemplate,
  ParsedSection,
  ParsedField,
} from '../../types/template';

// Milkdown-specific interfaces
export interface MilkdownFieldConfig {
  fieldId: string;
  editorType: 'milkdown' | 'standard';
  plugins: MilkdownPlugin[];
  contentType: MilkdownContentType;
  slashCommands: SlashCommand[];
  customNodes?: CustomNodeConfig[];
  theme?: MilkdownThemeConfig;
}

export interface MilkdownPlugin {
  name: string;
  package: string;
  config?: Record<string, unknown>;
  lazy?: boolean;
  condition?: (context: FieldContext) => boolean;
}

export type MilkdownContentType =
  | 'rich-text'
  | 'budget-table'
  | 'personnel-table'
  | 'regulatory-reference'
  | 'timeline'
  | 'technical-specification'
  | 'executive-summary'
  | 'structured-list'
  | 'calculation-field'
  | 'diagram';

export interface SlashCommand {
  id: string;
  label: string;
  description: string;
  keywords: string[];
  icon?: string;
  category: 'apd' | 'budget' | 'personnel' | 'regulatory' | 'general';
  handler: string; // Function name to call
  insertContent?: string;
}

export interface CustomNodeConfig {
  type: string;
  attrs: Record<string, unknown>;
  component?: string;
}

export interface MilkdownThemeConfig {
  variant: 'standard' | 'compact' | 'budget' | 'personnel';
  toolbar: 'floating' | 'fixed' | 'minimal';
  features: string[];
}

export interface FieldContext {
  sectionId: string;
  fieldPath: string;
  apdType: APDType;
  isRequired: boolean;
  parentSection?: string;
}

// Front matter interface for YAML parsing
export interface TemplateFrontMatter {
  State?: string[];
  'State Medicaid Agency'?: string[];
  'State Medicaid Agency Primary Contact'?: string[];
  'State Medicaid Agency Primary Contact Job Title'?: string[];
  'State Medicaid Agency Primary Contact Email Address'?: string[];
  'State Medicaid Agency Primary Contact Telephone Number'?: string[];
  'Date of Submission'?: string[];
  'Document Type'?: string[];
  'Do any initiatives described in this document benefit multiple Programs (Y/N)'?: string[];
  Version?: string[];
}

/**
 * Main template parser class with Milkdown integration
 */
export class MarkdownTemplateParser {
  private milkdownConfigs: Map<string, MilkdownFieldConfig> = new Map();
  private slashCommands: SlashCommand[] = [];

  /**
   * Parse a markdown template file and return structured template data
   */
  public async parseTemplate(
    markdownContent: string,
    templateType: APDType
  ): Promise<ParsedTemplate> {
    const { frontMatter, content } = this.extractFrontMatter(markdownContent);
    const sections = this.parseSections(content, templateType);
    const validationRules = this.extractValidationRules(sections);

    // Generate Milkdown configurations for all fields
    this.generateMilkdownConfigs(sections, templateType);

    return {
      metadata: {
        title: this.extractTitle(content),
        type: templateType,
        version: frontMatter.Version?.[0] || '1.0',
        description: this.extractDescription(content),
      },
      sections,
      validationRules,
    };
  }

  /**
   * Extract YAML front matter from markdown content
   */
  private extractFrontMatter(content: string): {
    frontMatter: TemplateFrontMatter;
    content: string;
  } {
    const frontMatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
    const match = content.match(frontMatterRegex);

    if (!match) {
      return { frontMatter: {}, content };
    }

    const yamlContent = match[1];
    const markdownContent = match[2] || '';

    // Simple YAML parser for front matter
    const frontMatter: TemplateFrontMatter = {};
    const lines = yamlContent?.split('\n') || [];
    let currentKey = '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      if (trimmed.startsWith('- ')) {
        // Array item
        if (
          currentKey &&
          frontMatter[currentKey as keyof TemplateFrontMatter]
        ) {
          (
            frontMatter[currentKey as keyof TemplateFrontMatter] as string[]
          ).push(trimmed.substring(2));
        }
      } else if (trimmed.endsWith(':')) {
        // New key
        currentKey = trimmed.slice(0, -1);
        frontMatter[currentKey as keyof TemplateFrontMatter] = [];
      }
    }

    return { frontMatter, content: markdownContent };
  }

  /**
   * Parse sections from markdown content
   */
  private parseSections(
    content: string,
    templateType: APDType
  ): ParsedSection[] {
    const sections: ParsedSection[] = [];
    const lines = content.split('\n');
    let currentSection: ParsedSection | null = null;
    let currentSubsection: ParsedSection | null = null;
    let currentField: ParsedField | null = null;
    let inInstruction = false;
    let instructionContent = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;
      const trimmed = line.trim();

      // Skip empty lines
      if (!trimmed) continue;

      // Check for instruction blocks
      if (trimmed.startsWith('> [!info]') || trimmed.startsWith('> [!INFO]')) {
        inInstruction = true;
        instructionContent = '';
        continue;
      }

      if (inInstruction) {
        if (trimmed.startsWith('>')) {
          instructionContent += trimmed.substring(1).trim() + '\n';
          continue;
        } else {
          inInstruction = false;
          // Process accumulated instruction content
          if (currentField) {
            currentField.helpText =
              this.cleanInstructionText(instructionContent);
          } else if (currentSubsection) {
            currentSubsection.helpText =
              this.cleanInstructionText(instructionContent);
          } else if (currentSection) {
            currentSection.helpText =
              this.cleanInstructionText(instructionContent);
          }
        }
      }

      // Parse headers
      if (trimmed.startsWith('#')) {
        const level = (trimmed.match(/^#+/) || [''])[0].length;
        const title = trimmed
          .replace(/^#+\s*/, '')
          .replace(/\[.*?\]/g, '')
          .trim();

        if (level === 2) {
          // Main section - save previous section first
          if (currentSection) {
            if (currentSubsection) {
              currentSection.subsections = currentSection.subsections || [];
              currentSection.subsections.push(currentSubsection);
            }
            sections.push(currentSection);
          }
          currentSection = {
            title,
            fields: [],
            subsections: [],
          };
          currentSubsection = null;
        } else if (level === 3 && currentSection) {
          // Subsection - save previous subsection first
          if (currentSubsection) {
            currentSection.subsections = currentSection.subsections || [];
            currentSection.subsections.push(currentSubsection);
          }
          currentSubsection = {
            title,
            fields: [],
          };
        }
      }

      // Parse tables
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        const tableField = this.parseTableField(lines, i, templateType);
        if (tableField) {
          const targetSection = currentSubsection || currentSection;
          if (targetSection) {
            targetSection.fields.push(tableField);
          }
        }
      }

      // Parse content insertion points
      if (trimmed === '[Insert written content here]') {
        const fieldName = this.generateFieldName(
          currentSection || undefined,
          currentSubsection || undefined
        );
        const field: ParsedField = {
          name: fieldName,
          label: this.generateFieldLabel(
            currentSection || undefined,
            currentSubsection || undefined
          ),
          type: 'textarea',
          required: true,
          ...(instructionContent && {
            helpText: this.cleanInstructionText(instructionContent),
          }),
        };

        // Determine if this should use Milkdown
        const contentType = this.detectMilkdownContentType(
          field,
          currentSection || undefined,
          currentSubsection || undefined
        );
        if (contentType !== 'rich-text') {
          field.type = 'text'; // Will be converted to Milkdown in config
        }

        const targetSection = currentSubsection || currentSection;
        if (targetSection) {
          targetSection.fields.push(field);
        }
        currentField = field;
      }
    }

    // Add the last section
    if (currentSection) {
      if (currentSubsection) {
        currentSection.subsections = currentSection.subsections || [];
        currentSection.subsections.push(currentSubsection);
      }
      sections.push(currentSection);
    }

    return sections;
  }

  /**
   * Parse table fields from markdown tables
   */
  private parseTableField(
    lines: string[],
    startIndex: number,
    templateType: APDType
  ): ParsedField | null {
    const headerLine = lines[startIndex];
    const separatorLine = lines[startIndex + 1];

    if (!headerLine || !separatorLine || !separatorLine.includes('---')) {
      return null;
    }

    // Extract column headers
    const headers = headerLine
      .split('|')
      .map(h => h.trim())
      .filter(h => h)
      .map(h => h.replace(/\*\*/g, ''));

    // Determine table type based on headers and context
    const tableType = this.detectTableType(headers, templateType);
    const fieldName = this.generateTableFieldName(headers, tableType);

    const field: ParsedField = {
      name: fieldName,
      label: this.generateTableLabel(headers, tableType),
      type: 'table',
      required: true,
      helpText: `${tableType} table with columns: ${headers.join(', ')}`,
    };

    return field;
  }

  /**
   * Detect Milkdown content type based on field context
   */
  private detectMilkdownContentType(
    field: ParsedField,
    section?: ParsedSection,
    subsection?: ParsedSection
  ): MilkdownContentType {
    const sectionTitle = (
      subsection?.title ||
      section?.title ||
      ''
    ).toLowerCase();
    const fieldName = field.name.toLowerCase();

    // Budget-related content
    if (sectionTitle.includes('budget') || fieldName.includes('budget')) {
      return 'budget-table';
    }

    // Personnel-related content
    if (sectionTitle.includes('personnel') || fieldName.includes('personnel')) {
      return 'personnel-table';
    }

    // Executive summary
    if (
      sectionTitle.includes('executive') ||
      sectionTitle.includes('summary')
    ) {
      return 'executive-summary';
    }

    // Technical specifications
    if (
      sectionTitle.includes('technical') ||
      sectionTitle.includes('requirements')
    ) {
      return 'technical-specification';
    }

    // Timeline/schedule content
    if (
      sectionTitle.includes('schedule') ||
      sectionTitle.includes('timeline')
    ) {
      return 'timeline';
    }

    // Regulatory references
    if (
      sectionTitle.includes('regulatory') ||
      sectionTitle.includes('compliance')
    ) {
      return 'regulatory-reference';
    }

    // Default to rich text
    return 'rich-text';
  }

  /**
   * Generate Milkdown configurations for all fields
   */
  private generateMilkdownConfigs(
    sections: ParsedSection[],
    templateType: APDType
  ): void {
    this.milkdownConfigs.clear();
    this.slashCommands = this.generateAPDSlashCommands(templateType);

    const processSection = (section: ParsedSection, parentPath = '') => {
      const sectionPath = parentPath
        ? `${parentPath}.${section.title}`
        : section.title;

      section.fields.forEach(field => {
        const fieldPath = `${sectionPath}.${field.name}`;
        const contentType = this.detectMilkdownContentType(field, section);

        if (this.shouldUseMilkdown(field, contentType)) {
          const config = this.createMilkdownConfig(
            field,
            contentType,
            templateType,
            fieldPath
          );
          this.milkdownConfigs.set(fieldPath, config);
        }
      });

      section.subsections?.forEach(subsection => {
        processSection(subsection, sectionPath);
      });
    };

    sections.forEach(section => processSection(section));
  }

  /**
   * Determine if a field should use Milkdown editor
   */
  private shouldUseMilkdown(
    field: ParsedField,
    contentType: MilkdownContentType
  ): boolean {
    // Use Milkdown for rich text content, tables, and specialized content types
    return (
      field.type === 'textarea' ||
      field.type === 'text' ||
      contentType === 'budget-table' ||
      contentType === 'personnel-table' ||
      contentType === 'timeline' ||
      contentType === 'technical-specification'
    );
  }

  /**
   * Create Milkdown configuration for a field
   */
  private createMilkdownConfig(
    field: ParsedField,
    contentType: MilkdownContentType,
    templateType: APDType,
    _fieldPath: string
  ): MilkdownFieldConfig {
    const plugins = this.getPluginsForContentType(contentType);
    const slashCommands = this.getSlashCommandsForContentType(
      contentType,
      templateType
    );
    const theme = this.getThemeForContentType(contentType);

    return {
      fieldId: field.name,
      editorType: 'milkdown',
      plugins,
      contentType,
      slashCommands,
      theme,
    };
  }

  /**
   * Get Milkdown plugins for specific content type
   */
  private getPluginsForContentType(
    contentType: MilkdownContentType
  ): MilkdownPlugin[] {
    const basePlugins: MilkdownPlugin[] = [
      {
        name: 'commonmark',
        package: '@milkdown/plugin-commonmark',
        lazy: false,
      },
      {
        name: 'gfm',
        package: '@milkdown/plugin-gfm',
        lazy: false,
      },
      {
        name: 'history',
        package: '@milkdown/plugin-history',
        lazy: false,
      },
      {
        name: 'clipboard',
        package: '@milkdown/plugin-clipboard',
        lazy: false,
      },
    ];

    const contentSpecificPlugins: Record<
      MilkdownContentType,
      MilkdownPlugin[]
    > = {
      'rich-text': [
        {
          name: 'block',
          package: '@milkdown/plugin-block',
          lazy: true,
        },
        {
          name: 'slash',
          package: '@milkdown/plugin-slash',
          lazy: true,
        },
        {
          name: 'tooltip',
          package: '@milkdown/plugin-tooltip',
          lazy: true,
        },
      ],
      'budget-table': [
        {
          name: 'table',
          package: '@milkdown/plugin-table',
          lazy: false,
        },
        {
          name: 'math',
          package: '@milkdown/plugin-math',
          lazy: true,
        },
        {
          name: 'slash',
          package: '@milkdown/plugin-slash',
          lazy: true,
        },
      ],
      'personnel-table': [
        {
          name: 'table',
          package: '@milkdown/plugin-table',
          lazy: false,
        },
        {
          name: 'slash',
          package: '@milkdown/plugin-slash',
          lazy: true,
        },
      ],
      'regulatory-reference': [
        {
          name: 'slash',
          package: '@milkdown/plugin-slash',
          lazy: true,
        },
      ],
      timeline: [
        {
          name: 'block',
          package: '@milkdown/plugin-block',
          lazy: true,
        },
        {
          name: 'slash',
          package: '@milkdown/plugin-slash',
          lazy: true,
        },
      ],
      'technical-specification': [
        {
          name: 'prism',
          package: '@milkdown/plugin-prism',
          lazy: true,
        },
        {
          name: 'diagram',
          package: '@milkdown/plugin-diagram',
          lazy: true,
        },
        {
          name: 'slash',
          package: '@milkdown/plugin-slash',
          lazy: true,
        },
      ],
      'executive-summary': [
        {
          name: 'block',
          package: '@milkdown/plugin-block',
          lazy: true,
        },
        {
          name: 'slash',
          package: '@milkdown/plugin-slash',
          lazy: true,
        },
      ],
      'structured-list': [
        {
          name: 'block',
          package: '@milkdown/plugin-block',
          lazy: true,
        },
        {
          name: 'slash',
          package: '@milkdown/plugin-slash',
          lazy: true,
        },
      ],
      'calculation-field': [
        {
          name: 'math',
          package: '@milkdown/plugin-math',
          lazy: true,
        },
      ],
      diagram: [
        {
          name: 'diagram',
          package: '@milkdown/plugin-diagram',
          lazy: true,
        },
      ],
    };

    return [...basePlugins, ...contentSpecificPlugins[contentType]];
  }

  /**
   * Generate APD-specific slash commands
   */
  private generateAPDSlashCommands(templateType: APDType): SlashCommand[] {
    const commonCommands: SlashCommand[] = [
      {
        id: 'budget-table',
        label: 'Budget Table',
        description: 'Insert a budget calculation table',
        keywords: ['budget', 'table', 'calculation', 'ffp'],
        category: 'budget',
        handler: 'insertBudgetTable',
        insertContent:
          '| Category | Federal Share | State Share | Total |\n|----------|---------------|-------------|-------|\n| | | | |',
      },
      {
        id: 'personnel-table',
        label: 'Personnel Table',
        description: 'Insert a personnel resource table',
        keywords: ['personnel', 'staff', 'resources', 'table'],
        category: 'personnel',
        handler: 'insertPersonnelTable',
        insertContent:
          '| Role | % Time | Cost | Responsibilities |\n|------|--------|------|------------------|\n| | | | |',
      },
      {
        id: 'regulatory-ref',
        label: 'Regulatory Reference',
        description: 'Insert a regulatory citation',
        keywords: ['regulation', 'cfr', 'citation', 'compliance'],
        category: 'regulatory',
        handler: 'insertRegulatoryReference',
        insertContent: 'Per [45 CFR §95.610](regulatory-link), ',
      },
      {
        id: 'ffp-calculation',
        label: 'FFP Calculation',
        description: 'Insert Federal Financial Participation calculation',
        keywords: ['ffp', 'federal', 'calculation', 'match'],
        category: 'budget',
        handler: 'insertFFPCalculation',
        insertContent: 'Federal Share (90%): $\nState Share (10%): $\nTotal: $',
      },
    ];

    const typeSpecificCommands: Partial<Record<APDType, SlashCommand[]>> = {
      PAPD: [
        {
          id: 'project-timeline',
          label: 'Project Timeline',
          description: 'Insert a high-level project timeline',
          keywords: ['timeline', 'schedule', 'milestones'],
          category: 'apd',
          handler: 'insertProjectTimeline',
          insertContent:
            '## Project Timeline\n\n- **Phase 1**: Planning (MM/YYYY - MM/YYYY)\n- **Phase 2**: Implementation (MM/YYYY - MM/YYYY)\n- **Phase 3**: Operations (MM/YYYY - MM/YYYY)',
        },
      ],
      IAPD: [
        {
          id: 'aoa-summary',
          label: 'AoA Summary',
          description: 'Insert Analysis of Alternatives summary',
          keywords: ['aoa', 'analysis', 'alternatives'],
          category: 'apd',
          handler: 'insertAoASummary',
          insertContent:
            '## Analysis of Alternatives Summary\n\nThe state conducted a comprehensive Analysis of Alternatives that evaluated [X] alternatives based on [criteria]. The preferred solution is [solution] because [rationale].',
        },
      ],
      OAPD: [
        {
          id: 'activity-status',
          label: 'Activity Status',
          description: 'Insert activity status table',
          keywords: ['activity', 'status', 'operations'],
          category: 'apd',
          handler: 'insertActivityStatus',
          insertContent:
            '| Activity | Status | Completion Date |\n|----------|--------|----------------|\n| | | |',
        },
      ],
    };

    return [...commonCommands, ...(typeSpecificCommands[templateType] || [])];
  }

  /**
   * Get slash commands for specific content type
   */
  private getSlashCommandsForContentType(
    contentType: MilkdownContentType,
    _templateType: APDType
  ): SlashCommand[] {
    return this.slashCommands.filter(cmd => {
      switch (contentType) {
        case 'budget-table':
          return cmd.category === 'budget';
        case 'personnel-table':
          return cmd.category === 'personnel';
        case 'regulatory-reference':
          return cmd.category === 'regulatory';
        default:
          return true; // All commands available for general content
      }
    });
  }

  /**
   * Get theme configuration for content type
   */
  private getThemeForContentType(
    contentType: MilkdownContentType
  ): MilkdownThemeConfig {
    const themeConfigs: Record<MilkdownContentType, MilkdownThemeConfig> = {
      'rich-text': {
        variant: 'standard',
        toolbar: 'floating',
        features: ['bold', 'italic', 'link', 'list'],
      },
      'budget-table': {
        variant: 'budget',
        toolbar: 'fixed',
        features: ['table', 'math', 'calculation'],
      },
      'personnel-table': {
        variant: 'personnel',
        toolbar: 'fixed',
        features: ['table', 'validation'],
      },
      'executive-summary': {
        variant: 'standard',
        toolbar: 'minimal',
        features: ['bold', 'italic', 'list'],
      },
      'technical-specification': {
        variant: 'standard',
        toolbar: 'floating',
        features: ['bold', 'italic', 'code', 'link', 'diagram'],
      },
      timeline: {
        variant: 'compact',
        toolbar: 'minimal',
        features: ['list', 'date'],
      },
      'regulatory-reference': {
        variant: 'compact',
        toolbar: 'minimal',
        features: ['link', 'citation'],
      },
      'structured-list': {
        variant: 'standard',
        toolbar: 'minimal',
        features: ['list', 'checkbox'],
      },
      'calculation-field': {
        variant: 'compact',
        toolbar: 'minimal',
        features: ['math'],
      },
      diagram: {
        variant: 'standard',
        toolbar: 'floating',
        features: ['diagram', 'mermaid'],
      },
    };

    return themeConfigs[contentType];
  }

  // Helper methods for parsing
  private extractTitle(content: string): string {
    // Look for the first H1 header after front matter
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('# ')) {
        return trimmed
          .replace(/^#\s*/, '')
          .replace(/\[.*?\]/g, '')
          .trim();
      }
    }
    return 'APD Template';
  }

  private extractDescription(content: string): string {
    const descMatch = content.match(
      />\s*This template can be used for (.+?)$/m
    );
    return descMatch ? descMatch[1] || '' : '';
  }

  private extractValidationRules(_sections: ParsedSection[]): ValidationRule[] {
    const rules: ValidationRule[] = [];

    // Add common validation rules
    rules.push({
      type: 'required',
      message: 'This field is required',
      value: true,
    });

    return rules;
  }

  private cleanInstructionText(text: string): string {
    return text
      .replace(/\*\*Instruction:\*\*/g, '')
      .replace(/Remove this.*?before submission\./g, '')
      .replace(/\n+/g, ' ')
      .trim();
  }

  private generateFieldName(
    section?: ParsedSection,
    subsection?: ParsedSection
  ): string {
    const sectionName = (subsection?.title || section?.title || 'content')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');

    return `${sectionName}_content`;
  }

  private generateFieldLabel(
    section?: ParsedSection,
    subsection?: ParsedSection
  ): string {
    return subsection?.title || section?.title || 'Content';
  }

  private detectTableType(headers: string[], _templateType: APDType): string {
    const headerText = headers.join(' ').toLowerCase();

    if (headerText.includes('federal') && headerText.includes('state')) {
      return 'budget';
    }
    if (headerText.includes('personnel') || headerText.includes('staff')) {
      return 'personnel';
    }
    if (headerText.includes('activity') || headerText.includes('schedule')) {
      return 'schedule';
    }
    if (headerText.includes('vendor') || headerText.includes('contract')) {
      return 'contract';
    }

    return 'general';
  }

  private generateTableFieldName(headers: string[], tableType: string): string {
    return `${tableType}_table_${headers[0]?.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'data'}`;
  }

  private generateTableLabel(_headers: string[], tableType: string): string {
    return `${tableType.charAt(0).toUpperCase() + tableType.slice(1)} Table`;
  }

  /**
   * Get Milkdown configuration for a specific field
   */
  public getMilkdownConfig(fieldPath: string): MilkdownFieldConfig | undefined {
    return this.milkdownConfigs.get(fieldPath);
  }

  /**
   * Get all generated slash commands
   */
  public getSlashCommands(): SlashCommand[] {
    return this.slashCommands;
  }

  /**
   * Get all Milkdown configurations
   */
  public getAllMilkdownConfigs(): Map<string, MilkdownFieldConfig> {
    return new Map(this.milkdownConfigs);
  }
}
