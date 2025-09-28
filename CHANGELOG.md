# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2025-09-28

### Added

#### Advanced Template Parser with Milkdown Integration (Task 4.1 Complete)

- **Intelligent Template Parsing**: Advanced markdown template parser that extracts structured field definitions from APD templates
- **Content Type Detection**: Automatically detects 10 different content types (budget tables, personnel tables, regulatory references, etc.) with confidence scoring
- **Milkdown Editor Integration**: Generates appropriate Milkdown editor configurations with specialized plugins for each content type
- **APD-Specific Features**: Creates APD-specific slash commands for quick content insertion (budget tables, personnel tables, regulatory citations, FFP calculations)
- **Schema Generation**: Automatically generates TypeScript interfaces and validation schemas from parsed templates
- **Interactive Demo**: Web-based demo at `/demo` showcasing template analysis and content detection capabilities

#### Template Parser Components

- **MarkdownTemplateParser**: Core parser for YAML front matter and markdown content extraction
- **ContentTypeDetector**: Intelligent content analysis with pattern matching and confidence scoring
- **TemplateSchemaGenerator**: TypeScript interface and validation schema generation
- **TemplateService**: High-level orchestration API for template processing

#### Content Intelligence Features

- **Smart Editor Selection**: Automatically recommends appropriate editing tools based on content analysis
- **Contextual Help Integration**: Extracts and processes help text from template guidance sections
- **Validation Framework**: Content-specific validation rules for budget calculations, regulatory citations, and personnel data
- **Plugin Configuration**: Dynamic Milkdown plugin selection based on content complexity and type

### Enhanced

- **Dashboard Interface**: Added template parser demo button for easy access to new functionality
- **Type System**: Extended template types to support Milkdown-specific field configurations

## [0.2.0] - 2025-09-27

### Added

#### Dashboard Interface and APD Management (Task 3 Complete)

- **Complete Dashboard System**: Central hub with APD management and project organization
- **APD List Component**: Advanced list view with filtering, sorting, and project grouping
- **APD Creation Dialog**: Multi-step APD creation with type selection (PAPD, IAPD, OAPD, AoA, Acquisition Checklist)
- **Project Management**: Create, organize, and manage projects with APD grouping
- **APD Lifecycle Operations**: Edit, view, duplicate, delete, and export functionality
- **Version Control Integration**: Working copy status indicators and version history access
- **Sub-document Linking**: Link AoA and Acquisition Checklist documents to parent APDs

#### Enhanced Service Layer

- **Extended APDService**: Full CRUD operations with project management
- **Project Operations**: Create, update, delete projects with APD association
- **Sub-document Management**: Link/unlink sub-documents to parent APDs
- **Bulk Operations**: Duplicate APDs, move between projects, batch updates

#### UI/UX Improvements

- **Material-UI Integration**: Consistent component usage following design guidelines
- **Responsive Design**: Desktop-optimized layouts with mobile compatibility
- **Loading States**: Comprehensive loading indicators and error boundaries
- **Error Handling**: User-friendly error messages with recovery options
- **Accessibility**: WCAG AA compliance with proper ARIA labels and keyboard navigation

#### Component Architecture

- **22 New Components**: Complete dashboard component suite
- **Common Components**: Reusable Layout, ErrorBoundary, LoadingSpinner components
- **Provider Pattern**: Theme and error boundary providers for consistent styling
- **Type Safety**: Full TypeScript integration with proper interfaces

### Enhanced

- **Storage Layer**: Enhanced IndexedDB operations with project relationship management
- **Version Control**: Improved working copy status tracking and change detection
- **Auto-save**: Enhanced functionality with conflict resolution and error recovery
- **Test Infrastructure**: Comprehensive test scaffolding (coverage improvements needed)

### Changed

- **Main Application**: Simplified page.tsx to single Dashboard component
- **Application Architecture**: Service layer abstraction for business logic separation
- **Development Status**: Updated README with current implementation progress

### Technical Debt

- **Test Coverage**: Currently 39.59% (target: 80%) - component integration tests need fixes
- **Test Infrastructure**: Some test utilities need improvements for proper component testing

### User Pain Points Addressed

