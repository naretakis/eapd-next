# APD Domain Knowledge for eAPD-Next Development

## APD Overview

### What is an APD?

An APD (Advance Planning Document) is a formal document that state Medicaid agencies must submit to CMS (Centers for Medicare & Medicaid Services) to request federal funding for Medicaid IT projects. APDs are critical for states to receive federal financial participation (FFP) for their Medicaid systems.

### APD Types and Purposes

#### PAPD (Planning APD)

- **Purpose**: Initial planning and design phase funding
- **Content**: High-level project overview, business case, preliminary timeline
- **FFP Rate**: Typically 90% federal, 10% state match
- **When Used**: Before detailed system design begins

#### IAPD (Implementation APD)

- **Purpose**: Detailed implementation phase funding
- **Content**: Detailed project plan, technical specifications, budget breakdown
- **FFP Rate**: Typically 90% federal for development, 75% for enhancement
- **When Used**: After planning phase, before implementation begins

#### OAPD (Operational APD)

- **Purpose**: Ongoing operations and maintenance funding
- **Content**: Operational costs, maintenance activities, performance metrics
- **FFP Rate**: Typically 75% federal, 25% state match (50% for some activities)
- **When Used**: For ongoing system operations

### Key APD Components

#### Executive Summary

- Project overview and objectives
- Business justification and benefits
- High-level timeline and budget
- Stakeholder impact assessment

#### Statement of Needs

- Current system limitations
- Business requirements
- Technical requirements
- Regulatory compliance needs

#### Project Management

- Project organization structure
- Key personnel and roles
- Project timeline and milestones
- Risk management approach

#### Budget and Cost-Benefit Analysis

- Detailed cost breakdown by category
- Federal vs. state cost allocation
- Cost-benefit analysis
- Return on investment calculations

## Federal Financial Participation (FFP) Rates

### Standard FFP Rates

- **Design, Development, Implementation (DDI)**: 90% federal, 10% state
- **Maintenance & Operations (M&O)**: 75% federal, 25% state
- **Enhanced Match**: 90% federal for certain activities (e.g., HITECH, ACA)
- **Administrative Activities**: 50% federal, 50% state

### FFP Calculation Rules

- Must separate DDI costs from M&O costs
- Enhanced match available for specific regulatory requirements
- Cost allocation must be documented and justified
- Regular reporting required to maintain FFP eligibility

## Budget Categories and Calculations

### Personnel Costs

- State staff salaries and benefits
- Contractor personnel costs
- Must include detailed role descriptions
- Hourly rates must be justified and reasonable

### Hardware Costs

- Servers, networking equipment, workstations
- Must demonstrate cost-effectiveness
- Competitive procurement required
- Depreciation schedules required

### Software Costs

- Commercial off-the-shelf (COTS) software
- Custom development costs
- Licensing and maintenance fees
- Must justify selection criteria

### Training Costs

- End-user training programs
- Technical training for staff
- Training materials and resources
- Must demonstrate necessity and cost-effectiveness

### Other Costs

- Travel and meeting expenses
- Facilities and utilities
- Communications and data services
- Must be directly related to project

## Regulatory Context

### Key Regulations

- **42 CFR 433 Subpart C**: Federal financial participation requirements
- **45 CFR 95.610**: ADP equipment and services requirements
- **45 CFR 95.611**: ADP procurement standards
- **42 CFR 431**: State plan requirements

### Compliance Requirements

- Competitive procurement for major contracts
- Independent verification and validation (IV&V) for large projects
- Security and privacy protections (HIPAA, state laws)
- Interoperability and data exchange standards
- Accessibility compliance (Section 508, ADA)

## Common User Pain Points

### Budget Calculation Complexity

- **Problem**: Manual calculations prone to errors
- **Solution**: Automated calculations with real-time validation
- **Implementation**: Built-in formulas for FFP rates, totals, and allocations

### Centralized Management

- **Problem**: Multiple documents, versions, and locations
- **Solution**: Single dashboard for all APD management
- **Implementation**: Project-based organization with version control

### Validation and Rework

- **Problem**: Submission rejections due to missing or incorrect information
- **Solution**: Real-time validation and completeness checking
- **Implementation**: Template-based validation with clear error messages

### Guidance and Expectations

- **Problem**: Unclear requirements and expectations
- **Solution**: Contextual help and guidance throughout the process
- **Implementation**: Integrated help system with regulatory context

### Administrative Completeness

- **Problem**: Difficulty ensuring all required sections are complete
- **Solution**: Automated completeness checking and reporting
- **Implementation**: Progress tracking with section-by-section validation

