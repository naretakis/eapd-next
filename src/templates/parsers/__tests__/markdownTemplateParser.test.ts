/**
 * Tests for Markdown Template Parser with Milkdown Integration
 */

import { MarkdownTemplateParser } from '../markdownTemplateParser';

describe('MarkdownTemplateParser', () => {
  let parser: MarkdownTemplateParser;

  beforeEach(() => {
    parser = new MarkdownTemplateParser();
  });

  describe('parseTemplate', () => {
    it('should parse front matter correctly', async () => {
      const markdownContent = `---
State:
  - Full State Name
Document Type:
  - PAPD
  - IAPD
  - OAPD
Version:
  - 1.0
---

# Test APD Template

## Executive Summary

[Insert written content here]
`;

      const result = await parser.parseTemplate(markdownContent, 'PAPD');

      expect(result.metadata.type).toBe('PAPD');
      expect(result.metadata.version).toBe('1.0');
      expect(result.metadata.title).toBe('Test APD Template');
    });

    it('should parse sections and subsections', async () => {
      const markdownContent = `# Test Template

## 1. Executive Summary

> [!info]+
> This is help text for the executive summary section.

[Insert written content here]

### 1.1 Project Overview

[Insert written content here]

## 2. Budget Information

### 2.1 Personnel Costs

[Insert written content here]
`;

      const result = await parser.parseTemplate(markdownContent, 'PAPD');

      expect(result.sections).toHaveLength(2);
      expect(result.sections[0].title).toBe('1. Executive Summary');
      expect(result.sections[0].helpText).toContain(
        'help text for the executive summary'
      );
      expect(result.sections[0].subsections).toHaveLength(1);
      expect(result.sections[0].subsections![0].title).toBe(
        '1.1 Project Overview'
      );
    });

    it('should parse table fields correctly', async () => {
      const markdownContent = `# Test Template

## Budget Section

| Category | Federal Share | State Share | Total |
|----------|---------------|-------------|-------|
| Personnel | $90,000 | $10,000 | $100,000 |
| Hardware | $45,000 | $5,000 | $50,000 |
`;

      const result = await parser.parseTemplate(markdownContent, 'PAPD');

      expect(result.sections[0].fields).toHaveLength(1);
      expect(result.sections[0].fields[0].type).toBe('table');
      expect(result.sections[0].fields[0].label).toContain('Table');
    });

    it('should generate Milkdown configurations for appropriate fields', async () => {
      const markdownContent = `# Test Template

## Executive Summary

[Insert written content here]

## Budget Tables

| Category | Federal Share | State Share |
|----------|---------------|-------------|
| | | |

## Personnel Resources

| Staff Title | % Time | Cost |
|-------------|--------|------|
| | | |
`;

      const result = await parser.parseTemplate(markdownContent, 'PAPD');

      const milkdownConfigs = parser.getAllMilkdownConfigs();
      expect(milkdownConfigs.size).toBeGreaterThan(0);

      // Check that budget-related content gets appropriate configuration
      const budgetConfig = Array.from(milkdownConfigs.values()).find(
        config => config.contentType === 'budget-table'
      );
      expect(budgetConfig).toBeDefined();
      expect(budgetConfig?.plugins.some(p => p.name === 'table')).toBe(true);
      expect(budgetConfig?.plugins.some(p => p.name === 'math')).toBe(true);
    });
  });

  describe('content type detection', () => {
    it('should detect budget content type', async () => {
      const markdownContent = `# Test Template

## Proposed Budget

> [!info]+
> Include the proposed budget with federal and state shares.
> Calculate FFP rates at 90% federal, 10% state.

[Insert written content here]
`;

      await parser.parseTemplate(markdownContent, 'PAPD');
      const configs = parser.getAllMilkdownConfigs();

      const budgetConfig = Array.from(configs.values()).find(
        config => config.contentType === 'budget-table'
      );
      expect(budgetConfig).toBeDefined();
    });

    it('should detect personnel content type', async () => {
      const markdownContent = `# Test Template

## Personnel Resource Statement

> [!info]+
> Provide staffing requirements and personnel costs.

[Insert written content here]
`;

      await parser.parseTemplate(markdownContent, 'PAPD');
      const configs = parser.getAllMilkdownConfigs();

      const personnelConfig = Array.from(configs.values()).find(
        config => config.contentType === 'personnel-table'
      );
      expect(personnelConfig).toBeDefined();
    });

    it('should detect regulatory reference content type', async () => {
      const markdownContent = `# Test Template

## Regulatory Compliance

> [!info]+
> Ensure compliance with 45 CFR §95.610 requirements.

[Insert written content here]
`;

      await parser.parseTemplate(markdownContent, 'PAPD');
      const configs = parser.getAllMilkdownConfigs();

      const regulatoryConfig = Array.from(configs.values()).find(
        config => config.contentType === 'regulatory-reference'
      );
      expect(regulatoryConfig).toBeDefined();
    });
  });

  describe('slash commands generation', () => {
    it('should generate APD-specific slash commands', async () => {
      await parser.parseTemplate('# Test', 'PAPD');
      const slashCommands = parser.getSlashCommands();

      expect(slashCommands.length).toBeGreaterThan(0);

      const budgetCommand = slashCommands.find(
        cmd => cmd.id === 'budget-table'
      );
      expect(budgetCommand).toBeDefined();
      expect(budgetCommand?.category).toBe('budget');

      const personnelCommand = slashCommands.find(
        cmd => cmd.id === 'personnel-table'
      );
      expect(personnelCommand).toBeDefined();
      expect(personnelCommand?.category).toBe('personnel');

      const regulatoryCommand = slashCommands.find(
        cmd => cmd.id === 'regulatory-ref'
      );
      expect(regulatoryCommand).toBeDefined();
      expect(regulatoryCommand?.category).toBe('regulatory');
    });

    it('should generate type-specific slash commands for PAPD', async () => {
      await parser.parseTemplate('# Test', 'PAPD');
      const slashCommands = parser.getSlashCommands();

      const timelineCommand = slashCommands.find(
        cmd => cmd.id === 'project-timeline'
      );
      expect(timelineCommand).toBeDefined();
    });

    it('should generate type-specific slash commands for IAPD', async () => {
      await parser.parseTemplate('# Test', 'IAPD');
      const slashCommands = parser.getSlashCommands();

      const aoaCommand = slashCommands.find(cmd => cmd.id === 'aoa-summary');
      expect(aoaCommand).toBeDefined();
    });

    it('should generate type-specific slash commands for OAPD', async () => {
      await parser.parseTemplate('# Test', 'OAPD');
      const slashCommands = parser.getSlashCommands();

      const activityCommand = slashCommands.find(
        cmd => cmd.id === 'activity-status'
      );
      expect(activityCommand).toBeDefined();
    });
  });

  describe('plugin configuration', () => {
    it('should configure appropriate plugins for budget tables', async () => {
      const markdownContent = `# Test

## Budget

[Insert written content here]
`;

      await parser.parseTemplate(markdownContent, 'PAPD');
      const configs = parser.getAllMilkdownConfigs();

      const budgetConfig = Array.from(configs.values()).find(
        config => config.contentType === 'budget-table'
      );

      expect(budgetConfig?.plugins).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'commonmark' }),
          expect.objectContaining({ name: 'gfm' }),
          expect.objectContaining({ name: 'table' }),
          expect.objectContaining({ name: 'math' }),
          expect.objectContaining({ name: 'slash' }),
        ])
      );
    });

    it('should configure appropriate plugins for technical specifications', async () => {
      const markdownContent = `# Test

## Technical Requirements

> [!info]+
> Describe system architecture and technical specifications.

[Insert written content here]
`;

      await parser.parseTemplate(markdownContent, 'PAPD');
      const configs = parser.getAllMilkdownConfigs();

      const techConfig = Array.from(configs.values()).find(
        config => config.contentType === 'technical-specification'
      );

      expect(techConfig?.plugins).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'prism' }),
          expect.objectContaining({ name: 'diagram' }),
        ])
      );
    });
  });

  describe('help text extraction', () => {
    it('should extract and clean instruction text', async () => {
      const markdownContent = `# Test Template

## Section

> [!info]+
> **Instruction:** Remove this page before submission.
> This is helpful guidance for completing the section.
> Include specific requirements and examples.

[Insert written content here]
`;

      const result = await parser.parseTemplate(markdownContent, 'PAPD');

      expect(result.sections[0].helpText).toBeDefined();
      expect(result.sections[0].helpText).not.toContain('**Instruction:**');
      expect(result.sections[0].helpText).not.toContain('Remove this');
      expect(result.sections[0].helpText).toContain('helpful guidance');
    });
  });

  describe('validation rules generation', () => {
    it('should generate basic validation rules', async () => {
      const markdownContent = `# Test Template

## Required Section

[Insert written content here]
`;

      const result = await parser.parseTemplate(markdownContent, 'PAPD');

      expect(result.validationRules).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'required',
            message: 'This field is required',
          }),
        ])
      );
    });
  });

  describe('error handling', () => {
    it('should handle malformed front matter gracefully', async () => {
      const markdownContent = `---
Invalid YAML:
  - Missing closing
# Missing closing ---

# Test Template
`;

      const result = await parser.parseTemplate(markdownContent, 'PAPD');

      expect(result.metadata.type).toBe('PAPD');
      // The title extraction will get the first line that looks like a header
      expect(result.metadata.title).toBe('Missing closing ---');
    });

    it('should handle templates without front matter', async () => {
      const markdownContent = `# Test Template

## Section

[Insert written content here]
`;

      const result = await parser.parseTemplate(markdownContent, 'PAPD');

      expect(result.metadata.type).toBe('PAPD');
      expect(result.metadata.version).toBe('1.0');
    });

    it('should handle empty sections gracefully', async () => {
      const markdownContent = `# Test Template

## Empty Section

## Another Section

[Insert written content here]
`;

      const result = await parser.parseTemplate(markdownContent, 'PAPD');

      expect(result.sections).toHaveLength(2);
      expect(result.sections[0].fields).toHaveLength(0);
      expect(result.sections[1].fields).toHaveLength(1);
    });
  });
});
