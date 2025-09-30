/**
 * Milkdown Utilities Service for eAPD-Next
 *
 * This service provides high-level utilities for working with Milkdown editors
 * in the context of APD document creation and management.
 */

import type { MilkdownEditorRef } from '@/components/forms/MilkdownEditor';

export interface APDSection {
  id: string;
  title: string;
  level: number;
  isComplete: boolean;
  isRequired: boolean;
  validationErrors: string[];
}

export interface APDOutline {
  sections: APDSection[];
  completionPercentage: number;
  totalSections: number;
  completedSections: number;
}

/**
 * APD Template Content Management
 */
export class APDContentManager {
  /**
   * Insert boilerplate text for common APD sections
   */
  static insertBoilerplate(
    editor: MilkdownEditorRef,
    sectionType: string
  ): void {
    const templates = {
      'executive-summary': `## Executive Summary

This APD requests federal financial participation for [PROJECT NAME] to enhance the state's Medicaid program capabilities.

### Project Overview
- **Project Type**: [PAPD/IAPD/OAPD]
- **Funding Period**: [START DATE] to [END DATE]
- **Total Project Cost**: $[AMOUNT]
- **Federal Share (90%)**: $[FEDERAL AMOUNT]
- **State Share (10%)**: $[STATE AMOUNT]

### Business Need
[Describe the business need this project addresses]

### Expected Benefits
- [Benefit 1]
- [Benefit 2]
- [Benefit 3]`,

      'statement-of-needs': `## Statement of Needs and Objectives

### Current State Assessment
[Describe current system capabilities and limitations]

### Business Needs
1. **[Need 1]**: [Description]
2. **[Need 2]**: [Description]
3. **[Need 3]**: [Description]

### Project Objectives
1. **[Objective 1]**: [Description and success criteria]
2. **[Objective 2]**: [Description and success criteria]
3. **[Objective 3]**: [Description and success criteria]

### Alignment with State Medicaid Goals
[Explain how this project supports broader Medicaid objectives]`,

      'cost-benefit': `## Cost-Benefit Analysis

### Project Costs
| Category | Federal Share (90%) | State Share (10%) | Total |
|----------|---------------------|-------------------|-------|
| Personnel | $[AMOUNT] | $[AMOUNT] | $[AMOUNT] |
| Hardware | $[AMOUNT] | $[AMOUNT] | $[AMOUNT] |
| Software | $[AMOUNT] | $[AMOUNT] | $[AMOUNT] |
| **Total** | **$[TOTAL_FED]** | **$[TOTAL_STATE]** | **$[TOTAL]** |

### Quantifiable Benefits
- **Cost Savings**: $[AMOUNT] annually
- **Efficiency Gains**: [PERCENTAGE]% improvement in processing time
- **Error Reduction**: [PERCENTAGE]% decrease in manual errors

### Qualitative Benefits
- Improved user experience for beneficiaries
- Enhanced data quality and reporting capabilities
- Better compliance with federal requirements`,

      'security-privacy': `## Security and Interface Requirements

### Security Requirements
This project will comply with all applicable security standards including:

- **NIST Cybersecurity Framework**: Implementation of appropriate security controls
- **HIPAA**: Protection of protected health information (PHI)
- **State Security Policies**: Adherence to [STATE] information security requirements

### Privacy Protections
- Data encryption in transit and at rest
- Role-based access controls
- Audit logging and monitoring
- Privacy impact assessment completion

### Interface Requirements
- **MITA Alignment**: System will advance MITA maturity levels
- **Interoperability**: Standards-based data exchange capabilities
- **Integration**: Seamless connection with existing state systems`,
    };

    const template = templates[sectionType as keyof typeof templates];
    if (template) {
      editor.insertContent(template);
    } else {
      console.warn(`No template found for section type: ${sectionType}`);
    }
  }

  /**
   * Insert regulatory citations
   */
  static insertCitation(editor: MilkdownEditorRef, citationType: string): void {
    const citations = {
      'ffp-rates':
        '42 CFR 433.112 - Enhanced Federal Financial Participation (FFP)',
      'apd-requirements': '45 CFR 95.610 - ADP equipment standards',
      procurement: '45 CFR 95.611 - ADP procurement requirements',
      mita: 'MITA 3.0 - Medicaid Information Technology Architecture',
      cef: '42 CFR 433.112(b) - Conditions for Enhanced Funding',
    };

    const citation = citations[citationType as keyof typeof citations];
    if (citation) {
      editor.insertContent(`\n\n*Reference: ${citation}*\n\n`);
    }
  }

  /**
   * Generate APD outline with completion tracking
   */
  static generateAPDOutline(editor: MilkdownEditorRef): APDOutline {
    const outline = editor.getOutline();

    // Define required APD sections
    const requiredSections = [
      'Executive Summary',
      'Statement of Needs',
      'Cost-Benefit Analysis',
      'Acquisitions',
      'Personnel Resources',
      'Activity Schedule',
      'Proposed Budget',
      'Security Requirements',
    ];

    const sections: APDSection[] = outline.map(
      (item: { text: string; level: number; id: string }) => {
        const isRequired = requiredSections.some(req =>
          item.text.toLowerCase().includes(req.toLowerCase())
        );

        return {
          id: item.id,
          title: item.text,
          level: item.level,
          isRequired,
          isComplete: this.validateSectionCompleteness(item.text, editor),
          validationErrors: this.validateSection(item.text, editor),
        };
      }
    );

    const completedSections = sections.filter(s => s.isComplete).length;
    const totalSections = sections.length;
    const completionPercentage =
      totalSections > 0 ? (completedSections / totalSections) * 100 : 0;

    return {
      sections,
      completionPercentage,
      totalSections,
      completedSections,
    };
  }

