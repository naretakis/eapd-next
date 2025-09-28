/**
 * Tests for Content Type Detector
 */

import { ContentTypeDetector } from '../contentTypeDetector';
import { ParsedField, ParsedSection } from '../../../types/template';

describe('ContentTypeDetector', () => {
  let detector: ContentTypeDetector;

  beforeEach(() => {
    detector = new ContentTypeDetector();
  });

  describe('analyzeContent', () => {
    it('should detect budget table content type', () => {
      const field: ParsedField = {
        name: 'budget_table',
        label: 'Budget Table',
        type: 'table',
        required: true,
        helpText:
          'Enter budget information with federal and state shares at 90% FFP rate',
      };

      const section: ParsedSection = {
        title: 'Proposed Budget',
        fields: [field],
        helpText: 'Include total project costs and FFP calculations',
      };

      const analysis = detector.analyzeContent(field, section, 'PAPD');

      expect(analysis.contentType).toBe('budget-table');
      expect(analysis.confidence).toBeGreaterThan(0.7);
      expect(analysis.recommendedPlugins).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'table' }),
          expect.objectContaining({ name: 'math' }),
        ])
      );
    });

    it('should detect personnel table content type', () => {
      const field: ParsedField = {
        name: 'personnel_resources',
        label: 'Personnel Resources',
        type: 'table',
        required: true,
        helpText: 'List staff roles, responsibilities, and hourly rates',
      };

      const section: ParsedSection = {
        title: 'Personnel Resource Statement',
        fields: [field],
        helpText: 'Provide staffing requirements and contractor resources',
      };

      const analysis = detector.analyzeContent(field, section, 'PAPD');

      expect(analysis.contentType).toBe('personnel-table');
      expect(analysis.confidence).toBeGreaterThan(0.7);
      expect(analysis.recommendedPlugins).toEqual(
        expect.arrayContaining([expect.objectContaining({ name: 'table' })])
      );
    });

    it('should detect regulatory reference content type', () => {
      const field: ParsedField = {
        name: 'compliance_statement',
        label: 'Compliance Statement',
        type: 'textarea',
        required: true,
        helpText: 'Ensure compliance with 45 CFR §95.610 and 42 CFR §433.112',
      };

      const section: ParsedSection = {
        title: 'Regulatory Compliance',
        fields: [field],
        helpText: 'Address all regulatory requirements and citations',
      };

      const analysis = detector.analyzeContent(field, section, 'PAPD');

      expect(analysis.contentType).toBe('regulatory-reference');
      expect(analysis.confidence).toBeGreaterThan(0.8);
    });

    it('should detect timeline content type', () => {
      const field: ParsedField = {
        name: 'project_schedule',
        label: 'Project Schedule',
        type: 'table',
        required: true,
        helpText: 'Include start dates, finish dates, and major milestones',
      };

      const section: ParsedSection = {
        title: 'Proposed Activity Schedule',
        fields: [field],
        helpText: 'Provide timeline for all project activities',
      };

      const analysis = detector.analyzeContent(field, section, 'PAPD');

      expect(analysis.contentType).toBe('timeline');
      expect(analysis.confidence).toBeGreaterThan(0.7);
    });

    it('should detect technical specification content type', () => {
      const field: ParsedField = {
        name: 'system_requirements',
        label: 'System Requirements',
        type: 'textarea',
        required: true,
        helpText:
          'Describe technical architecture, APIs, and system interfaces',
      };

      const section: ParsedSection = {
        title: 'Technical Specifications',
        fields: [field],
        helpText: 'Detail system architecture and technical requirements',
      };

      const analysis = detector.analyzeContent(field, section, 'PAPD');

      expect(analysis.contentType).toBe('technical-specification');
      expect(analysis.confidence).toBeGreaterThan(0.7);
      expect(analysis.recommendedPlugins).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'prism' }),
          expect.objectContaining({ name: 'diagram' }),
        ])
      );
    });

    it('should detect executive summary content type', () => {
      const field: ParsedField = {
        name: 'executive_summary',
        label: 'Executive Summary',
        type: 'textarea',
        required: true,
        helpText: 'Provide project overview and key objectives',
      };

      const section: ParsedSection = {
        title: 'Executive Summary',
        fields: [field],
        helpText: 'Brief overview of the APD intent and benefits',
      };

      const analysis = detector.analyzeContent(field, section, 'PAPD');

      expect(analysis.contentType).toBe('executive-summary');
      expect(analysis.confidence).toBeGreaterThan(0.7);
    });

    it('should default to rich-text for general content', () => {
      const field: ParsedField = {
        name: 'general_content',
        label: 'General Content',
        type: 'textarea',
        required: true,
        helpText: 'Enter general information',
      };

      const section: ParsedSection = {
        title: 'General Section',
        fields: [field],
      };

      const analysis = detector.analyzeContent(field, section, 'PAPD');

      expect(analysis.contentType).toBe('rich-text');
      expect(analysis.recommendedPlugins).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'block' }),
          expect.objectContaining({ name: 'slash' }),
          expect.objectContaining({ name: 'tooltip' }),
        ])
      );
    });
  });

  describe('special features detection', () => {
    it('should detect calculation features for budget content', () => {
      const field: ParsedField = {
        name: 'budget_calculations',
        label: 'Budget Calculations',
        type: 'table',
        required: true,
        helpText:
          'Calculate totals, federal share, and state share using formulas',
      };

      const section: ParsedSection = {
        title: 'Budget Analysis',
        fields: [field],
      };

      const analysis = detector.analyzeContent(field, section, 'PAPD');

      expect(analysis.specialFeatures).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'calculation',
            description: expect.stringContaining('calculation'),
          }),
        ])
      );
    });

    it('should detect validation features for regulatory content', () => {
      const field: ParsedField = {
        name: 'compliance_check',
        label: 'Compliance Check',
        type: 'textarea',
        required: true,
        helpText: 'Verify compliance with all regulatory requirements',
      };

      const section: ParsedSection = {
        title: 'Regulatory Compliance',
        fields: [field],
      };

      const analysis = detector.analyzeContent(field, section, 'PAPD');

      expect(analysis.specialFeatures).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'validation',
            description: expect.stringContaining('validation'),
          }),
        ])
      );
    });

    it('should detect interactive features for drag-and-drop content', () => {
      const field: ParsedField = {
        name: 'interactive_timeline',
        label: 'Interactive Timeline',
        type: 'textarea',
        required: true,
        helpText: 'Drag and drop activities to reorder timeline',
      };

      const section: ParsedSection = {
        title: 'Project Timeline',
        fields: [field],
      };

      const analysis = detector.analyzeContent(field, section, 'PAPD');

      expect(
        analysis.specialFeatures.some(
          feature =>
            feature.type === 'interaction' &&
            feature.description.toLowerCase().includes('interactive')
        )
      ).toBe(true);
    });
  });

  describe('complexity assessment', () => {
    it('should assess simple complexity for basic text fields', () => {
      const field: ParsedField = {
        name: 'simple_text',
        label: 'Simple Text',
        type: 'text',
        required: true,
      };

      const section: ParsedSection = {
        title: 'Simple Section',
        fields: [field],
      };

      const analysis = detector.analyzeContent(field, section, 'PAPD');

      expect(analysis.complexity).toBe('simple');
    });

    it('should assess moderate complexity for structured content', () => {
      const field: ParsedField = {
        name: 'structured_list',
        label: 'Structured List',
        type: 'textarea',
        required: true,
        helpText: 'Create a structured list of requirements',
      };

      const section: ParsedSection = {
        title: 'Requirements List',
        fields: [field],
      };

      const analysis = detector.analyzeContent(field, section, 'PAPD');

      expect(analysis.complexity).toBe('moderate');
    });

    it('should assess complex complexity for budget tables', () => {
      const field: ParsedField = {
        name: 'complex_budget',
        label: 'Complex Budget Table',
        type: 'table',
        required: true,
        helpText:
          'Multi-table budget with calculations, formulas, and validation',
      };

      const section: ParsedSection = {
        title: 'Detailed Budget Analysis',
        fields: [field],
      };

      const analysis = detector.analyzeContent(field, section, 'PAPD');

      expect(analysis.complexity).toBe('complex');
    });
  });

  describe('APD type-specific patterns', () => {
    it('should apply PAPD-specific patterns', () => {
      const field: ParsedField = {
        name: 'planning_approach',
        label: 'Planning Approach',
        type: 'textarea',
        required: true,
        helpText: 'Describe project management and planning methodology',
      };

      const section: ParsedSection = {
        title: 'Project Management Plan',
        fields: [field],
      };

      const analysis = detector.analyzeContent(field, section, 'PAPD');

      expect(analysis.contentType).toBe('structured-list');
    });

    it('should apply IAPD-specific patterns', () => {
      const field: ParsedField = {
        name: 'implementation_plan',
        label: 'Implementation Plan',
        type: 'textarea',
        required: true,
        helpText: 'Detail development and implementation activities',
      };

      const section: ParsedSection = {
        title: 'Implementation Activities',
        fields: [field],
      };

      const analysis = detector.analyzeContent(field, section, 'IAPD');

      expect(analysis.contentType).toBe('technical-specification');
    });

    it('should apply OAPD-specific patterns', () => {
      const field: ParsedField = {
        name: 'operational_activities',
        label: 'Operational Activities',
        type: 'textarea',
        required: true,
        helpText: 'Describe ongoing maintenance and operational support',
      };

      const section: ParsedSection = {
        title: 'Operations and Maintenance',
        fields: [field],
      };

      const analysis = detector.analyzeContent(field, section, 'OAPD');

      expect(analysis.contentType).toBe('structured-list');
    });
  });

  describe('analyzeSectionContent', () => {
    it('should analyze all fields in a section', () => {
      const section: ParsedSection = {
        title: 'Budget Section',
        fields: [
          {
            name: 'budget_table',
            label: 'Budget Table',
            type: 'table',
            required: true,
            helpText: 'Federal and state budget breakdown',
          },
          {
            name: 'budget_narrative',
            label: 'Budget Narrative',
            type: 'textarea',
            required: true,
            helpText: 'Explain budget calculations and assumptions',
          },
        ],
        subsections: [
          {
            title: 'Personnel Costs',
            fields: [
              {
                name: 'personnel_table',
                label: 'Personnel Table',
                type: 'table',
                required: true,
                helpText: 'Staff roles and hourly rates',
              },
            ],
          },
        ],
      };

      const analyses = detector.analyzeSectionContent(section, 'PAPD');

      expect(analyses.size).toBe(3);
      expect(analyses.get('budget_table')?.contentType).toBe('budget-table');
      expect(analyses.get('budget_narrative')?.contentType).toBe(
        'calculation-field'
      );
      expect(analyses.get('Personnel Costs.personnel_table')?.contentType).toBe(
        'personnel-table'
      );
    });
  });

  describe('contextual bonuses', () => {
    it('should apply table structure bonuses', () => {
      const field: ParsedField = {
        name: 'data_table',
        label: 'Data Table',
        type: 'table',
        required: true,
        helpText: 'Table with columns and rows for budget data',
      };

      const section: ParsedSection = {
        title: 'Budget Information',
        fields: [field],
      };

      const analysis = detector.analyzeContent(field, section, 'PAPD');

      expect(analysis.contentType).toBe('budget-table');
      expect(analysis.confidence).toBeGreaterThan(0.8);
    });

    it('should apply mathematical content bonuses', () => {
      const field: ParsedField = {
        name: 'calculations',
        label: 'Budget Calculations',
        type: 'textarea',
        required: true,
        helpText: 'Calculate totals and sum all budget items',
      };

      const section: ParsedSection = {
        title: 'Financial Analysis',
        fields: [field],
      };

      const analysis = detector.analyzeContent(field, section, 'PAPD');

      expect(analysis.specialFeatures).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ type: 'calculation' }),
        ])
      );
    });
  });
});
