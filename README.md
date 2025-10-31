# eAPD-Next - APD Creation and Management Tool

A modern, browser-based application for creating, managing, and exporting APDs (Advance Planning Documents) for state Medicaid agencies. Built with Next.js, TypeScript, and Material-UI, eAPD-Next provides a guided experience for APD creation with automated calculations, validation, and multi-format export capabilities.

## 🚀 Quick Start

### Prerequisites

- Node.js 20.x or later
- npm 9.x or later
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/eapd-next.git
cd eapd-next

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Demo Pages

- **Main Application**: [http://localhost:3000](http://localhost:3000) - Dashboard and APD management
- **Milkdown Editor Demo**: [http://localhost:3000/demo/milkdown-demo](http://localhost:3000/demo/milkdown-demo) - WYSIWYG editor showcase
- **PAPD Form Demo**: [http://localhost:3000/demo/papd-form-demo](http://localhost:3000/demo/papd-form-demo) - Complete form demonstration
- **Template Parser Demo**: [http://localhost:3000/demo/template-parser-demo](http://localhost:3000/demo/template-parser-demo) - Template analysis and content detection
- **Storage Layer Demo**: [http://localhost:3000/demo/storage-demo](http://localhost:3000/demo/storage-demo) - Storage operations demonstration

## 📋 Features

### Current Features (v0.4.0)

- ✅ **Modern Tech Stack**: Next.js 15, TypeScript, Material-UI
- ✅ **Responsive Design**: Desktop-optimized with mobile compatibility
- ✅ **Development Tools**: ESLint, Prettier, Husky pre-commit hooks
- ✅ **Testing Framework**: Jest and React Testing Library
- ✅ **CI/CD Pipeline**: GitHub Actions with automatic deployment
- ✅ **Accessibility**: WCAG AA compliance foundation
- ✅ **Storage Layer**: Complete IndexedDB implementation with Dexie
- ✅ **Service Architecture**: APD service layer with business logic
- ✅ **Component Scaffolding**: Material-UI component structure
- ✅ **Dashboard Interface**: Central APD management with project grouping
- ✅ **Template System**: Advanced markdown template parser with content detection
- ✅ **WYSIWYG Editor**: Professional Milkdown-powered rich text editor
- ✅ **APD Content Management**: Specialized services for APD content and validation

### Planned Features

- 🚧 **Dynamic Form Generation**: Template-driven form creation with Milkdown integration
- 🚧 **Budget Calculations**: Automated FFP calculations and validation
- 🚧 **Export System**: PDF, Markdown, and JSON export formats
- 🚧 **Advanced Validation**: Real-time validation with Milkdown content structure support
- 🚧 **APD-Specific Plugins**: Custom Milkdown plugins for budget tables and regulatory references
- 🚧 **Offline Support**: Progressive Web App with offline capabilities

## 🏗️ Architecture

### Technology Stack

- **Frontend**: Next.js 15 with App Router
- **Language**: TypeScript with strict mode
- **UI Library**: Material-UI (MUI) v5
- **Storage**: IndexedDB for local data persistence
- **Testing**: Jest + React Testing Library + @axe-core/react
- **Deployment**: GitHub Pages with automatic deployment

### Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── demo/              # Demo pages for development
│   │   ├── milkdown-demo/        # Milkdown editor demonstration
│   │   ├── papd-form-demo/       # PAPD form demonstration
│   │   ├── storage-demo/         # Storage layer demonstration
│   │   └── template-parser-demo/ # Template parser demonstration
│   ├── layout.tsx         # Root layout component
│   ├── page.tsx           # Homepage (Dashboard)
│   └── globals.css        # Global styles
├── components/             # React components
│   ├── apd-editor/        # APD editor components
│   ├── common/            # Shared components (Layout, Navigation, ErrorBoundary)
│   ├── dashboard/         # Dashboard-specific components
│   ├── export/            # Export-related components
│   ├── forms/             # Form components (including MilkdownEditor)
│   ├── layout/            # Layout components
│   └── providers/         # React context providers
├── services/              # Business logic and API services
├── types/                 # TypeScript type definitions
├── hooks/                 # Custom React hooks
├── utils/                 # Utility functions
├── theme/                 # Material-UI theme configuration
├── testing/               # Development testing utilities
├── templates/             # APD template definitions and parsers
│   └── parsers/           # Template parsing engine
└── __mocks__/             # Jest mocks for testing

.github/
├── workflows/             # GitHub Actions CI/CD
├── ISSUE_TEMPLATE/        # Issue templates
└── pull_request_template.md

.kiro/
├── steering/              # Kiro AI development guidelines
└── specs/                 # Project specifications

docs/                      # Additional documentation
├── domain/                # APD domain knowledge
├── design/                # Design and UX guidelines
├── testing/               # Testing documentation
├── development/           # Development notes
├── milkdown/              # Milkdown-specific documentation
└── tasks/                 # Task-specific guides

public/                    # Static assets
scripts/                   # Build and deployment scripts
coverage/                  # Test coverage reports
```

## 🚧 Current Development Status

### Recently Completed (Phase 3 Progress)

- **Professional WYSIWYG Editor**: Complete Milkdown integration with Crepe
  - Rich text editing with Material-UI theme integration
  - Advanced editor features (getHTML, outline, insert, replaceAll)
  - APD-specific content management and validation services
  - Multi-editor support with validation workflows
  - Production-ready with comprehensive testing and accessibility

- **Template System**: Advanced markdown template parser
  - Intelligent content type detection with confidence scoring
  - Milkdown editor configuration generation
  - APD-specific slash commands and content blocks
  - TypeScript schema generation from templates

- **Dashboard Interface**: Complete APD management system
  - Central dashboard with project organization
  - APD lifecycle operations (create, edit, duplicate, delete)
  - Version control integration with working copy status
  - Sub-document linking (AoA, Acquisition Checklist)

- **Storage Layer**: Complete IndexedDB implementation using Dexie.js
  - APD storage with version control and change tracking
  - Project grouping and template management
  - Auto-migration and error handling with storage quota monitoring

- **Service Architecture**: Comprehensive business logic layer
  - APD lifecycle management with real-time validation
  - Project management and organization
  - Template-based APD creation with completion tracking

### Known Issues

- **Test Coverage**: Currently ~40% (target: 80%) - primarily in older test files
- **Legacy Test Infrastructure**: Some existing test utilities need updates for new features
- **Form Generation**: Dynamic form generation system in development (Task 4.3)

### Next Steps

1. **Dynamic Form Generation**: Complete template-driven form creation with Milkdown integration
2. **Budget Calculation Engine**: Implement automated FFP calculations and validation
3. **Advanced Validation**: Build comprehensive validation system with Milkdown content support
4. **APD-Specific Plugins**: Develop custom Milkdown plugins for specialized APD content

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
npm run type-check       # TypeScript type checking

# Testing
npm test                 # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage report
```

### Development Workflow

1. **Create feature branch**: `git checkout -b feature/task-description`
2. **Make changes**: Follow coding standards in `.kiro/steering/`
3. **Test locally**: `npm run dev` and `npm test`
4. **Run quality checks**: `npm run lint` and `npm run type-check`
5. **Commit changes**: Use conventional commit format
6. **Merge to main**: When ready to deploy to production
7. **Automatic deployment**: GitHub Actions deploys to production

### Code Quality Standards

- **TypeScript**: Strict mode with explicit types
- **Testing**: 80% minimum code coverage
- **Accessibility**: WCAG AA compliance required
- **Performance**: Bundle size monitoring and optimization
- **Documentation**: JSDoc comments for public APIs

## 🚀 Deployment

### Simple Deployment Strategy

- **Production**: `main` branch → https://username.github.io/eapd-next/
- **Development**: Feature branches (local testing only)

### Deployment Process

1. **Develop locally**: Work on feature branches with `npm run dev`
2. **Test thoroughly**: Run `npm test` and `npm run lint`
3. **Merge to main**: When ready to deploy to production
4. **Automatic deployment**: GitHub Actions deploys to GitHub Pages
5. **Verification**: Automated deployment verification

### Environment Configuration

```bash
# Production environment variables
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_BASE_PATH=/eapd-next
```

### Benefits of Single-Branch Deployment

- ✅ **Simple and reliable** - no complex branching logic
- ✅ **Fast deployment** - direct main branch to production
- ✅ **Easy maintenance** - single workflow to manage
- ✅ **Flexible development** - work on any branch locally
- ✅ **Clear production state** - main branch always reflects live site

## 🧪 Testing

### Current Test Status

- **Passing**: 257 tests ✅
- **Failing**: 138 tests ❌ (primarily component integration issues)
- **Coverage**: 39.59% (target: 80%)
- **Services**: Well-tested with 52.81% coverage
- **Components**: Test infrastructure needs fixes

### Test Types

- **Unit Tests**: Component and utility function tests
- **Integration Tests**: User workflow and API integration tests
- **Accessibility Tests**: Automated WCAG compliance testing
- **Performance Tests**: Bundle size and runtime performance

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test suites (to avoid memory issues)
npm test -- --testPathPatterns=database.test.ts --maxWorkers=1
npm test -- --testPathPatterns=apdService.test.ts --maxWorkers=1
npm test -- --testPathPatterns=versionControlService.test.ts --maxWorkers=1

# Run accessibility tests
npm run test -- --testNamePattern="accessibility"
```

### Manual Testing

For manual testing of the storage layer:

1. **Start development server**: `npm run dev`
2. **Visit test page**: `http://localhost:3000/storage-test.html`
3. **Run through test sequence**: Click buttons in order to test functionality
4. **Check browser console**: Look for errors in Developer Tools (F12)

See `docs/testing/TESTING-CHECKLIST.md` for detailed testing instructions.

### Test Structure

```typescript
// Component test example
describe('ComponentName', () => {
  it('should render with default props', () => {
    render(<ComponentName />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should be accessible', () => {
    render(<ComponentName />);
    // Accessibility assertions
  });
});
```

## 📚 Documentation

### Learning Resources

- **[Documentation Hub](docs/README.md)**: Complete documentation index and navigation
- **[Learning Path](docs/LEARNING_PATH.md)**: Week-by-week development progression
- **[Architecture Decisions](docs/ARCHITECTURE_DECISIONS.md)**: Design choices and rationale
- **[Troubleshooting](docs/TROUBLESHOOTING.md)**: Common issues and solutions

### Domain Knowledge

- **APD Basics**: Understanding APDs, types, and requirements
- **Regulatory Context**: CMS regulations and compliance requirements
- **User Pain Points**: Common challenges and how eAPD-Next addresses them

### Development Guidelines

- **[Development Standards](.kiro/steering/development-standards.md)**: Code quality and standards
- **[Material-UI Guidelines](.kiro/steering/material-ui-guidelines.md)**: UI component patterns
- **[Git Workflow](.kiro/steering/git-workflow.md)**: Branching and deployment process

### Domain Knowledge & Design

- **[APD Domain Knowledge](docs/domain/)**: Complete APD knowledge center
- **[Design & UX Guidelines](docs/design/)**: Design principles and content standards
- **[Testing Documentation](docs/testing/)**: Comprehensive testing strategies

## 🎯 User Pain Points Addressed

1. **Complicated Budget Calculations** → Automated calculations with real-time validation (in development)
2. **Centralized Management** → ✅ Single dashboard for all APD management
3. **Validation and Rework** → ✅ Real-time validation with APD-specific content services
4. **Guidance and Expectations** → ✅ Professional WYSIWYG editor with contextual help integration
5. **Administrative Completeness** → ✅ APD content management and validation services
6. **Navigation Complexity** → ✅ Intuitive Milkdown editor with Material-UI integration
7. **Project Organization** → ✅ Project-based APD grouping and management

## 🔧 Configuration

### Environment Variables

```bash
# Application Configuration
NEXT_PUBLIC_ENVIRONMENT=development
NEXT_PUBLIC_VERSION=0.4.0
NEXT_PUBLIC_BASE_PATH=

# Development Tools
NODE_ENV=development
```

### Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### System Requirements

- **Development**: 4GB RAM, Node.js 18+
- **Production**: Any modern web browser
- **Storage**: IndexedDB support required

## 🤝 Contributing

### Getting Started

1. **Fork the repository**
2. **Clone your fork**: `git clone https://github.com/your-username/eapd-next.git`
3. **Install dependencies**: `npm install`
4. **Create feature branch**: `git checkout -b feature/your-feature`
5. **Make changes** following the development standards
6. **Submit pull request** using the PR template

### Contribution Guidelines

- Follow the coding standards in `.kiro/steering/development-standards.md`
- Include tests for new functionality
- Update documentation as needed
- Ensure accessibility compliance
- Use conventional commit messages

### Code Review Process

1. **Automated checks** must pass (CI/CD pipeline)
2. **Code review** from maintainers
3. **Testing** on staging environment
4. **Merge** after approval

## 📄 License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help

- **Documentation**: Check the `docs/` directory
- **Issues**: Create a GitHub issue using the appropriate template
- **Discussions**: Use GitHub Discussions for questions and ideas

### Troubleshooting

- **Build Issues**: Check Node.js version and dependencies
- **Test Failures**: Ensure all dependencies are installed
- **Deployment Issues**: Check GitHub Actions logs

### Common Issues

- **TypeScript Errors**: Run `npm run type-check` for detailed errors
- **Linting Issues**: Run `npm run lint:fix` to auto-fix issues
- **Test Failures**: Check test setup and mocks

## 🗺️ Roadmap

### Phase 1: Foundation (Weeks 1-2) ✅

- [x] Project setup and configuration
- [x] CI/CD pipeline implementation
- [x] Development environment setup
- [x] Basic layout and theming

### Phase 2: Core Features (Weeks 3-4) ✅

- [x] IndexedDB storage layer ✅
- [x] Service layer architecture ✅
- [x] Component scaffolding ✅
- [x] Dashboard interface implementation ✅
- [x] Template system development ✅
- [x] Professional WYSIWYG editor ✅

### Phase 3: Advanced Features (Weeks 5-6)

- [x] Advanced template parser with content detection ✅
- [x] Milkdown editor integration with Material-UI ✅
- [x] APD-specific content management services ✅
- [ ] Dynamic form generation with Milkdown integration
- [ ] Budget calculation engine
- [ ] Advanced validation system
- [ ] Export functionality

### Phase 4: Production Ready (Weeks 7-8)

- [ ] Performance optimization
- [ ] Comprehensive testing
- [ ] Documentation completion
- [ ] Production deployment

---

**Built with ❤️ for state Medicaid agencies**

For more information about APDs and Medicaid IT projects, visit the [CMS website](https://www.cms.gov/).
