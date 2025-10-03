# eAPD-Next Web Application - Kiro Spec Request

## Project Overview

Create a comprehensive specification for **eAPD-Next**, a modern web application that streamlines the APD (Advance Planning Document) submission process for state Medicaid agencies. This application should provide a TurboTax-like guided experience for creating, managing, and exporting APDs entirely within the browser, with a dashboard-centric workflow for APD management.

## Technical Requirements

### Core Technology Stack

- **Framework**: Next.js with React and TypeScript
- **UI Library**: Material-UI (MUI) with default theme
- **Deployment**: GitHub Pages with automatic deployments on push
- **Storage**: IndexedDB for local browser storage (no server-side data)
- **Offline Support**: Progressive Web App capabilities for offline functionality
- **Multi-Environment**: Separate deployments for main, test, and dev branches

### Architecture Constraints

- **Privacy-First**: No user authentication, tracking, or data transmission
- **Browser-Only**: All functionality must work entirely within the browser
- **Local Storage**: All user data remains on their local machine
- **Export Formats**: Markdown, PDF, and JSON export capabilities
- **Desktop-Focused**: Primarily optimized for desktop usage

## Developer Learning & Best Practices Requirements

### Documentation & Learning Support

Since this project is being built by someone with limited developer experience, the specification must include:

1. **Comprehensive Documentation Strategy**:
   - Detailed README.md with setup instructions, architecture overview, and contribution guidelines
   - Code documentation standards and examples
   - API documentation for all major functions and components
   - Deployment guide for GitHub Pages multi-branch setup
   - Troubleshooting guide for common issues

2. **Developer Best Practices Integration**:
   - Code organization and file structure best practices
   - Git workflow recommendations (branching, commits, pull requests)
   - Testing strategy and implementation guidance
   - Code review checklist and quality standards
   - Performance optimization guidelines

3. **Learning-Focused Implementation**:
   - Well-commented code with explanations of complex logic
   - Step-by-step implementation guides for each major feature
   - Explanation of architectural decisions and trade-offs
   - Links to relevant learning resources and documentation

### Kiro Optimization & Workflow Enhancement

4. **Kiro Steering Documents Setup**:
   - Create `.kiro/steering/` directory with project-specific guidance
   - Development standards and coding conventions steering file
   - APD domain knowledge steering file (referencing the wiki content)
   - Material-UI component usage guidelines steering file
   - Git workflow and deployment process steering file

5. **Kiro Agent Hooks Configuration**:
   - Pre-commit hooks for code quality checks
   - Automatic documentation updates when code changes
   - Test running hooks for development workflow
   - Deployment verification hooks
   - Code review assistance hooks

6. **Kiro Workspace Optimization**:
   - Proper file organization for maximum Kiro effectiveness
   - Context-aware file naming and structure
   - Integration of project documentation with Kiro's context system
   - Spec file management and iteration tracking

### GitHub Repository Setup Requirements

7. **Repository Structure & Configuration**:
   - Proper GitHub Pages configuration for multi-branch deployments
   - Branch protection rules and workflow setup
   - Issue and pull request templates
   - GitHub Actions for automated testing and deployment
   - Proper .gitignore configuration for Next.js projects

8. **Project Management Integration**:
   - GitHub Projects setup for feature tracking
   - Milestone planning for development phases
   - Issue labeling system for bug tracking and feature requests
   - Documentation for maintaining and updating the project

## Application Structure & Navigation

### Main Application Flow

**Dashboard → APD Editor → Export**

### Dashboard Requirements

- **Primary Interface**: Central hub for all APD management activities
- **APD List View**: Display APDs with key information:
  - APD Type (PAPD, IAPD, OAPD, Updates)
  - Project/Module Name
  - Last Modified Date
  - Completion Status/Progress
- **Project Grouping**: Group related APDs together (e.g., PAPD, IAPD, OAPD for "Core Claims MMIS" project)
- **Organization**: Sort by project, type, and date
- **Management Actions**:
  - Create New APD (with type selection dialog)
  - Open/Edit Existing APD
  - View Only APD (read-only mode)
  - Duplicate APD
  - Delete APD
  - Export APD (multiple format options)

### APD Editor Requirements

- **Navigation**: Easy return to dashboard + quick section-to-section navigation within APD
- **Section Jumping**: Users frequently need to navigate between different APD sections
- **Progress Tracking**: Visual indicators of section completion
- **Auto-Save**: Continuous progress saving to prevent data loss

## Functional Requirements

### APD Types Support

- **Phase 1**: PAPD (Planning APD) implementation
- **Future Phases**: IAPD (Implementation APD) and OAPD (Operational APD)
- Support for APD updates (PAPD-U, IAPD-U, OAPD-U)

### Core Features

1. **Dashboard Management**: Central APD management interface with project grouping
2. **Guided APD Creation**: TurboTax-style navigation with sidebar progress tracking
3. **Template Integration**: Users fill out structured templates based on the provided markdown templates
4. **Auto-Save**: Continuous progress saving to prevent data loss
5. **Validation System**: Real-time validation with warnings for incomplete sections and calculation errors
6. **Export System**: Generate markdown, PDF, and JSON versions of completed APDs
7. **Import/Export**: Allow users to share APD data files with colleagues
8. **View-Only Mode**: Read-only APD viewing capability

