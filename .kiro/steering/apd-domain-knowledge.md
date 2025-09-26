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
- **FFP Rate**: Typically 90% federal for development, 75% for operations and specific activities
- **When Used**: After planning phase, before and during implementation

#### OAPD (Operational APD)

- **Purpose**: Ongoing operations and maintenance funding
- **Content**: Operational costs, maintenance activities, performance metrics
- **FFP Rate**: Typically 75% federal, 25% state match for certain activities and 50% for other activities
- **When Used**: For ongoing system operations

#### APDU (APD Update)

- **Annual APDU**: Required 60 days before FFP approval expires, includes project status, deliverables, updated schedule, revised budget, and expenditure reports
- **As-Needed APDU**: Required for significant changes including cost increases, schedule delays >60 days, scope changes, or procurement modifications
- **Thresholds**: Regular FFP requires APDU for $1M+ cost increases; Enhanced FFP requires APDU for $300K+ or 10% cost increases

### Core APD Concepts

#### Document Lifecycle and Relationships

- **Project Progression**: PAPD → IAPD → OAPD with periodic APDUs
- **Document Relationships**: Each APD builds on previous submissions
- **Version Control**: Updates and modifications tracked through APDU process
- **Multi-Document Projects**: Related APDs grouped by project/system

#### Essential Content Areas

- **Business Case**: Problem statement, needs assessment, and expected benefits
- **Technical Approach**: System design, architecture, and implementation strategy
- **Financial Planning**: Detailed budgets, cost allocation, and FFP calculations
- **Project Management**: Timeline, resources, risks, and deliverables
- **Regulatory Compliance**: CEF attestation, security requirements, and standards alignment

#### Key Validation Requirements

- **Completeness**: All required sections and appendices must be present
- **Accuracy**: Budget calculations, FFP rates, and regulatory citations must be correct
- **Consistency**: Information must align across sections and with previous APDs
- **Compliance**: Must meet all 22 Conditions for Enhanced Funding and regulatory standards

## Federal Financial Participation (FFP) Rates

### Standard FFP Rates

- **Design, Development, Installation (DDI) Enhanced Match**: 90% federal, 10% state
- **Operations Enhanced Match**: 75% federal, 25% state
- **DDI and Operations Regular Match**: 50% federal, 50% state

### FFP Calculation Rules

- Must separate DDI costs from Operations costs
- Enhanced match available for specific regulatory requirements
- Ongoing enhanced match tied to Federal system certifications
- Cost allocation between programs (Medicaid, SNAP, TANF, etc.) must be documented and justified
- Regular reporting required to maintain FFP eligibility and match rates

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

- **42 CFR 433 Subpart C**: Medicaid specific APD and FFP standards, including standards for enhanced FFP match
- **45 CFR 95.610**: APD standards
- **45 CFR 95.611**: APD prior approval and procurement standards
- **42 CFR 431**: State plan requirements

### Compliance Requirements

- Competitive procurement for major contracts
- Independent verification and validation (IV&V) for large projects
- Security and privacy protections (HIPAA, state laws)
- Interoperability and data exchange standards
- Accessibility compliance (Section 508, ADA)

### Prior Approval Thresholds

#### Regular FFP (50% match) - 45 CFR 95.611(a)(1) & (b)(1)

- **Planning/Implementation APD**: $5M+ total acquisition costs
- **Sole Source Acquisitions**: $1M+ total costs (any FFP rate)
- **Contract Submissions** (if not using exemption/checklist):
  - Software application development: $6M+ (competitive), $1M+ (noncompetitive)
  - Hardware and COTS software: $20M+ (competitive), $1M+ (noncompetitive)
- **Contract Amendments**: 20%+ cumulative cost increases from base contract
- **Annual APDU**: Projects >$5M total cost (mandatory), <$5M (if requested by Department)
- **As-Needed APDU**: $1M+ cost increases, 60+ day schedule delays, significant scope/procurement changes

#### Enhanced FFP (90% DDI, 75% Operations) - 45 CFR 95.611(a)(2) & (b)(2)

- **All Planning/Implementation APDs**: Required regardless of cost
- **Acquisition Documents**: $500K+ contract value (prior to solicitation release or execution)
- **Contract Amendments**: $500K+ cost increases OR 60+ day extensions
- **Annual APDU**: Required for all enhanced FFP projects
- **As-Needed APDU**: $300K+ cost increases OR 10% of project cost (whichever is less), 60+ day schedule delays, significant scope/procurement changes, 10%+ cost benefit changes

#### Acquisition Exemptions - 45 CFR 95.611(b)(1)(iii)

States can receive automatic exemption from prior approval if:

- Acquisition summary in APD/APDU provides sufficient detail
- Acquisition doesn't deviate from exemption terms
- Not initial acquisition for high-risk activities (e.g., software development)
- Must still comply with acquisition checklist requirements

