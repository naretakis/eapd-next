/**
 * Content Type Detector for Milkdown Integration
 *
 * Analyzes template content to identify areas that benefit from specialized
 * Milkdown plugins such as tables, math expressions, diagrams, and APD-specific content.
 */

import { ParsedField, ParsedSection } from '../../types/template';
import { APDType } from '../../types/apd';
import { MilkdownContentType, MilkdownPlugin } from './markdownTemplateParser';

export interface ContentAnalysis {
  contentType: MilkdownContentType;
  confidence: number;
  recommendedPlugins: MilkdownPlugin[];
  specialFeatures: SpecialFeature[];
  complexity: 'simple' | 'moderate' | 'complex';
}

export interface SpecialFeature {
  type: 'calculation' | 'validation' | 'formatting' | 'interaction';
  description: string;
  plugin?: string;
}

export interface ContentPattern {
  pattern: RegExp;
  contentType: MilkdownContentType;
  weight: number;
  context?: 'section' | 'field' | 'help';
}

/**
 * Detects content types and recommends Milkdown configurations
 */
export class ContentTypeDetector {
  private readonly contentPatterns: ContentPattern[] = [
    // Budget-related patterns
    {
      pattern:
        /budget|cost|ffp|federal\s+share|state\s+share|financial|expenditure/i,
      contentType: 'budget-table',
      weight: 0.8,
    },
    {
      pattern: /\$[\d,]+|\d+%\s*(federal|state)|90%|75%|50%/i,
      contentType: 'budget-table',
      weight: 0.9,
    },
    {
      pattern: /table\s+[a-z]\.|sample.*budget|proposed.*budget/i,
      contentType: 'budget-table',
      weight: 0.7,
    },

    // Personnel-related patterns
    {
      pattern: /personnel|staff|resource|contractor|employee|fte|full.time/i,
      contentType: 'personnel-table',
      weight: 0.8,
    },
    {
      pattern: /job\s+title|responsibilities|hourly\s+rate|%\s+time/i,
      contentType: 'personnel-table',
      weight: 0.9,
    },

    // Timeline/Schedule patterns
    {
      pattern:
        /schedule|timeline|milestone|activity|phase|start\s+date|finish\s+date/i,
      contentType: 'timeline',
      weight: 0.8,
    },
    {
      pattern: /\d{2}\/\d{2}\/\d{4}|\d{4}-\d{2}-\d{2}|estimated.*date/i,
      contentType: 'timeline',
      weight: 0.7,
    },

    // Technical specification patterns
    {
      pattern:
        /technical|system|architecture|specification|requirement|interface/i,
      contentType: 'technical-specification',
      weight: 0.7,
    },
    {
      pattern: /api|database|server|network|security|integration/i,
      contentType: 'technical-specification',
      weight: 0.8,
    },

    // Regulatory reference patterns
    {
      pattern: /\d+\s+cfr|regulation|compliance|42\s+cfr|45\s+cfr/i,
      contentType: 'regulatory-reference',
      weight: 0.9,
    },
    {
      pattern: /§\s*\d+|section\s+\d+|subpart\s+[a-z]/i,
      contentType: 'regulatory-reference',
      weight: 0.8,
    },

    // Executive summary patterns
    {
      pattern: /executive\s+summary/i,
      contentType: 'executive-summary',
      weight: 0.9,
    },
    {
      pattern: /overview|intent|purpose|objective/i,
      contentType: 'executive-summary',
      weight: 0.6,
    },

    // Calculation patterns
    {
      pattern: /calculation|formula|multiply|divide/i,
      contentType: 'calculation-field',
      weight: 0.7,
    },
    {
      pattern: /total|sum|percentage/i,
      contentType: 'calculation-field',
      weight: 0.4,
    },

    // Diagram patterns
    {
      pattern: /diagram|chart|flow|architecture|system.*design|appendix\s+a/i,
      contentType: 'diagram',
      weight: 0.8,
    },
  ];

  private readonly apdSpecificPatterns: Partial<
    Record<APDType, ContentPattern[]>
  > = {
    PAPD: [
      {
        pattern:
          /planning|project\s+management|feasibility|analysis\s+of\s+alternatives/i,
        contentType: 'structured-list',
        weight: 0.8,
      },
    ],
    IAPD: [
      {
        pattern: /implementation|development|testing|deployment/i,
        contentType: 'technical-specification',
        weight: 0.8,
      },
      {
        pattern: /aoa|analysis\s+of\s+alternatives|results/i,
        contentType: 'structured-list',
        weight: 0.9,
      },
    ],
    OAPD: [
      {
        pattern: /operational|maintenance|support|activity\s+status/i,
        contentType: 'structured-list',
        weight: 0.8,
      },
    ],
  };

