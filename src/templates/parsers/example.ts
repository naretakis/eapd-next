/**
 * Example usage of the Advanced Markdown Template Parser
 *
 * This example demonstrates how to parse APD templates and generate
 * Milkdown configurations for rich text editing.
 */

import { TemplateService } from './templateService';

// Sample APD template content
const sampleAPDTemplate = `---
State:
  - Example State
State Medicaid Agency:
  - Example State Medicaid Agency
Document Type:
  - PAPD
  - IAPD
  - OAPD
Version:
  - 1.0
---

# Example State Advanced Planning Document (MES APD)

## Executive Summary

> [!info]+
> Please draft a brief executive summary (one or two paragraphs) that presents 
> the intent of this APD and includes information about the MES landscape.

[Insert written content here]

## 1. Project Management Plan

> [!info]+
> Describe the project organization, including personnel roles and approach
> to working with business programs.

[Insert written content here]

## 2. Proposed Budget

> [!info]+
> Include the proposed budget with federal and state shares.
> Calculate FFP rates at 90% federal, 10% state for DDI activities.

### Table D. Sample State Proposed Budget

| State Cost Category  | 90% Federal Share | 10% State Share | Total        |
| -------------------- | ----------------- | --------------- | ------------ |
| State Personnel      | $418,500          | $46,500         | $465,000     |
| Contractor Personnel | $0                | $0              | $0           |
| System Hardware      | $0                | $0              | $0           |
| **Grand Total**      | **$418,500**      | **$46,500**     | **$465,000** |

[Insert written content here]

## 3. Personnel Resource Statement

> [!info]+
> Provide an estimate of total staffing requirements and personnel costs.
> Include hourly rates and job responsibilities.

### Table A. Sample State Resource Table

| State Staff Title | % of Time | Cost with Benefits | Description of Responsibilities |
| ----------------- | --------- | ------------------ | ------------------------------- |
| Project Director  | 100       | $150,000           | Provides leadership for project |
| Business Analyst  | 80        | $120,000           | Gathers requirements and analysis |

[Insert written content here]

## 4. Regulatory Compliance

> [!info]+
> Ensure compliance with 45 CFR §95.610 and 42 CFR §433.112 requirements.
> Address all conditions for enhanced funding.

[Insert written content here]
`;

/**
 * Example function demonstrating template parsing
 */