### User Experience with Material-UI

- **Modern Interface**: Clean, professional look using Material-UI components
- **Dashboard Navigation**: Intuitive APD management with clear action buttons
- **Form Design**: Well-structured forms using appropriate MUI components
- **Progress Indicators**: Visual completion status using MUI progress components
- **Navigation**: Breadcrumbs and clear navigation paths between dashboard and editor
- **Help Integration**: Contextual help text pulled from template instructions

## Content Integration Requirements

### Reference Materials

Please integrate the following existing content and templates:

1. **Domain Knowledge** (`docs/domain/`):
   - About-eAPD-Next.md - Project overview and benefits
   - APDs-101.md - Comprehensive APD background
   - Content-guide.md - Writing principles and style guidelines
   - UX-Principles.md - Design principles for the application
   - eapd-User-research-findings.md - User research insights and pain points

2. **APD Templates** (`apd templates/markdown apd templates/`):
   - MES APD Template.md - Main APD template structure
   - MES AoA Template.md - Analysis of Alternatives template
   - MES OAPD Template.md - Operational APD template
   - MES Acquisition Checklist.md - Acquisition checklist template

3. **Regulatory Context** (`apd-regulatory-context/`):
   - Federal regulations governing APD requirements and processes

### Template Structure Implementation

The application should guide users through the template sections systematically, using the markdown templates as the foundation for:

- Form field generation using appropriate Material-UI components
- Help text and instructions integration
- Validation rules and error messaging
- Section organization and navigation
- Dashboard project/APD organization

## Key User Pain Points to Address

Based on the research findings, prioritize solutions for:

1. Complicated budget field calculations (automate math)
2. Centralized creation and submission process via dashboard
3. Minimizing rework through validation
4. Clear guidance on APD expectations
5. Administrative completeness checking
6. Easy navigation between APD sections
7. Project-based APD organization and management

## Development Phases

### Phase 1: Foundation & Setup

- Project setup with comprehensive documentation
- GitHub repository configuration with proper workflows
- Kiro steering documents and agent hooks setup
- Core Next.js + React + Material-UI application setup
- GitHub Pages deployment configuration for multi-branch
- Dashboard interface with APD management capabilities
- IndexedDB integration for local storage
- Basic PAPD template implementation

### Phase 2: Core Features & Learning Integration

- Navigation between dashboard and APD editor
- Auto-save functionality
- PDF and JSON export capabilities
- Advanced validation and calculation features
- Improved help system integration
- View-only mode implementation
- Developer learning resources and documentation updates

### Phase 3: Advanced Features & Optimization

- Project grouping functionality
- Offline PWA capabilities
- IAPD and OAPD template implementation
- Advanced import/export features
- Performance optimizations
- Enhanced dashboard features (filtering, search)

## Success Criteria

The application should enable state users to:

- Manage multiple APDs efficiently from a central dashboard
- Create complete, administratively correct APDs more efficiently
- Navigate easily between APD sections and back to dashboard
- Organize APDs by project for better management
- Reduce time spent on manual calculations and formatting
- Access clear guidance throughout the process
- Export professional APD documents in multiple formats
- Work entirely offline with their sensitive data remaining local

**Additionally, the project should enable the developer to:**

- Learn modern web development best practices through hands-on implementation
- Understand and apply proper Git workflows and GitHub management
- Utilize Kiro's full capabilities for enhanced development productivity
- Maintain comprehensive project documentation
- Follow industry-standard code organization and quality practices

## Technical Specifications Needed

Please provide detailed specifications for:

### Core Application

1. Component architecture and file structure using Next.js + React + Material-UI
2. Dashboard design with APD management capabilities and project grouping
3. IndexedDB schema design for APD data storage and project organization
4. Form generation system based on markdown templates using MUI components
5. Navigation system between dashboard and APD editor with section jumping
6. Validation engine implementation with MUI error handling
7. Export system architecture (Markdown, PDF, JSON)
8. GitHub Pages deployment configuration for multi-branch setup
9. Progressive Web App implementation for offline support
10. Material-UI theme integration and component selection strategy

### Developer Support & Documentation

11. Comprehensive README.md structure and content
12. Code documentation standards and implementation examples
13. Git workflow setup and branch management strategy
14. Testing framework setup and best practices
15. Kiro steering documents configuration and content
16. Kiro agent hooks setup for development workflow automation
17. GitHub repository configuration (Actions, Pages, branch protection)
18. Developer learning path and resource recommendations
19. Code review guidelines and quality assurance processes
20. Troubleshooting guides and common issue resolution

---

## Usage Instructions

To use this specification with Kiro:

1. Create a new Kiro spec and reference this file: `#KIRO_SPEC_REQUEST.md`
2. Include relevant context files from the project directories:
   - `#docs/domain/`
   - `#apd templates/markdown apd templates/`
   - `#apd-regulatory-context/`
3. Request Kiro to create a comprehensive technical specification based on this document and the referenced materials.

This specification serves as the master requirements document for the eAPD-Next project and should be updated as requirements evolve.
