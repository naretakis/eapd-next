/**
 * Tests for Template Service
 */

import { TemplateService } from '../templateService';
import { APDType } from '../../../types/apd';

describe('TemplateService', () => {
  let service: TemplateService;

  beforeEach(() => {
    service = new TemplateService();
  });

  describe('parseTemplate', () => {
    const sampleMarkdown = `---
State:
  - Test State
Document Type:
  - PAPD
Version:
  - 1.0
---

# Test APD Template

## Executive Summary

> [!info]+
> Provide a brief overview of the project intent and benefits.

[Insert written content here]

## Proposed Budget

> [!info]+
> Include budget information with federal and state shares.
> Calculate FFP at 90% federal, 10% state.

| Category | Federal Share | State Share | Total |
|----------|---------------|-------------|-------|
| Personnel | $90,000 | $10,000 | $100,000 |

[Insert written content here]

## Personnel Resources

> [!info]+
> List staff roles, responsibilities, and hourly rates.

[Insert written content here]
`;

    it('should parse template with all features enabled', async () => {
      const result = await service.parseTemplate(sampleMarkdown, 'PAPD', {
        enableMilkdown: true,
        generateSchema: true,
        analyzeContent: true,
        validationLevel: 'comprehensive',
      });

      expect(result.template).toBeDefined();
      expect(result.template.type).toBe('PAPD');
      expect(result.template.sections).toHaveLength(3);

      expect(result.schema).toBeDefined();
      expect(result.schema.interfaces).toContain('PAPDData');

      expect(result.milkdownConfigs.size).toBeGreaterThan(0);
      expect(result.contentAnalyses.size).toBeGreaterThan(0);
      expect(result.slashCommands.length).toBeGreaterThan(0);
      expect(result.fieldMappings.length).toBeGreaterThan(0);

      expect(result.metadata).toBeDefined();
      expect(result.metadata.templateType).toBe('PAPD');
      expect(result.metadata.fieldCount).toBeGreaterThan(0);
      expect(result.metadata.sectionCount).toBe(3);
    });

    it('should parse template with minimal features', async () => {
      const result = await service.parseTemplate(sampleMarkdown, 'PAPD', {
        enableMilkdown: false,
        generateSchema: false,
        analyzeContent: false,
      });

      expect(result.template).toBeDefined();
      expect(result.milkdownConfigs.size).toBe(0);
      expect(result.contentAnalyses.size).toBe(0);
      expect(result.schema.interfaces).toBe('');
    });

    it('should handle custom slash commands', async () => {
      const customCommands = [
        {
          id: 'custom-command',
          label: 'Custom Command',
          description: 'A custom slash command',
          keywords: ['custom'],
          category: 'apd' as const,
          handler: 'handleCustom',
        },
      ];

      const result = await service.parseTemplate(sampleMarkdown, 'PAPD', {
        customSlashCommands: customCommands,
      });

      expect(result.slashCommands).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 'custom-command' }),
        ])
      );
    });
  });

  describe('getAvailableTemplates', () => {
    it('should return list of available templates', () => {
      const templates = service.getAvailableTemplates();

      expect(templates).toHaveLength(3);
      expect(templates).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'PAPD',
            name: 'MES APD Template (PAPD/IAPD/APDU)',
          }),
          expect.objectContaining({
            type: 'OAPD',
            name: 'MES OAPD Template',
          }),
        ])
      );
    });
  });

  describe('validateTemplate', () => {
    it('should validate template structure', () => {
      const template = {
        id: 'test-template',
        type: 'PAPD' as APDType,
        version: '1.0',
        name: 'Test Template',
        sections: [
          {
            id: 'executive_summary',
            title: 'Executive Summary',
            fields: [
              {
                id: 'summary_content',
                name: 'summary_content',
                label: 'Summary Content',
                type: 'textarea' as const,
                required: true,
                validation: [
                  {
                    type: 'required' as const,
                    message: 'This field is required',
                    value: true,
                  },
                ],
              },
            ],
            isRequired: true,
            order: 0,
          },
        ],
        validationRules: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const validation = service.validateTemplate(template);

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect missing required sections', () => {
      const template = {
        id: 'test-template',
        type: 'PAPD' as APDType,
        version: '1.0',
        name: 'Test Template',
        sections: [], // Missing required sections
        validationRules: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const validation = service.validateTemplate(template);

      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors[0]).toContain('Missing required section');
    });

    it('should detect validation issues', () => {
      const template = {
        id: 'test-template',
        type: 'PAPD' as APDType,
        version: '1.0',
        name: 'Test Template',
        sections: [
          {
            id: 'test_section',
            title: 'Test Section',
            fields: [
              {
                id: 'required_field',
                name: 'required_field',
                label: 'Required Field',
                type: 'text' as const,
                required: true,
                validation: [], // Missing required validation rule
              },
            ],
            isRequired: true,
            order: 0,
          },
        ],
        validationRules: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const validation = service.validateTemplate(template);

      expect(validation.warnings.length).toBeGreaterThan(0);
      expect(validation.warnings[0]).toContain(
        'missing required validation rule'
      );
    });
  });

  describe('generateCustomSlashCommands', () => {
    it('should generate custom slash commands with project context', () => {
      const commands = service.generateCustomSlashCommands('PAPD', {
        projectName: 'Test MMIS Project',
        stateName: 'Test State',
        systemType: 'MMIS',
      });

      expect(commands).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'state-name',
            insertContent: 'Test State',
          }),
          expect.objectContaining({
            id: 'project-name',
            insertContent: 'Test MMIS Project',
          }),
          expect.objectContaining({
            id: 'system-type',
            insertContent: 'MMIS (Medicaid Management Information System)',
          }),
        ])
      );
    });

    it('should generate E&E system type command', () => {
      const commands = service.generateCustomSlashCommands('PAPD', {
        systemType: 'E&E',
      });

      const systemCommand = commands.find(cmd => cmd.id === 'system-type');
      expect(systemCommand?.insertContent).toContain(
        'Eligibility and Enrollment System'
      );
    });

    it('should handle missing project context', () => {
      const commands = service.generateCustomSlashCommands('PAPD');

      expect(commands).toHaveLength(0);
    });
  });

  describe('getMilkdownConfigForField', () => {
    it('should return Milkdown config for specific field', async () => {
      const sampleMarkdown = `# Test

## Budget Section

[Insert written content here]
`;

      const result = await service.parseTemplate(sampleMarkdown, 'PAPD');
      const fieldPath = 'Budget Section.budget_section_content';

      const config = service.getMilkdownConfigForField(fieldPath, result);

      if (config) {
        expect(config.editorType).toBe('milkdown');
        expect(config.contentType).toBeDefined();
      }
    });
  });

  describe('getContentAnalysisForField', () => {
    it('should return content analysis for specific field', async () => {
      const sampleMarkdown = `# Test

## Budget Section

> [!info]+
> Include budget calculations with FFP rates.

[Insert written content here]
`;

      const result = await service.parseTemplate(sampleMarkdown, 'PAPD');
      const fieldPath = 'budget_section_content';

      const analysis = service.getContentAnalysisForField(fieldPath, result);

      if (analysis) {
        expect(analysis.contentType).toBeDefined();
        expect(analysis.confidence).toBeGreaterThan(0);
        expect(analysis.complexity).toBeDefined();
      }
    });
  });

  describe('error handling', () => {
    it('should handle invalid markdown gracefully', async () => {
      const invalidMarkdown = `# Incomplete Template

## Section without content
`;

      const result = await service.parseTemplate(invalidMarkdown, 'PAPD');

      expect(result.template).toBeDefined();
      expect(result.template.sections).toHaveLength(1);
      expect(result.metadata.fieldCount).toBe(0);
    });

    it('should handle empty template', async () => {
      const emptyMarkdown = '';

      const result = await service.parseTemplate(emptyMarkdown, 'PAPD');

      expect(result.template).toBeDefined();
      expect(result.template.sections).toHaveLength(0);
      expect(result.metadata.fieldCount).toBe(0);
    });
  });

  describe('validation levels', () => {
    const sampleMarkdown = `# Test Template

## Section

[Insert written content here]
`;

    it('should apply basic validation level', async () => {
      const result = await service.parseTemplate(sampleMarkdown, 'PAPD', {
        validationLevel: 'basic',
      });

      expect(result.template.validationRules.length).toBeGreaterThan(0);
    });

    it('should apply strict validation level', async () => {
      const result = await service.parseTemplate(sampleMarkdown, 'PAPD', {
        validationLevel: 'strict',
      });

      expect(result.template.validationRules.length).toBeGreaterThan(0);
      expect(result.template.validationRules).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            message: expect.stringContaining('APD formatting standards'),
          }),
        ])
      );
    });

    it('should apply comprehensive validation level', async () => {
      const result = await service.parseTemplate(sampleMarkdown, 'PAPD', {
        validationLevel: 'comprehensive',
      });

      expect(result.template.validationRules.length).toBeGreaterThan(0);
      expect(result.template.validationRules).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            message: expect.stringContaining('complete and consistent'),
          }),
        ])
      );
    });
  });
});