#### Submission Timing Requirements

- **As-Needed APDU**: Must submit within 60 days of project changes
- **Prior Approval**: Required before project activity initiation
- **Department Response**: 60-day review period; provisional approval if no response

### Conditions for Enhanced Funding (CEF)

States must meet 22 specific conditions per 42 CFR 433.112(b) for 90% FFP eligibility:

1. **Efficiency Standard**: System provides more efficient, economical, and effective administration of the State plan
2. **Technical Standards**: Meets system requirements, standards and conditions, and performance standards in Part 11 of the State Medicaid Manual
3. **Medicare Compatibility**: Compatible with Medicare claims processing and information retrieval systems for prompt eligibility verification and dual-eligible claims processing
4. **Quality Organization Support**: Supports data requirements of quality improvement organizations established under Part B of Title XI of the Act
5. **State Ownership**: State owns any software designed, developed, installed or improved with 90% FFP
6. **Federal License**: Department has royalty-free, non-exclusive, and irrevocable license to reproduce, publish, or otherwise use software, modifications, and documentation developed with 90% FFP
7. **Cost Compliance**: Costs determined in accordance with 45 CFR 75, subpart E
8. **Usage Commitment**: Medicaid agency agrees in writing to use system for period specified in approved APD or shorter period CMS determines justifies Federal investment
9. **Data Safeguarding**: Agency agrees in writing that system information will be safeguarded per 42 CFR 431, subpart F
10. **Modular Development**: Use modular, flexible approach including open interfaces and exposed APIs; separation of business rules from core programming in human and machine readable formats
11. **MITA Alignment**: Align to and advance increasingly in MITA maturity for business, architecture, and data
12. **Standards Compliance**: Ensure alignment with health IT standards (45 CFR 170, subpart B), HIPAA privacy/security/breach regulations (45 CFR 160, 164), accessibility standards (Section 508), Federal civil rights laws, and various reporting standards
13. **Sharing and Reuse**: Promote sharing, leverage, and reuse of Medicaid technologies and systems within and among States
14. **Processing Standards**: Support accurate and timely processing and adjudications/eligibility determinations and effective communications with providers, beneficiaries, and public
15. **Reporting Capability**: Produce transaction data, reports, and performance information for program evaluation, continuous improvement, transparency and accountability
16. **Integration Requirements**: Support seamless coordination with Marketplace, Federal Data Services Hub, and interoperability with health information exchanges, public health agencies, human services programs, and community organizations
17. **E&E MAGI Requirement**: For E&E systems, State must have delivered acceptable MAGI-based system functionality demonstrated by performance testing with limited mitigations and workarounds
18. **Risk Mitigation Plans**: State must submit plans containing strategies for reducing operational consequences of failure to meet requirements for all major milestones and functionality
19. **Personnel Identification**: Agency must identify key state personnel by name, type and time commitment assigned to each project in writing through the APD
20. **System Documentation**: Systems and modules developed with 90% match must include documentation of components and procedures for operation by various contractors or users
21. **Portability Considerations**: For software systems developed with 90% match, State must consider strategies to minimize costs and difficulty of operating on alternate hardware or operating systems
22. **Additional Conditions**: Other conditions for compliance with statutory and regulatory requirements determined by the Secretary through formal guidance procedures

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

## Medicaid Enterprise Systems (MES) Context

### System Types

#### MMIS (Medicaid Management Information System)