- ✅ **Centralized Management** (Pain Point #2): Single dashboard for all APD operations
- ✅ **Project Organization** (Pain Point #7): Project-based APD grouping and management

## [0.1.0] - 2025-09-26

### Added

#### Project Foundation and Infrastructure (Tasks 1-2 Complete)

- **Next.js 15 Application**: Modern React framework with TypeScript and Material-UI
- **GitHub Repository**: Comprehensive setup with issue templates, PR templates, and project management
- **CI/CD Pipeline**: GitHub Actions with automated testing, linting, and deployment to GitHub Pages
- **Development Environment**: ESLint, Prettier, Husky pre-commit hooks, and Jest testing framework
- **Single-Branch Deployment**: Simplified deployment strategy with main branch auto-deployment

#### Storage and Data Management

- **IndexedDB Implementation**: Complete local storage system using Dexie.js
- **APD Service Layer**: Business logic for APD creation, management, and validation
- **Version Control System**: Working copy management with change tracking and commit workflow
- **Auto-save Functionality**: Debounced auto-save with conflict resolution and error recovery
- **Data Models**: TypeScript interfaces for APDs, projects, templates, and database operations

#### Core Components and Layout

- **Responsive Layout**: Material-UI based layout with proper theming and accessibility
- **Error Boundaries**: Graceful error handling throughout the application
- **Loading States**: Comprehensive loading indicators and user feedback
- **Theme System**: Consistent Material-UI theming with dark/light mode support

#### Documentation and Learning Resources

- **Comprehensive README**: Setup instructions, architecture overview, and development guidelines
- **APD Domain Knowledge**: Extensive documentation of APD requirements and regulatory context
- **Development Standards**: Code quality guidelines and best practices
- **Kiro Integration**: Steering documents and agent hooks for AI-assisted development

### Infrastructure

- **Node.js 20+ Requirement**: Modern Node.js version with performance improvements
- **Code Quality Gates**: Automated linting, formatting, and type checking
- **Accessibility Foundation**: WCAG AA compliance setup with axe-core testing
- **Performance Monitoring**: Bundle analysis and optimization configuration

### Fixed

- **GitHub Pages Deployment**: Resolved configuration issues for proper static site deployment
- **TypeScript Errors**: Fixed type safety issues throughout the codebase
- **ESLint Configuration**: Resolved linting errors and established consistent code style
- **CI/CD Pipeline**: Stabilized automated testing and deployment workflow

## [0.0.1] - 2025-09-25

### Added

- **Initial Repository**: Basic project structure and configuration
- **Project Documentation**: Initial README and project planning documents
- **License**: GNU General Public License v3.0
- **Git Configuration**: Comprehensive .gitignore for Next.js projects

### Infrastructure

- **Repository Setup**: GitHub repository with basic configuration
- **Documentation Foundation**: Initial project documentation and planning materials

---

## Changelog Maintenance

This changelog follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) principles:

- **Added** for new features
- **Changed** for changes in existing functionality
- **Deprecated** for soon-to-be removed features
- **Removed** for now removed features
- **Fixed** for any bug fixes
- **Security** for vulnerability fixes

### Semi-Automated Workflow

1. **Use Conventional Commits**: Continue using `feat:`, `fix:`, `docs:`, etc.
2. **Generate Draft Entries**: Use `git log` to identify changes since last release
3. **Curate for Users**: Focus on user-facing changes and group related commits
4. **Update on Releases**: Update changelog when bumping versions

### Commit Types to Changelog Mapping

- `feat:` → **Added** section
- `fix:` → **Fixed** section
- `docs:` → **Changed** (if user-facing) or omit if internal
- `style:`, `refactor:` → Usually omit unless user-facing
- `chore:` → Usually omit unless significant
- `perf:` → **Changed** or **Added** if performance improvement
- `test:` → Usually omit unless it affects user confidence

### Helper Commands for Changelog Updates

```bash
# Get commits since last tag for changelog drafting
git log $(git describe --tags --abbrev=0)..HEAD --oneline --no-merges

# Get commits by type since last tag
git log $(git describe --tags --abbrev=0)..HEAD --oneline --no-merges --grep="^feat:"
git log $(git describe --tags --abbrev=0)..HEAD --oneline --no-merges --grep="^fix:"

# Get all conventional commit types since last tag
git log $(git describe --tags --abbrev=0)..HEAD --pretty=format:"%s" --no-merges | grep -E "^(feat|fix|docs|style|refactor|test|chore|perf|ci|build):"
```

[0.2.0]: https://github.com/naretakis/eapd-next/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/naretakis/eapd-next/compare/v0.0.1...v0.1.0
[0.0.1]: https://github.com/naretakis/eapd-next/releases/tag/v0.0.1
