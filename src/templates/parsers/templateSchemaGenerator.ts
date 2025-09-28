/**
 * Template Schema Generator with Milkdown Integration
 *
 * Generates TypeScript interfaces and validation schemas from parsed templates
 * with support for Milkdown-specific field types and configurations.
 */

import {
  ParsedTemplate,
  ParsedSection,
  ParsedField,
  ValidationRule,
  FieldType,
} from '../../types/template';
import { APDType } from '../../types/apd';
import {
  MilkdownFieldConfig,
  MilkdownContentType,
} from './markdownTemplateParser';

export interface GeneratedSchema {
  interfaces: string;
  validationSchema: ValidationSchema;
  milkdownConfigs: Record<string, MilkdownFieldConfig>;
  fieldMappings: FieldMapping[];
}

export interface ValidationSchema {
  sections: SectionValidation[];
  globalRules: ValidationRule[];
}

export interface SectionValidation {
  sectionId: string;
  required: boolean;
  fields: FieldValidation[];
}

export interface FieldValidation {
  fieldId: string;
  fieldPath: string;
  type: FieldType;
  required: boolean;
  rules: ValidationRule[];
  milkdownConfig?: MilkdownFieldConfig;
}

export interface FieldMapping {
  fieldPath: string;
  fieldId: string;
  label: string;
  type: FieldType;
  milkdownContentType?: MilkdownContentType;
  component: string;
  props: Record<string, unknown>;
}

/**
 * Generates TypeScript interfaces and validation schemas from parsed templates
 */
export class TemplateSchemaGenerator {
  /**
   * Generate complete schema from parsed template
   */
  public generateSchema(
    parsedTemplate: ParsedTemplate,
    milkdownConfigs: Map<string, MilkdownFieldConfig>
  ): GeneratedSchema {
    const interfaces = this.generateTypeScriptInterfaces(parsedTemplate);
    const validationSchema = this.generateValidationSchema(
      parsedTemplate,
      milkdownConfigs
    );
    const fieldMappings = this.generateFieldMappings(
      parsedTemplate,
      milkdownConfigs
    );

    return {
      interfaces,
      validationSchema,
      milkdownConfigs: Object.fromEntries(milkdownConfigs),
      fieldMappings,
    };
  }

  /**
   * Generate TypeScript interfaces for the template
   */
  private generateTypeScriptInterfaces(parsedTemplate: ParsedTemplate): string {
    const { metadata, sections } = parsedTemplate;
    const interfaceName = this.generateInterfaceName(metadata.type);

    let interfaces = `/**
 * Generated TypeScript interfaces for ${metadata.title}
 * Generated on: ${new Date().toISOString()}
 * Template Type: ${metadata.type}
 * Version: ${metadata.version}
 */

import { MilkdownEditorValue } from '../components/forms/MilkdownEditor';

`;

    // Generate main APD interface
    interfaces += `export interface ${interfaceName} {
  id: string;
  type: '${metadata.type}';
  metadata: ${interfaceName}Metadata;
  sections: ${interfaceName}Sections;
  createdAt: Date;
  updatedAt: Date;
  version: string;
}

`;

    // Generate metadata interface
    interfaces += `export interface ${interfaceName}Metadata {
  stateName: string;
  stateAgency: string;
  primaryContact: string;
  contactJobTitle: string;
  contactEmail: string;
  contactPhone: string;
  submissionDate: Date;
  benefitsMultiplePrograms: boolean;
  documentVersion: string;
}

`;

    // Generate sections interface
    interfaces += `export interface ${interfaceName}Sections {\n`;
    sections.forEach(section => {
      const sectionName = this.toCamelCase(section.title);
      interfaces += `  ${sectionName}: ${interfaceName}${this.toPascalCase(section.title)};\n`;
    });
    interfaces += `}\n\n`;

    // Generate individual section interfaces
    sections.forEach(section => {
      interfaces += this.generateSectionInterface(section, interfaceName);
    });

    return interfaces;
  }

  /**
   * Generate interface for a single section
   */
  private generateSectionInterface(
    section: ParsedSection,
    baseInterfaceName: string
  ): string {
    const sectionInterfaceName = `${baseInterfaceName}${this.toPascalCase(section.title)}`;
    let sectionInterface = `export interface ${sectionInterfaceName} {\n`;

    // Add fields
    section.fields.forEach(field => {
      const fieldType = this.getTypeScriptType(field);
      const optional = field.required ? '' : '?';
      sectionInterface += `  ${this.toCamelCase(field.name)}${optional}: ${fieldType};\n`;
    });

    // Add subsections
    section.subsections?.forEach(subsection => {
      const subsectionName = this.toCamelCase(subsection.title);
      const subsectionType = `${sectionInterfaceName}${this.toPascalCase(subsection.title)}`;
      sectionInterface += `  ${subsectionName}: ${subsectionType};\n`;
    });

    sectionInterface += `}\n\n`;

    // Generate subsection interfaces
    section.subsections?.forEach(subsection => {
      sectionInterface += this.generateSubsectionInterface(
        subsection,
        sectionInterfaceName
      );
    });

    return sectionInterface;
  }