- **Purpose**: Process claims and related claims activities for Medicaid payment to providers and organizations
- **Functions**: Claims and managed care encounter processing, provider management, financial management, EDW and reporting, program integrity, systems integration, pharmacy claim and benefit management, and more (see https://cmsgov.github.io/CMCS-DSG-DSS-Certification/ for more information)
- **Certification**: Must meet CMS system certification requirements (see https://cmsgov.github.io/CMCS-DSG-DSS-Certification/SMC%20Process/Overview/ for more information)

#### E&E (Eligibility and Enrollment System)

- **Purpose**: Process applications and determine Medicaid/CHIP eligibility
- **Functions**: Eligibility application processing and portal, verifications, MAGI and non-MAGI eligibility determinations, enrollment, noticing, rewneals, and more (see https://cmsgov.github.io/CMCS-DSG-DSS-Certification/Outcomes%20and%20Metrics/Eligibility%20and%20Enrollment%20(EE)/ for more information)
- **Certification**: Must meet CMS system certification requirements (see https://cmsgov.github.io/CMCS-DSG-DSS-Certification/SMC%20Process/Overview/ for more information)

#### System of Systems Architecture

- **Modular Approach**: Discrete, independent, interoperable elements
- **Required Modules**: As specified by CMS Secretary
- **Interoperability**: Systems must work together seamlessly

### MITA (Medicaid Information Technology Architecture)

- **Requirement**: Align to and advance increasingly in MITA maturity for business, architecture, and data

## Analysis of Alternatives (AoA)

### Purpose and Requirements

- **Regulatory Basis**: Required under 45 CFR 95.610 for planning phase
- **Reuse Mandate**: Must consider sharing, leverage, and reuse per SMDL #18-005
- **Market Research**: Systematic gathering of vendor and solution information

### Required Evaluation Criteria

- **Reuse**: Adaptation of existing capabilities with minimal customization
- **Functionality**: Meeting technical and functional requirements
- **Cost**: Total cost of ownership analysis
- **Benefits**: Non-financial business needs satisfaction
- **Risks**: Technical, project management, and implementation risks
- **Additional**: Scalability, implementation ease, vendor experience, user experience, innovation, organizational impact, schedule, maintainability, security, accessibility

### Scoring and Selection

- **Scoring Guide**: Typically 1-5 scale with defined criteria
- **Weighting**: Optional weighting based on business priorities
- **Documentation**: Detailed rationale for preferred solution selection

## Template Structure and Content

### MES APD Template (PAPD/IAPD/APDU) Structure

The main APD template follows this comprehensive structure:

1. **Administrative Information (Front Matter)**
   - State and agency details
   - Contact information
   - Submission dates
   - Document type selection (PAPD/IAPD/OAPD/AoA/Acquisition Checklist)
   - Multi-program benefit indicator (Y/N)
   - Version tracking

2. **Executive Summary**
   - Project overview and intent
   - Funding type (MMIS or E&E)
   - Project alignment with previous APDs
   - Medicaid program benefits
   - State-developed vs COTS indication

3. **Project Management Plan/Summary of Activities**
   - PAPD: Project management plan with organization, approach, activities
   - IAPD: Summary of activities and PAPD results
   - APDU: Project activity report with status and milestones

4. **Statement of Needs and Objectives**
   - MES introduction and current state
   - Scope of APD request
   - Business needs and system enhancements
   - Replacement system transition plans (if applicable)

5. **Requirements Analysis, Feasibility Study, Analysis of Alternatives**
   - PAPD: Commitment to conduct analysis
   - IAPD: Results and methodology summary
   - Complete AoA document in appendix
   - System transfer considerations

6. **Cost-Benefit Analysis**
   - PAPD: Commitment to conduct analysis
   - IAPD: Detailed cost-benefit analysis results

7. **Acquisitions**
   - Contract type and scope
   - Procurement strategy
   - Cost estimates and contract terms
   - Compliance certification (45 CFR § 95.617)

8. **Personnel Resource Statement**
   - State resource requirements and costs (Table A)
   - Contractor resource requirements (Table B)
   - Cost allocation methodology

9. **Proposed Activity Schedule for the Project**
   - High-level project timeline (Table C)
   - Individual activity descriptions
   - T-MSIS integration considerations
   - E&E priority requirements (MAGI, dynamic notices, non-MAGI)

10. **Proposed Budget**
    - Detailed budget tables by FFP rate (Tables D & E)
    - Federal and state cost breakdown
    - Medicaid Detail Budget Table (MDBT) with four sub-tables:
      - Enhanced funding tracking
      - Regular funding tracking
      - CHIP funding tracking
      - Total summary
    - Project budget status update (Table J)

11. **Statement of Duration**
    - Expected system/equipment usage duration

12. **Cost Allocation Plan for Implementation Activities**
    - Multi-program cost allocation (Table K)
    - PACAP compliance requirements
    - Direct benefit methodology

13. **Security and Interface Requirements**
    - System Security and Privacy Plan attestation
    - NIST/ACA standards compliance
    - Federal/state security provisions

14. **Assurances and Compliance**
    - CFR attestation table (Table L)
    - Regulatory compliance confirmation

### MES APD Template Appendices

- **Appendix A**: System diagrams and connections to other MES systems
- **Appendix B**: Analysis of Alternatives and other required information
- **Appendix C**: Conditions for Enhanced Funding (CEF) table with all 22 conditions
- **Appendix D**: Outcomes and Metrics (Tables N & O for CMS-required and state-specific)
- **Appendix E**: Certification requirements and timeline (Table P)

### MES OAPD Template Structure

The OAPD template has a more focused operational structure:

1. **Administrative Information (Front Matter)** - Same as APD template

2. **Executive Summary**
   - OAPD intent overview
   - PACAP update notifications

3. **Summary of Activities**
   - Activity status table (Table A)
   - Detailed activity descriptions
   - High-level project schedule reference

4. **Acquisitions**
   - Vendor resource table (Table B)
   - Contract compliance certification

5. **Annual Budget**
   - Budget status update by project (Table C)
   - Proposed budget (Tables D & E)
   - FFP breakdown (75% operations, 50% administrative)

### OAPD Template Appendices

- **Appendix A**: Proposed Activity Schedule (Table F)
- **Appendix B**: Cost Allocation for M&O Activities (Table G) with PACAP requirements
- **Appendix C**: Conditions for Enhanced Funding (Table H) - All 22 conditions
- **Appendix D**: Outcomes and Metrics (Tables I & J) with ORW attestation requirements

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

- **#[[file:apd templates/markdown apd templates/MES APD Template.md]]**: Main APD template (PAPD/IAPD/APDU)
- **#[[file:apd templates/markdown apd templates/MES OAPD Template.md]]**: Operational APD template
- **#[[file:apd templates/markdown apd templates/MES AoA Template.md]]**: Analysis of Alternatives template
- **#[[file:apd templates/markdown apd templates/MES Acquisition Checklist.md]]**: Procurement checklist template

## Procurement and Acquisition Requirements

### Acquisition Checklist Requirements

- **Purpose**: Support CMS review and approval prior to solicitation release
- **Regulatory Compliance**: Attest to meeting procurement requirements
- **Key Elements**: SOW clarity, competition fairness, performance standards, evaluation criteria

### RFP/RFQ Standards

- **Timeframes**: 60-90 days for proposal responses recommended
- **Competition**: Full and open competition required
- **Performance Standards**: Measurable SLAs with specific outcomes
- **Contract Terms**: CMS recommends maximum 8 years including renewals
- **Documentation**: Maintain detailed procurement history records

### Technical Requirements

- **Multi-platform Support**: Multiple browsers, operating systems, mobile users
- **Outcome-oriented**: Focus on "what" to achieve, not "how"
- **Open Standards**: No proprietary tool restrictions
- **Stakeholder Involvement**: User participation in design and development

## Cost Allocation and Financial Management

### Cost Allocation Methodology

- **PACAP Requirement**: Public Assistance Cost Allocation Plan approval from DHHS CAS
- **Direct Benefit**: Allocation based on direct benefit to Medicaid program
- **Multi-program**: Account for other Federal funding sources (SNAP, TANF, etc.)
- **Documentation**: Detailed methodology for each program participant

### Budget Categories and FFP Rates

- **DDI (Design, Development, Installation)**: 90% Federal, 10% State
- **M&O (Maintenance and Operations)**: 75% Federal, 25% State
- **Administrative**: 50% Federal, 50% State
- **Cost Separation**: Must clearly separate DDI from operational costs

### Financial Reporting

- **MDBT**: Medicaid Detail Budget Table required for all MMIS/E&E requests
- **Expenditure Tracking**: Detailed accounting of actual vs. projected costs
- **Variance Reporting**: Explanation of differences between approved and actual expenditures

## Development Considerations

### User Experience Priorities

1. **Simplicity**: Complex regulatory requirements made simple
2. **Guidance**: Always available help and context
3. **Validation**: Real-time feedback and error prevention
4. **Efficiency**: Automated calculations and smart defaults
5. **Reliability**: Auto-save and data protection

### Technical Implementation

- **Template Parsing**: Convert markdown templates to form definitions with front matter support
- **Calculation Engine**: Automated budget calculations with FFP rate validation
- **Validation System**: Real-time validation with CEF compliance checking
- **Export System**: Multiple format generation (Markdown, PDF, JSON) with proper formatting
- **Storage System**: Robust local storage with backup capabilities and version control
- **AoA Integration**: Built-in Analysis of Alternatives workflow and scoring
- **Procurement Support**: Acquisition checklist generation and tracking
- **MDBT Integration**: Medicaid Detail Budget Table automation and validation

### eAPD-Next Application Architecture

For detailed architecture requirements, refer to the following project documents:

- **Technology Stack**: Next.js + React + Material-UI + TypeScript (see `development-standards.md`)
- **Component Architecture**: Functional components with proper prop interfaces and JSDoc comments
- **State Management**: Local-first with IndexedDB for data persistence
- **Deployment**: GitHub Pages with automated CI/CD pipeline (see `git-workflow.md`)
- **UI Framework**: Material-UI components following established patterns (see `material-ui-guidelines.md`)
- **Progressive Web App**: Offline-capable PWA for sensitive data handling
- **Accessibility**: WCAG 2.1 AA compliance with screen reader support
- **Security**: Client-side only, no server dependencies, local data storage only

### Accessibility Requirements

- **Screen Reader Support**: Full compatibility with assistive technologies
- **Keyboard Navigation**: Complete keyboard accessibility
- **Color Contrast**: WCAG AA compliance for all visual elements
- **Focus Management**: Clear focus indicators and logical tab order
- **Alternative Text**: Descriptive text for all images and icons