  /**
   * Analyze content and determine the best Milkdown configuration
   */
  public analyzeContent(
    field: ParsedField,
    section: ParsedSection,
    apdType: APDType,
    context?: { subsection?: ParsedSection; helpText?: string }
  ): ContentAnalysis {
    const analysisText = this.buildAnalysisText(field, section, context);
    const scores = this.calculateContentTypeScores(analysisText, apdType);

    const bestMatch = this.getBestMatch(scores);
    const recommendedPlugins = this.getRecommendedPlugins(
      bestMatch.contentType,
      analysisText
    );
    const specialFeatures = this.detectSpecialFeatures(
      analysisText,
      bestMatch.contentType
    );
    const complexity = this.assessComplexity(
      analysisText,
      bestMatch.contentType,
      specialFeatures
    );

    return {
      contentType: bestMatch.contentType,
      confidence: bestMatch.confidence,
      recommendedPlugins,
      specialFeatures,
      complexity,
    };
  }

  /**
   * Build text for analysis from field and context
   */
  private buildAnalysisText(
    field: ParsedField,
    section: ParsedSection,
    context?: { subsection?: ParsedSection; helpText?: string }
  ): string {
    const parts = [
      field.name,
      field.label,
      field.helpText || '',
      section.title,
      section.description || '',
      section.helpText || '',
      context?.subsection?.title || '',
      context?.subsection?.helpText || '',
      context?.helpText || '',
    ];

    return parts.filter(Boolean).join(' ').toLowerCase();
  }

  /**
   * Calculate scores for each content type
   */
  private calculateContentTypeScores(
    text: string,
    apdType: APDType
  ): Record<MilkdownContentType, number> {
    const scores: Record<MilkdownContentType, number> = {
      'rich-text': 0.1, // Base score for all content
      'budget-table': 0,
      'personnel-table': 0,
      'regulatory-reference': 0,
      timeline: 0,
      'technical-specification': 0,
      'executive-summary': 0,
      'structured-list': 0,
      'calculation-field': 0,
      diagram: 0,
    };

    // Apply general patterns
    this.contentPatterns.forEach(pattern => {
      if (pattern.pattern.test(text)) {
        scores[pattern.contentType] += pattern.weight;
      }
    });

    // Apply APD-specific patterns
    const apdPatterns = this.apdSpecificPatterns[apdType] || [];
    apdPatterns.forEach(pattern => {
      if (pattern.pattern.test(text)) {
        scores[pattern.contentType] += pattern.weight;
      }
    });

    // Apply contextual bonuses
    this.applyContextualBonuses(scores, text);

    return scores;
  }

  /**
   * Apply contextual bonuses based on content analysis
   */
  private applyContextualBonuses(
    scores: Record<MilkdownContentType, number>,
    text: string
  ): void {
    // Table structure indicators
    if (
      text.includes('table') &&
      (text.includes('column') || text.includes('row'))
    ) {
      if (scores['budget-table'] > 0) scores['budget-table'] += 0.3;
      if (scores['personnel-table'] > 0) scores['personnel-table'] += 0.3;
    }

    // Mathematical content indicators
    if (/\+|\-|\*|\/|=|sum|total|calculate/.test(text)) {
      scores['calculation-field'] += 0.2;
      if (scores['budget-table'] > 0) scores['budget-table'] += 0.2;
    }

    // List structure indicators
    if (
      text.includes('list') ||
      text.includes('item') ||
      text.includes('bullet')
    ) {
      scores['structured-list'] += 0.2;
    }

    // Visual content indicators
    if (
      text.includes('diagram') ||
      text.includes('chart') ||
      text.includes('visual')
    ) {
      scores['diagram'] += 0.3;
    }

    // Regulatory content indicators
    if (
      text.includes('compliance') ||
      text.includes('requirement') ||
      text.includes('standard')
    ) {
      scores['regulatory-reference'] += 0.2;
    }
  }

  /**
   * Get the best matching content type
   */
  private getBestMatch(scores: Record<MilkdownContentType, number>): {
    contentType: MilkdownContentType;
    confidence: number;
  } {
    let bestType: MilkdownContentType = 'rich-text';
    let bestScore = scores['rich-text'];

    Object.entries(scores).forEach(([type, score]) => {
      if (score > bestScore) {
        bestType = type as MilkdownContentType;
        bestScore = score;
      }
    });

    // Normalize confidence to 0-1 range
    const confidence = Math.min(bestScore, 1.0);

    return { contentType: bestType, confidence };
  }