  /**
   * Generate interface for a subsection
   */
  private generateSubsectionInterface(
    subsection: ParsedSection,
    parentInterfaceName: string
  ): string {
    const subsectionInterfaceName = `${parentInterfaceName}${this.toPascalCase(subsection.title)}`;
    let subsectionInterface = `export interface ${subsectionInterfaceName} {\n`;

    subsection.fields.forEach(field => {
      const fieldType = this.getTypeScriptType(field);
      const optional = field.required ? '' : '?';
      subsectionInterface += `  ${this.toCamelCase(field.name)}${optional}: ${fieldType};\n`;
    });

    subsectionInterface += `}\n\n`;

    return subsectionInterface;
  }

  /**
   * Get TypeScript type for a field
   */
  private getTypeScriptType(field: ParsedField): string {
    switch (field.type) {
      case 'text':
      case 'textarea':
        return 'string | MilkdownEditorValue';
      case 'number':
      case 'currency':
      case 'percentage':
        return 'number';
      case 'date':
        return 'Date';
      case 'select':
      case 'radio':
        return field.options
          ? field.options.map(opt => `'${opt.value}'`).join(' | ')
          : 'string';
      case 'multiselect':
        return field.options
          ? `(${field.options.map(opt => `'${opt.value}'`).join(' | ')})[]`
          : 'string[]';
      case 'checkbox':
        return 'boolean';
      case 'table':
        return `${this.toPascalCase(field.name)}Row[]`;
      case 'file':
        return 'File | null';
      default:
        return 'unknown';
    }
  }

  /**
   * Generate validation schema
   */
  private generateValidationSchema(
    parsedTemplate: ParsedTemplate,
    milkdownConfigs: Map<string, MilkdownFieldConfig>
  ): ValidationSchema {
    const sections: SectionValidation[] = [];

    parsedTemplate.sections.forEach(section => {
      const sectionValidation = this.generateSectionValidation(
        section,
        milkdownConfigs
      );
      sections.push(sectionValidation);
    });

    return {
      sections,
      globalRules: parsedTemplate.validationRules,
    };
  }

  /**
   * Generate validation for a section
   */
  private generateSectionValidation(
    section: ParsedSection,
    milkdownConfigs: Map<string, MilkdownFieldConfig>,
    parentPath = ''
  ): SectionValidation {
    const sectionPath = parentPath
      ? `${parentPath}.${section.title}`
      : section.title;
    const fields: FieldValidation[] = [];

    section.fields.forEach(field => {
      const fieldPath = `${sectionPath}.${field.name}`;
      const milkdownConfig = milkdownConfigs.get(fieldPath);

      const fieldValidation: FieldValidation = {
        fieldId: field.name,
        fieldPath,
        type: field.type,
        required: field.required,
        rules: this.generateFieldValidationRules(field, milkdownConfig),
        ...(milkdownConfig && { milkdownConfig }),
      };

      fields.push(fieldValidation);
    });

    // Add subsection fields
    section.subsections?.forEach(subsection => {
      const subsectionValidation = this.generateSectionValidation(
        subsection,
        milkdownConfigs,
        sectionPath
      );
      fields.push(...subsectionValidation.fields);
    });

    return {
      sectionId: this.toCamelCase(section.title),
      required: true,
      fields,
    };
  }

  /**
   * Generate validation rules for a field
   */
  private generateFieldValidationRules(
    field: ParsedField,
    milkdownConfig?: MilkdownFieldConfig
  ): ValidationRule[] {
    const rules: ValidationRule[] = [];

    // Required validation
    if (field.required) {
      rules.push({
        type: 'required',
        message: `${field.label} is required`,
        value: true,
      });
    }

    // Type-specific validation
    switch (field.type) {
      case 'text':
      case 'textarea':
        if (milkdownConfig?.contentType === 'budget-table') {
          rules.push({
            type: 'custom',
            message: 'Budget calculations must be valid',
            validator: (value: unknown) => {
              // Custom validation for budget tables
              return typeof value === 'string' && value.length > 0;
            },
          });
        }
        break;

      case 'number':
      case 'currency':
        rules.push({
          type: 'min',
          value: 0,
          message: 'Value must be greater than or equal to 0',
        });
        break;

      case 'percentage':
        rules.push({
          type: 'min',
          value: 0,
          message: 'Percentage must be between 0 and 100',
        });
        rules.push({
          type: 'max',
          value: 100,
          message: 'Percentage must be between 0 and 100',
        });
        break;
    }

    // Milkdown-specific validation
    if (milkdownConfig) {
      rules.push(...this.generateMilkdownValidationRules(milkdownConfig));
    }

    return rules;
  }

