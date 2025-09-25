# eAPD-Next - APD Creation and Management Tool

A modern, browser-based application for creating, managing, and exporting APDs (Advance Planning Documents) for state Medicaid agencies. Built with Next.js, TypeScript, and Material-UI, eAPD-Next provides a guided experience for APD creation with automated calculations, validation, and multi-format export capabilities.

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or 20.x
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

## 📋 Features

### Current Features (v0.1.0)

- ✅ **Modern Tech Stack**: Next.js 15, TypeScript, Material-UI
- ✅ **Responsive Design**: Desktop-optimized with mobile compatibility
- ✅ **Development Tools**: ESLint, Prettier, Husky pre-commit hooks
- ✅ **Testing Framework**: Jest and React Testing Library
- ✅ **CI/CD Pipeline**: GitHub Actions with multi-environment deployment
- ✅ **Accessibility**: WCAG AA compliance foundation

### Planned Features

- 🚧 **Dashboard Interface**: Central APD management with project grouping
- 🚧 **Template System**: Dynamic form generation from CMS templates
- 🚧 **Auto-Save**: Continuous saving with IndexedDB storage
- 🚧 **Budget Calculations**: Automated FFP calculations and validation
- 🚧 **Export System**: PDF, Markdown, and JSON export formats
- 🚧 **Validation Engine**: Real-time validation with clear error messages
- 🚧 **Offline Support**: Progressive Web App with offline capabilities

## 🏗️ Architecture

### Technology Stack

- **Frontend**: Next.js 15 with App Router
- **Language**: TypeScript with strict mode
- **UI Library**: Material-UI (MUI) v5
- **Storage**: IndexedDB for local data persistence
- **Testing**: Jest + React Testing Library + @axe-core/react
- **Deployment**: GitHub Pages with multi-environment support

### Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/             # React components
│   ├── common/            # Shared components (Layout, Navigation)
│   ├── dashboard/         # Dashboard-specific components
│   ├── apd-editor/        # APD editor components
│   ├── forms/             # Form components
│   └── export/            # Export-related components
├── services/              # Business logic and API services
├── types/                 # TypeScript type definitions
├── hooks/                 # Custom React hooks
├── utils/                 # Utility functions
├── theme/                 # Material-UI theme configuration
└── templates/             # APD template definitions

.github/
├── workflows/             # GitHub Actions CI/CD
├── ISSUE_TEMPLATE/        # Issue templates
└── pull_request_template.md

.kiro/
├── steering/              # Kiro AI development guidelines
└── specs/                 # Project specifications

docs/                      # Additional documentation
```

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
3. **Run tests**: `npm test` and `npm run lint`
4. **Commit changes**: Use conventional commit format
5. **Create PR**: Use the provided PR template
6. **Code review**: Address feedback and merge

### Code Quality Standards

- **TypeScript**: Strict mode with explicit types
- **Testing**: 80% minimum code coverage
- **Accessibility**: WCAG AA compliance required
- **Performance**: Bundle size monitoring and optimization
- **Documentation**: JSDoc comments for public APIs

## 🚀 Deployment

### Multi-Environment Setup

- **Production**: `main` branch → https://username.github.io/eapd-next/
- **Staging**: `test` branch → https://username.github.io/eapd-next-test/
- **Development**: `dev` branch → https://username.github.io/eapd-next-dev/

### Deployment Process

1. **Automatic**: Push to tracked branches triggers deployment
2. **Manual**: Use GitHub Actions workflow dispatch
3. **Verification**: Automated deployment verification and rollback

### Environment Configuration

```bash
# Set environment variables for different deployments
NEXT_PUBLIC_ENVIRONMENT=production|staging|development
NEXT_PUBLIC_BASE_PATH=/eapd-next|/eapd-next-test|/eapd-next-dev
```

## 🧪 Testing

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

# Run accessibility tests
npm run test -- --testNamePattern="accessibility"
```

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

- **[Learning Path](docs/LEARNING_PATH.md)**: Week-by-week development progression
- **[Architecture Decisions](docs/ARCHITECTURE_DECISIONS.md)**: Design choices and rationale
- **[Component Guide](docs/COMPONENT_GUIDE.md)**: Component patterns and examples
- **[Troubleshooting](docs/TROUBLESHOOTING.md)**: Common issues and solutions

### Domain Knowledge

- **APD Basics**: Understanding APDs, types, and requirements
- **Regulatory Context**: CMS regulations and compliance requirements
- **User Pain Points**: Common challenges and how eAPD-Next addresses them

### Development Guidelines

- **[Development Standards](.kiro/steering/development-standards.md)**: Code quality and standards
- **[Material-UI Guidelines](.kiro/steering/material-ui-guidelines.md)**: UI component patterns
- **[Git Workflow](.kiro/steering/git-workflow.md)**: Branching and deployment process

## 🎯 User Pain Points Addressed

1. **Complicated Budget Calculations** → Automated calculations with real-time validation
2. **Centralized Management** → Single dashboard for all APD management
3. **Validation and Rework** → Real-time validation with clear error messages
4. **Guidance and Expectations** → Contextual help and regulatory guidance
5. **Administrative Completeness** → Automated completeness checking
6. **Navigation Complexity** → TurboTax-style guided experience
7. **Project Organization** → Project-based APD grouping and management

## 🔧 Configuration

### Environment Variables

```bash
# Application Configuration
NEXT_PUBLIC_ENVIRONMENT=development
NEXT_PUBLIC_VERSION=0.1.0
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

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

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

### Phase 2: Core Features (Weeks 3-4)

- [ ] Dashboard interface implementation
- [ ] Template system development
- [ ] IndexedDB storage layer
- [ ] Basic APD editor

### Phase 3: Advanced Features (Weeks 5-6)

- [ ] Budget calculation engine
- [ ] Validation system
- [ ] Export functionality
- [ ] Progressive Web App features

### Phase 4: Production Ready (Weeks 7-8)

- [ ] Performance optimization
- [ ] Comprehensive testing
- [ ] Documentation completion
- [ ] Production deployment

---

**Built with ❤️ for state Medicaid agencies**

For more information about APDs and Medicaid IT projects, visit the [CMS website](https://www.cms.gov/).