  /**
   * Get recommended plugins for content type
   */
  private getRecommendedPlugins(
    contentType: MilkdownContentType,
    analysisText: string
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
          config: { budgetCommands: true },
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
          config: { personnelCommands: true },
        },
      ],
      'regulatory-reference': [
        {
          name: 'slash',
          package: '@milkdown/plugin-slash',
          lazy: true,
          config: { regulatoryCommands: true },
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
          config: { timelineCommands: true },
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

    const plugins = [...basePlugins, ...contentSpecificPlugins[contentType]];

    // Add conditional plugins based on analysis
    if (analysisText.includes('clipboard') || analysisText.includes('paste')) {
      plugins.push({
        name: 'clipboard',
        package: '@milkdown/plugin-clipboard',
        lazy: false,
      });
    }

    if (analysisText.includes('emoji') || analysisText.includes('icon')) {
      plugins.push({
        name: 'emoji',
        package: '@milkdown/plugin-emoji',
        lazy: true,
      });
    }

    return plugins;
  }

  /**
   * Detect special features needed for content
   */
  private detectSpecialFeatures(
    analysisText: string,
    contentType: MilkdownContentType
  ): SpecialFeature[] {
    const features: SpecialFeature[] = [];

    // Calculation features
    if (/calculate|formula|sum|total|\+|\-|\*|\//.test(analysisText)) {
      features.push({
        type: 'calculation',
        description: 'Automatic calculations and formula support',
        plugin: '@milkdown/plugin-math',
      });
    }

    // Validation features
    if (/required|validate|check|verify|compliance/.test(analysisText)) {
      features.push({
        type: 'validation',
        description: 'Real-time validation and error checking',
      });
    }

    // Formatting features
    if (/format|style|bold|italic|header/.test(analysisText)) {
      features.push({
        type: 'formatting',
        description: 'Rich text formatting options',
        plugin: '@milkdown/plugin-tooltip',
      });
    }

    // Interactive features
    if (/drag|drop|click|select|interactive/.test(analysisText)) {
      features.push({
        type: 'interaction',
        description: 'Interactive content manipulation',
        plugin: '@milkdown/plugin-block',
      });
    }

    // Content-specific features
    switch (contentType) {
      case 'budget-table':
        features.push({
          type: 'calculation',
          description: 'FFP rate calculations and budget totals',
        });
        break;
      case 'personnel-table':
        features.push({
          type: 'validation',
          description: 'Personnel cost validation and allocation checks',
        });
        break;
      case 'regulatory-reference':
        features.push({
          type: 'validation',
          description: 'Regulatory citation format validation',
        });
        break;
      case 'timeline':
        features.push({
          type: 'interaction',
          description: 'Interactive timeline manipulation',
        });
        break;
    }

    return features;
  }

  /**
   * Assess content complexity
   */
  private assessComplexity(
    analysisText: string,
    contentType: MilkdownContentType,
    features: SpecialFeature[]
  ): 'simple' | 'moderate' | 'complex' {
    let complexityScore = 0;

    // Base complexity by content type
    const contentComplexity: Record<MilkdownContentType, number> = {
      'rich-text': 1,
      'executive-summary': 1,
      'structured-list': 2,
      'regulatory-reference': 2,
      timeline: 3,
      'calculation-field': 3,
      'personnel-table': 4,
      'technical-specification': 4,
      'budget-table': 5,
      diagram: 5,
    };

    complexityScore += contentComplexity[contentType];

    // Add complexity for features
    complexityScore += features.length;

    // Add complexity for specific indicators
    if (/table.*table|multiple.*table/.test(analysisText)) complexityScore += 2;
    if (/calculation.*calculation|formula.*formula/.test(analysisText))
      complexityScore += 2;
    if (/integration|interface|api/.test(analysisText)) complexityScore += 1;

    // Determine complexity level
    if (complexityScore <= 2) return 'simple';
    if (complexityScore <= 5) return 'moderate';
    return 'complex';
  }

  /**
   * Get content type recommendations for an entire section
   */
  public analyzeSectionContent(
    section: ParsedSection,
    apdType: APDType
  ): Map<string, ContentAnalysis> {
    const analyses = new Map<string, ContentAnalysis>();

    section.fields.forEach(field => {
      const analysis = this.analyzeContent(field, section, apdType);
      analyses.set(field.name, analysis);
    });

    section.subsections?.forEach(subsection => {
      subsection.fields.forEach(field => {
        const analysis = this.analyzeContent(field, section, apdType, {
          subsection,
        });
        analyses.set(`${subsection.title}.${field.name}`, analysis);
      });
    });

    return analyses;
  }
}