export async function parseAPDTemplateExample(): Promise<void> {
  console.log('🚀 Starting APD Template Parsing Example\n');

  // Create template service
  const templateService = new TemplateService();

  try {
    // Parse the template with full features enabled
    console.log('📝 Parsing APD template...');
    const result = await templateService.parseTemplate(
      sampleAPDTemplate,
      'PAPD',
      {
        enableMilkdown: true,
        generateSchema: true,
        analyzeContent: true,
        validationLevel: 'comprehensive',
      }
    );

    // Display parsing results
    console.log('\n✅ Template parsed successfully!');
    console.log(`📊 Metadata:
  - Type: ${result.metadata.templateType}
  - Version: ${result.metadata.version}
  - Sections: ${result.metadata.sectionCount}
  - Fields: ${result.metadata.fieldCount}
  - Milkdown Fields: ${result.metadata.milkdownFieldCount}`);

    console.log(`\n🧩 Complexity Distribution:
  - Simple: ${result.metadata.complexityDistribution.simple}
  - Moderate: ${result.metadata.complexityDistribution.moderate}
  - Complex: ${result.metadata.complexityDistribution.complex}`);

    // Show sections and their content types
    console.log('\n📋 Sections and Content Analysis:');
    result.template.sections.forEach((section, index) => {
      console.log(`  ${index + 1}. ${section.title}`);

      section.fields.forEach(field => {
        const fieldPath = `${section.title}.${field.name}`;
        const analysis = result.contentAnalyses.get(field.name);
        const milkdownConfig = result.milkdownConfigs.get(fieldPath);

        console.log(`     - ${field.label}`);
        console.log(`       Type: ${field.type}`);

        if (analysis) {
          console.log(
            `       Content Type: ${analysis.contentType} (${Math.round(analysis.confidence * 100)}% confidence)`
          );
          console.log(`       Complexity: ${analysis.complexity}`);
        }

        if (milkdownConfig) {
          console.log(
            `       Milkdown Plugins: ${milkdownConfig.plugins.map(p => p.name).join(', ')}`
          );
        }
      });
    });

    // Show available slash commands
    console.log('\n⚡ Available Slash Commands:');
    result.slashCommands.forEach(cmd => {
      console.log(`  /${cmd.id} - ${cmd.description} (${cmd.category})`);
    });

    // Show generated TypeScript interfaces (first 500 chars)
    console.log('\n🔧 Generated TypeScript Interfaces (preview):');
    console.log(result.schema.interfaces.substring(0, 500) + '...');

    // Demonstrate field-specific configuration
    console.log('\n🎯 Field-Specific Configurations:');

    // Find a budget field
    const budgetFieldPath = Array.from(result.milkdownConfigs.keys()).find(
      path => path.toLowerCase().includes('budget')
    );

    if (budgetFieldPath) {
      const budgetConfig = result.milkdownConfigs.get(budgetFieldPath);
      console.log(`  Budget Field (${budgetFieldPath}):`);
      console.log(`    Content Type: ${budgetConfig?.contentType}`);
      console.log(
        `    Plugins: ${budgetConfig?.plugins.map(p => p.name).join(', ')}`
      );
      console.log(`    Theme: ${budgetConfig?.theme?.variant}`);
    }

    // Validate the template
    console.log('\n✅ Template Validation:');
    const validation = templateService.validateTemplate(result.template);
    console.log(`  Valid: ${validation.isValid}`);
    console.log(`  Errors: ${validation.errors.length}`);
    console.log(`  Warnings: ${validation.warnings.length}`);

    if (validation.errors.length > 0) {
      console.log('  Errors:');
      validation.errors.forEach(error => console.log(`    - ${error}`));
    }

    if (validation.warnings.length > 0) {
      console.log('  Warnings:');
      validation.warnings.forEach(warning => console.log(`    - ${warning}`));
    }

    // Generate custom slash commands
    console.log('\n🎨 Custom Slash Commands:');
    const customCommands = templateService.generateCustomSlashCommands('PAPD', {
      projectName: 'Example MMIS Modernization',
      stateName: 'Example State',
      systemType: 'MMIS',
    });

    customCommands.forEach(cmd => {
      console.log(`  /${cmd.id} - ${cmd.description}`);
      console.log(`    Inserts: "${cmd.insertContent}"`);
    });
  } catch (error) {
    console.error('❌ Error parsing template:', error);
  }
}

/**
 * Example function demonstrating content type detection
 */
export function demonstrateContentTypeDetection(): void {
  console.log('\n🔍 Content Type Detection Examples\n');

  const examples = [
    {
      text: 'budget table with federal and state shares at 90% FFP rate',
      expected: 'budget-table',
    },
    {
      text: 'personnel resources and staffing requirements with hourly rates',
      expected: 'personnel-table',
    },
    {
      text: 'compliance with 45 CFR §95.610 regulatory requirements',
      expected: 'regulatory-reference',
    },
    {
      text: 'project timeline with milestones and activity schedule',
      expected: 'timeline',
    },
    {
      text: 'system architecture and technical specifications with APIs',
      expected: 'technical-specification',
    },
    {
      text: 'executive summary providing project overview and intent',
      expected: 'executive-summary',
    },
  ];

  examples.forEach((example, index) => {
    console.log(`${index + 1}. Text: "${example.text}"`);
    console.log(`   Expected: ${example.expected}`);
    console.log(`   Detected: [Content detection would run here]`);
    console.log('');
  });
}

/**
 * Run the complete example
 */
export async function runCompleteExample(): Promise<void> {
  console.log('🎯 Advanced Markdown Template Parser Example\n');
  console.log('='.repeat(60));

  await parseAPDTemplateExample();

  console.log('\n' + '='.repeat(60));
  demonstrateContentTypeDetection();

  console.log('✨ Example completed successfully!');
}

// Export for use in other modules
export { sampleAPDTemplate };

// Run example if this file is executed directly
if (require.main === module) {
  runCompleteExample().catch(console.error);
}
