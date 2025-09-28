# Advanced Markdown Template Parser with Milkdown Integration

This module provides comprehensive template parsing functionality for APD (Advance Planning Document) templates with specialized Milkdown editor configurations and intelligent content type detection.

## Overview

The template parser system converts markdown APD templates into structured form definitions with Milkdown WYSIWYG editor configurations. It analyzes content to determine the most appropriate editor type and plugins for each field, enabling a rich editing experience tailored to APD-specific content.

## Key Features

### 🔍 Intelligent Content Detection

- Automatically detects content types (budget tables, personnel tables, regulatory references, etc.)
- Analyzes field context, help text, and section titles
- Provides confidence scores for content type predictions

### 📝 Milkdown Integration

- Generates Milkdown editor configurations for rich text fields
- Configures appropriate plugins based on content type
- Creates APD-specific slash commands for quick content insertion

### 🏗️ Schema Generation

- Generates TypeScript interfaces from parsed templates
- Creates validation schemas with Milkdown-aware rules
- Produces field mappings for form generation

### 🎯 APD-Specific Features

- Supports PAPD, IAPD, and OAPD template types
- Handles budget calculations and FFP rate validation
- Includes regulatory citation formatting and validation

## Architecture

```
TemplateService
├── MarkdownTemplateParser     # Core markdown parsing
├── ContentTypeDetector        # Intelligent content analysis
└── TemplateSchemaGenerator    # TypeScript interface generation
```

## Usage

### Basic Template Parsing

```typescript
import { TemplateService } from './parsers';

const service = new TemplateService();

// Parse a markdown template
const result = await service.parseTemplate(markdownContent, 'PAPD', {
  enableMilkdown: true,
  generateSchema: true,
  analyzeContent: true,
  validationLevel: 'comprehensive',
});

// Access parsed data
const { template, schema, milkdownConfigs, contentAnalyses } = result;
```

### Content Type Detection

```typescript
import { ContentTypeDetector } from './parsers';

const detector = new ContentTypeDetector();

const analysis = detector.analyzeContent(field, section, 'PAPD');

console.log(analysis.contentType); // 'budget-table'
console.log(analysis.confidence); // 0.85
console.log(analysis.complexity); // 'complex'
console.log(analysis.specialFeatures); // [{ type: 'calculation', ... }]
```

### Milkdown Configuration

```typescript
// Get Milkdown config for a specific field
const config = service.getMilkdownConfigForField(fieldPath, result);

if (config) {
  console.log(config.contentType); // 'budget-table'
  console.log(config.plugins); // [{ name: 'table' }, { name: 'math' }]
  console.log(config.slashCommands); // APD-specific slash commands
}
```

## Content Types

The parser recognizes the following content types and configures appropriate Milkdown plugins:

### Budget Table (`budget-table`)

- **Plugins**: table, math, slash
- **Features**: Automatic calculations, FFP rate validation
- **Use Cases**: Budget sections, cost breakdowns, financial tables

### Personnel Table (`personnel-table`)

- **Plugins**: table, slash
- **Features**: Resource allocation, role validation
- **Use Cases**: Staffing tables, contractor resources

### Regulatory Reference (`regulatory-reference`)

- **Plugins**: slash
- **Features**: Citation formatting, compliance validation
- **Use Cases**: Regulatory citations, compliance statements

### Timeline (`timeline`)

- **Plugins**: block, slash
- **Features**: Interactive timeline manipulation
- **Use Cases**: Project schedules, milestone tracking

### Technical Specification (`technical-specification`)

- **Plugins**: prism, diagram, slash
- **Features**: Code highlighting, system diagrams
- **Use Cases**: System requirements, technical documentation

### Executive Summary (`executive-summary`)

- **Plugins**: block, slash
- **Features**: Structured content organization
- **Use Cases**: Project overviews, summary sections

## Slash Commands

The parser generates APD-specific slash commands for quick content insertion:

### Common Commands

- `/budget-table` - Insert budget calculation table
- `/personnel-table` - Insert personnel resource table
- `/regulatory-ref` - Insert regulatory citation
- `/ffp-calculation` - Insert FFP calculation template

### Type-Specific Commands

- **PAPD**: `/project-timeline` - Insert project timeline
- **IAPD**: `/aoa-summary` - Insert Analysis of Alternatives summary
- **OAPD**: `/activity-status` - Insert activity status table

## Template Structure

### Front Matter

Templates support YAML front matter for metadata:

```yaml
---
State:
  - Full State Name
Document Type:
  - PAPD
  - IAPD
  - OAPD
Version:
  - 1.0
---
```

### Sections and Fields

The parser extracts sections, subsections, and fields:

```markdown
## 1. Executive Summary

> [!info]+
> Provide a brief overview of the project intent.

[Insert written content here]

### 1.1 Project Overview

[Insert written content here]
```

### Help Text

Instruction blocks are parsed as help text:

```markdown
> [!info]+
> **Instruction:** This is help text that will be extracted
> and cleaned for use in the form field.
```

### Tables

Markdown tables are detected and configured appropriately:

```markdown
| Category  | Federal Share | State Share | Total    |
| --------- | ------------- | ----------- | -------- |
| Personnel | $90,000       | $10,000     | $100,000 |
```

## Validation

The parser generates comprehensive validation rules:

### Field-Level Validation

- Required field validation
- Type-specific validation (numbers, dates, etc.)
- Content-specific validation (budget calculations, regulatory citations)

### Cross-Field Validation

- Budget consistency across sections
- Personnel allocation validation
- Regulatory compliance checking

### Milkdown Content Validation

- Table structure validation
- Math expression validation
- Content completeness checking

## Configuration Options

### Template Load Options

```typescript
interface TemplateLoadOptions {
  enableMilkdown?: boolean; // Enable Milkdown configurations
  generateSchema?: boolean; // Generate TypeScript interfaces
  analyzeContent?: boolean; // Perform content type analysis
  customSlashCommands?: SlashCommand[]; // Additional slash commands
  validationLevel?: 'basic' | 'strict' | 'comprehensive';
}
```

### Validation Levels

- **Basic**: Required field validation only
- **Strict**: APD formatting standards
- **Comprehensive**: Cross-section consistency validation

## Error Handling

The parser includes comprehensive error handling:

```typescript
try {
  const result = await service.parseTemplate(content, 'PAPD');
} catch (error) {
  if (error instanceof TemplateParsingError) {
    console.log(`Parsing error in ${error.section}: ${error.message}`);
  }
}
```

## Testing

Run the test suite:

```bash
npm test src/templates/parsers
```

## Demo

A web-based demo is available at `/demo` to see the parser in action with sample APD templates.

## Performance Considerations

### Lazy Loading

- Milkdown plugins are configured for lazy loading when appropriate
- Content analysis is performed on-demand
- Schema generation can be disabled for faster parsing

### Caching

- Parsed templates can be cached for reuse
- Content analysis results are memoized
- Milkdown configurations are generated once per template

### Bundle Optimization

- Tree-shaking support for unused plugins
- Conditional plugin loading based on content type
- Minimal core plugin set for basic functionality

## Integration with eAPD-Next

The template parser integrates seamlessly with the eAPD-Next application:

1. **Form Generation**: Field mappings drive dynamic form creation
2. **Validation**: Generated validation schemas ensure data integrity
3. **Editor Configuration**: Milkdown configs provide rich editing experiences
4. **Content Assistance**: Slash commands speed up content creation

## API Reference

See the exported types and classes in `index.ts` for complete API documentation.