  /**
   * Generate Milkdown-specific validation rules
   */
  private generateMilkdownValidationRules(
    config: MilkdownFieldConfig
  ): ValidationRule[] {
    const rules: ValidationRule[] = [];

    switch (config.contentType) {
      case 'budget-table':
        rules.push({
          type: 'custom',
          message: 'Budget table must have valid calculations',
          validator: () => {
            // Validate budget table structure and calculations
            return true; // Placeholder
          },
        });
        break;

      case 'personnel-table':
        rules.push({
          type: 'custom',
          message: 'Personnel table must have valid resource allocations',
          validator: () => {
            // Validate personnel table structure
            return true; // Placeholder
          },
        });
        break;

      case 'regulatory-reference':
        rules.push({
          type: 'pattern',
          value: /\d+\s+CFR\s+§?\s*\d+/,
          message:
            'Must include valid regulatory citation (e.g., "45 CFR §95.610")',
        });
        break;
    }

    return rules;
  }

  /**
   * Generate field mappings for form generation
   */
  private generateFieldMappings(
    parsedTemplate: ParsedTemplate,
    milkdownConfigs: Map<string, MilkdownFieldConfig>
  ): FieldMapping[] {
    const mappings: FieldMapping[] = [];

    const processSection = (section: ParsedSection, parentPath = '') => {
      const sectionPath = parentPath
        ? `${parentPath}.${section.title}`
        : section.title;

      section.fields.forEach(field => {
        const fieldPath = `${sectionPath}.${field.name}`;
        const milkdownConfig = milkdownConfigs.get(fieldPath);

        const mapping: FieldMapping = {
          fieldPath,
          fieldId: field.name,
          label: field.label,
          type: field.type,
          component: this.getComponentName(field, milkdownConfig),
          props: this.generateComponentProps(field, milkdownConfig),
          ...(milkdownConfig?.contentType && {
            milkdownContentType: milkdownConfig.contentType,
          }),
        };

        mappings.push(mapping);
      });

      section.subsections?.forEach(subsection => {
        processSection(subsection, sectionPath);
      });
    };

    parsedTemplate.sections.forEach(section => processSection(section));

    return mappings;
  }

  /**
   * Get component name for field
   */
  private getComponentName(
    field: ParsedField,
    milkdownConfig?: MilkdownFieldConfig
  ): string {
    if (milkdownConfig) {
      switch (milkdownConfig.contentType) {
        case 'budget-table':
          return 'BudgetTableEditor';
        case 'personnel-table':
          return 'PersonnelTableEditor';
        case 'regulatory-reference':
          return 'RegulatoryReferenceEditor';
        default:
          return 'MilkdownEditor';
      }
    }

    switch (field.type) {
      case 'text':
        return 'TextField';
      case 'textarea':
        return 'TextAreaField';
      case 'number':
      case 'currency':
      case 'percentage':
        return 'NumberField';
      case 'date':
        return 'DateField';
      case 'select':
        return 'SelectField';
      case 'multiselect':
        return 'MultiSelectField';
      case 'checkbox':
        return 'CheckboxField';
      case 'radio':
        return 'RadioField';
      case 'table':
        return 'TableField';
      case 'file':
        return 'FileField';
      default:
        return 'TextField';
    }
  }

  /**
   * Generate component props
   */
  private generateComponentProps(
    field: ParsedField,
    milkdownConfig?: MilkdownFieldConfig
  ): Record<string, unknown> {
    const baseProps = {
      label: field.label,
      required: field.required,
      helpText: field.helpText,
    };

    if (milkdownConfig) {
      return {
        ...baseProps,
        milkdownConfig,
        editorType: 'milkdown',
      };
    }

    // Type-specific props
    switch (field.type) {
      case 'select':
      case 'multiselect':
      case 'radio':
        return {
          ...baseProps,
          options: field.options || [],
        };
      case 'number':
      case 'currency':
      case 'percentage':
        return {
          ...baseProps,
          type: field.type,
          min: 0,
        };
      default:
        return baseProps;
    }
  }

  // Utility methods
  private generateInterfaceName(apdType: APDType): string {
    return `${apdType}Data`;
  }

  private toCamelCase(str: string): string {
    return str
      .replace(/[^a-zA-Z0-9]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .map((word, index) =>
        index === 0
          ? word.toLowerCase()
          : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      )
      .join('');
  }

  private toPascalCase(str: string): string {
    return str
      .replace(/[^a-zA-Z0-9]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }
}