### Navigation Complexity

- **Problem**: Difficult to navigate between sections and return to overview
- **Solution**: Intuitive navigation with clear progress indicators
- **Implementation**: TurboTax-style guided experience

### Project Organization

- **Problem**: Related APDs (PAPD, IAPD, OAPD) not organized together
- **Solution**: Project-based grouping and management
- **Implementation**: Project containers with related APD tracking

## Template Structure and Content

### Section Organization

Templates follow a hierarchical structure:

1. **Administrative Information**
   - State and agency details
   - Contact information
   - Submission dates

2. **Executive Summary**
   - Project overview
   - Key objectives
   - Expected outcomes

3. **Statement of Needs**
   - Current state assessment
   - Business requirements
   - Technical requirements

4. **Project Management**
   - Organization structure
   - Personnel assignments
   - Timeline and milestones

5. **Budget Tables**
   - Cost categories and breakdowns
   - FFP calculations
   - Multi-year projections

### Field Types and Validation

- **Text Fields**: Free-form text with character limits
- **Numeric Fields**: Currency, percentages, quantities with validation
- **Date Fields**: Project timelines and milestones
- **Selection Fields**: Predefined options for consistency
- **Table Fields**: Structured data entry with calculations

### Help Text Integration

Each field includes:

- **Instructions**: What information to provide
- **Examples**: Sample entries for guidance
- **Regulatory Context**: Relevant regulations and requirements
- **Validation Rules**: What makes an entry valid or invalid

## Data Management and Storage

### Local Storage Strategy

- **IndexedDB**: Primary storage for APD data
- **Auto-save**: Continuous saving to prevent data loss
- **Version Control**: Track changes and maintain history
- **Backup/Restore**: Export/import capabilities for data portability

### Data Structure

```typescript
interface APD {
  id: string;
  type: 'PAPD' | 'IAPD' | 'OAPD';
  projectName: string;
  sections: {
    [sectionId: string]: APDSectionData;
  };
  metadata: APDMetadata;
  validationState: ValidationState;
}
```

### Export Formats

- **Markdown**: Human-readable format matching CMS templates
- **PDF**: Professional document for submission
- **JSON**: Structured data for sharing and backup

## Integration with Wiki Content

### Reference Materials

The application integrates content from:

- **#[[file:apd-next-wiki-content/About-eAPD-Next.md]]**: Project overview and goals
- **#[[file:apd-next-wiki-content/APDs-101.md]]**: Basic APD education
- **#[[file:apd-next-wiki-content/Content-guide.md]]**: Writing and style guidelines
- **#[[file:apd-next-wiki-content/UX-Principles.md]]**: User experience guidelines
- **#[[file:apd-next-wiki-content/Glossary-of-Acronyms.md]]**: Term definitions

### Regulatory References

- **#[[file:apd-regulatory-context/title-42-433-subpart-c.html]]**: FFP requirements
- **#[[file:apd-regulatory-context/title-45-95.610.html]]**: ADP equipment standards
- **#[[file:apd-regulatory-context/title-45-95.611.html]]**: ADP procurement requirements

### Template Integration

- **#[[file:apd templates/markdown apd templates/MES APD Template.md]]**: PAPD template
- **#[[file:apd templates/markdown apd templates/MES OAPD Template.md]]**: OAPD template
- **#[[file:apd templates/markdown apd templates/MES AoA Template.md]]**: Analysis of Alternatives template
- **#[[file:apd templates/markdown apd templates/MES Acquisition Checklist.md]]**: Procurement checklist

## Development Considerations

### User Experience Priorities

1. **Simplicity**: Complex regulatory requirements made simple
2. **Guidance**: Always available help and context
3. **Validation**: Real-time feedback and error prevention
4. **Efficiency**: Automated calculations and smart defaults
5. **Reliability**: Auto-save and data protection

### Technical Implementation

- **Template Parsing**: Convert markdown templates to form definitions
- **Calculation Engine**: Automated budget calculations and validation
- **Validation System**: Real-time validation with clear messaging
- **Export System**: Multiple format generation with proper formatting
- **Storage System**: Robust local storage with backup capabilities

### Accessibility Requirements

- **Screen Reader Support**: Full compatibility with assistive technologies
- **Keyboard Navigation**: Complete keyboard accessibility
- **Color Contrast**: WCAG AA compliance for all visual elements
- **Focus Management**: Clear focus indicators and logical tab order
- **Alternative Text**: Descriptive text for all images and icons