  /**
   * Validate section completeness
   */
  private static validateSectionCompleteness(
    sectionTitle: string,
    editor: MilkdownEditorRef
  ): boolean {
    const content = editor.getMarkdown();
    const sectionContent = this.extractSectionContent(sectionTitle, content);

    // Basic completeness check - section has more than just the title
    return sectionContent.trim().length > sectionTitle.length + 50; // Arbitrary threshold
  }

  /**
   * Validate section content
   */
  private static validateSection(
    sectionTitle: string,
    editor: MilkdownEditorRef
  ): string[] {
    const errors: string[] = [];
    const content = editor.getMarkdown();
    const sectionContent = this.extractSectionContent(sectionTitle, content);

    // Section-specific validation rules
    if (sectionTitle.toLowerCase().includes('budget')) {
      if (!sectionContent.includes('|') || !sectionContent.includes('Total')) {
        errors.push('Budget section should include a table with totals');
      }
    }

    if (sectionTitle.toLowerCase().includes('executive summary')) {
      if (sectionContent.length < 200) {
        errors.push('Executive summary should be at least 200 characters');
      }
    }

    if (sectionTitle.toLowerCase().includes('security')) {
      const requiredTerms = ['HIPAA', 'encryption', 'access control'];
      const missingTerms = requiredTerms.filter(
        term => !sectionContent.toLowerCase().includes(term.toLowerCase())
      );
      if (missingTerms.length > 0) {
        errors.push(
          `Security section should mention: ${missingTerms.join(', ')}`
        );
      }
    }

    return errors;
  }

  /**
   * Extract content for a specific section
   */
  private static extractSectionContent(
    sectionTitle: string,
    fullContent: string
  ): string {
    const lines = fullContent.split('\n');
    const sectionStart = lines.findIndex(
      line => line.includes(sectionTitle) && line.startsWith('#')
    );

    if (sectionStart === -1) return '';

    const sectionLevel = (lines[sectionStart]?.match(/^#+/) || [''])[0].length;
    let sectionEnd = lines.length;

    // Find the next section at the same or higher level
    for (let i = sectionStart + 1; i < lines.length; i++) {
      const line = lines[i];
      if (line?.startsWith('#')) {
        const currentLevel = (line.match(/^#+/) || [''])[0].length;
        if (currentLevel <= sectionLevel) {
          sectionEnd = i;
          break;
        }
      }
    }

    return lines.slice(sectionStart, sectionEnd).join('\n');
  }

  /**
   * Export APD content in various formats
   */
  static exportContent(
    editor: MilkdownEditorRef,
    format: 'markdown' | 'html' | 'outline'
  ): string {
    switch (format) {
      case 'markdown':
        return editor.getMarkdown();
      case 'html':
        return editor.getHTML();
      case 'outline':
        const outline = this.generateAPDOutline(editor);
        return JSON.stringify(outline, null, 2);
      default:
        return editor.getMarkdown();
    }
  }

  /**
   * Load APD template
   */
  static loadTemplate(
    editor: MilkdownEditorRef,
    templateType: 'PAPD' | 'IAPD' | 'OAPD'
  ): void {
    const templates = {
      PAPD: `# Planning APD (PAPD)

## 1. Executive Summary
[To be completed]

## 2. Statement of Needs and Objectives
[To be completed]

## 3. Requirements Analysis and Feasibility Study
[To be completed]

## 4. Cost-Benefit Analysis
[To be completed]

## 5. Project Management Plan
[To be completed]`,

      IAPD: `# Implementation APD (IAPD)

## 1. Executive Summary
[To be completed]

## 2. Statement of Needs and Objectives
[To be completed]

## 3. Analysis of Alternatives Results
[To be completed]

## 4. Cost-Benefit Analysis
[To be completed]

## 5. Acquisitions
[To be completed]

## 6. Personnel Resource Statement
[To be completed]

## 7. Proposed Activity Schedule
[To be completed]

## 8. Proposed Budget
[To be completed]

## 9. Security and Interface Requirements
[To be completed]`,

      OAPD: `# Operational APD (OAPD)

## 1. Executive Summary
[To be completed]

## 2. Summary of Activities
[To be completed]

## 3. Acquisitions
[To be completed]

## 4. Annual Budget
[To be completed]

## 5. Cost Allocation Plan
[To be completed]

## 6. Conditions for Enhanced Funding
[To be completed]`,
    };

    const template = templates[templateType];
    editor.replaceAllContent(template, true);
  }
}

/**
 * APD Validation Service
 */
export class APDValidator {
  /**
   * Validate entire APD document
   */
  static validateAPD(editor: MilkdownEditorRef): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    completionScore: number;
  } {
    const content = editor.getMarkdown();
    const outline = APDContentManager.generateAPDOutline(editor);

    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for required sections
    const requiredSections = [
      'Executive Summary',
      'Statement of Needs',
      'Proposed Budget',
    ];
    const missingSections = requiredSections.filter(
      section => !content.toLowerCase().includes(section.toLowerCase())
    );

    if (missingSections.length > 0) {
      errors.push(`Missing required sections: ${missingSections.join(', ')}`);
    }

    // Check for budget tables
    if (!content.includes('|') && content.toLowerCase().includes('budget')) {
      warnings.push('Budget section should include tables for cost breakdown');
    }

    // Check for placeholder text
    const placeholders = content.match(/\[.*?\]/g) || [];
    if (placeholders.length > 0) {
      warnings.push(
        `${placeholders.length} placeholder(s) need to be completed`
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      completionScore: outline.completionPercentage,
    };
  }
}
