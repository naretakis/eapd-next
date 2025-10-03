# Development Standards for eAPD-Next

## Code Quality Standards

### TypeScript Configuration

- Use strict mode with all strict flags enabled
- No implicit any types allowed
- All functions must have explicit return types for public APIs
- Use proper type definitions for all props and state

### Component Standards

- All React components must be functional components with TypeScript
- Use proper prop interfaces with JSDoc comments
- Include accessibility attributes (ARIA labels, semantic HTML)
- Follow Material-UI component patterns and best practices

### File Organization

- Each component should have its own directory with:
  - `ComponentName.tsx` - Main component file
  - `index.ts` - Export file
  - `ComponentName.test.tsx` - Test file
  - `README.md` - Component documentation (for complex components)

### Naming Conventions

- Components: PascalCase (e.g., `APDEditor`, `FormField`)
- Files: PascalCase for components, camelCase for utilities
- Variables and functions: camelCase
- Constants: UPPER_SNAKE_CASE
- Types and interfaces: PascalCase with descriptive names

### Code Style

- Use Prettier for formatting (configured in .prettierrc)
- Follow ESLint rules (configured in eslint.config.mjs)
- Maximum line length: 80 characters
- Use meaningful variable and function names
- Add JSDoc comments for all public APIs

## Testing Requirements

### Test Coverage

- Minimum 80% code coverage for all new code
- All components must have unit tests
- Critical user flows must have integration tests
- Accessibility tests required for all interactive components

### Test Structure

- Use React Testing Library for component tests
- Use Jest for unit tests and mocking
- Test files should be co-located with components
- Use descriptive test names that explain the behavior being tested

### Test Patterns

```typescript
// Good test structure
describe('ComponentName', () => {
  it('should render with default props', () => {
    // Test implementation
  });

  it('should handle user interaction correctly', () => {
    // Test implementation
  });

  it('should be accessible to screen readers', () => {
    // Accessibility test
  });
});
```

## Git Workflow

### Commit Messages

- Use conventional commit format: `type(scope): description`
- Types: feat, fix, docs, style, refactor, test, chore
- Keep first line under 50 characters
- Include detailed description for complex changes
- Use `BREAKING CHANGE:` footer for breaking changes

### Branch Strategy

- `main` - Production-ready code (automatically deployed)
- Feature branches: `feature/task-description` (local development)
- Bug fixes: `fix/issue-description`

### Pull Request Requirements

- All tests must pass
- Code review required from at least one team member
- No merge conflicts
- Updated documentation if needed
- Accessibility review for UI changes

### Release Workflow

1. **Feature Development**: Use conventional commits throughout development
2. **Pre-Release**: Run `npm run changelog:draft` to review changes
3. **Update CHANGELOG**: Curate and add user-facing changes to CHANGELOG.md
4. **Version Bump**: Use `npm version [major|minor|patch]` to update version
5. **Commit Release**: Commit changelog and version changes together
6. **Push and Tag**: Push commits and tags to trigger deployment
7. **Verify Release**: Confirm deployment and version display

## Performance Standards

### Bundle Size

- Monitor bundle size with each build
- Use code splitting for large components
- Lazy load non-critical components
- Optimize images and assets

### Runtime Performance

- Components should render in under 100ms
- Use React.memo for expensive components
- Implement proper cleanup in useEffect hooks
- Avoid unnecessary re-renders

## Security Guidelines

### Data Handling

- All user input must be validated
- Use TypeScript for type safety
- Sanitize data before storage
- No sensitive data in localStorage (use IndexedDB)

### Dependencies

- Regular security audits with npm audit
- Keep dependencies up to date
- Review new dependencies before adding
- Use exact versions in package.json for critical dependencies

## Accessibility Requirements

### WCAG Compliance

- Must meet WCAG 2.1 AA standards
- All interactive elements must be keyboard accessible
- Proper color contrast ratios (4.5:1 for normal text)
- Screen reader compatibility required

### Implementation

- Use semantic HTML elements
- Include proper ARIA labels and roles
- Implement focus management
- Test with screen readers and keyboard navigation

## Documentation Standards

### Code Documentation

- Keep main README file up to date with code changes
- Keep CHANGELOG file up to date with changes
- Keep all documentation in `docs/` directory up to date with code changes
- JSDoc comments for all public APIs
- README files for complex components
- Architecture decision records in `docs/ARCHITECTURE_DECISIONS.md`

### Documentation Organization

Follow the established documentation structure in `docs/`:

- **`docs/domain/`**: APD knowledge, project overview, and terminology
- **`docs/design/`**: UX principles, content guidelines, and design evolution
- **`docs/testing/`**: Testing strategies, frameworks, and procedures
- **`docs/development/`**: Development process and internal documentation
- **`docs/milkdown/`**: Editor-specific documentation and patterns
- **`docs/tasks/`**: Task-specific integration guides

### User Documentation

- Clear setup instructions in main README
- Component usage examples in component directories
- Troubleshooting guides in `docs/TROUBLESHOOTING.md`
- Learning resources in `docs/LEARNING_PATH.md`
- Domain knowledge in `docs/domain/` for APD context

## Version Management and Changelog Standards

### Semantic Versioning

Follow [Semantic Versioning](https://semver.org/) strictly:

- **MAJOR** (1.0.0): Breaking changes that require user action
- **MINOR** (0.2.0): New features that are backward compatible
- **PATCH** (0.1.1): Bug fixes that are backward compatible

### Version Bumping Process

1. **Determine Version Type**: Based on changes since last release
2. **Update Version**: Use `npm version [major|minor|patch]` (updates package.json and creates git tag)
3. **Update CHANGELOG**: Add new version section with user-facing changes
4. **Commit and Push**: Include changelog updates in version commit
5. **Verify Deployment**: Ensure version displays correctly in application

### Changelog Maintenance

#### Required for Every Release

- **Update CHANGELOG.md** before version bump
- **Follow Keep a Changelog format** with consistent sections
- **Focus on user impact** rather than technical implementation details
- **Group related commits** into meaningful feature descriptions

#### Changelog Sections (in order)

- **Added** for new features
- **Changed** for changes in existing functionality
- **Deprecated** for soon-to-be removed features
- **Removed** for now removed features
- **Fixed** for any bug fixes
- **Security** for vulnerability fixes

#### Semi-Automated Workflow

1. **Generate Draft**: Run `npm run changelog:draft` to get commit-based draft
2. **Review Commits**: Focus on conventional commit types since last release
3. **Curate Content**: Transform technical commits into user-facing descriptions
4. **Group Features**: Combine related commits into cohesive feature descriptions
5. **Add Context**: Explain why changes matter to users

#### Commit Type Mapping

- `feat:` → **Added** section (new features)
- `fix:` → **Fixed** section (bug fixes)
- `docs:` → **Changed** (if user-facing) or omit if internal
- `perf:` → **Changed** or **Added** (performance improvements)
- `refactor:` → Usually omit unless user-facing impact
- `style:`, `test:`, `chore:` → Usually omit unless significant
- `BREAKING CHANGE:` → **Changed** with migration notes

#### Quality Standards

- **User-Focused Language**: Avoid technical jargon, explain user benefits
- **Actionable Information**: Include migration steps for breaking changes
- **Complete Coverage**: All user-visible changes must be documented
- **Consistent Format**: Use same style and structure across versions
- **Accurate Dates**: Use actual release dates (YYYY-MM-DD format)

### Version Display Integration

Ensure version is displayed consistently:

- **Application Header/Footer**: Show current version to users
- **Environment Variables**: Use `NEXT_PUBLIC_VERSION` from package.json
- **Fallback Values**: Update component fallbacks when bumping versions
- **Test Expectations**: Update tests that check version display

### Release Process Integration

#### Pre-Release Checklist

- [ ] All tests passing (minimum 80% coverage)
- [ ] Documentation updated (README, component docs)
- [ ] CHANGELOG.md updated with new version
- [ ] Version bump completed (`npm version`)
- [ ] Git tags created and pushed
- [ ] Application displays new version correctly

#### Post-Release Verification

- [ ] Deployment successful and accessible
- [ ] Version displayed correctly in application
- [ ] CHANGELOG.md links work correctly
- [ ] Git tags pushed to remote repository

### Automation Tools

#### Available Scripts

- `npm run changelog:draft` - Generate changelog draft from commits
- `npm version [type]` - Bump version and create git tag
- `git log --oneline --no-merges` - Review commits for changelog

#### Helper Commands

```bash
# Get commits since last tag for changelog
git log $(git describe --tags --abbrev=0)..HEAD --oneline --no-merges

# Get commits by type since last tag
git log $(git describe --tags --abbrev=0)..HEAD --oneline --no-merges --grep="^feat:"
git log $(git describe --tags --abbrev=0)..HEAD --oneline --no-merges --grep="^fix:"

# Check current version
npm version --json
```

## Error Handling

### Error Boundaries

- Implement error boundaries for component trees
- Graceful degradation for non-critical features
- User-friendly error messages
- Proper error logging and reporting

### Validation

- Client-side validation for all forms
- Server-side validation for all data
- Clear error messages with actionable guidance
- Progressive enhancement approach

## Development Workflow

### Local Development

1. Run `npm run dev` for development server
2. Run `npm run test:watch` for continuous testing
3. Run `npm run lint` before committing
4. Use `npm run type-check` for TypeScript validation

### Code Review Checklist

- [ ] Code follows style guidelines
- [ ] Tests are comprehensive and passing
- [ ] Documentation is updated in appropriate `docs/` subdirectory
- [ ] Accessibility requirements met
- [ ] Performance impact considered
- [ ] Security implications reviewed
- [ ] Error handling implemented
- [ ] README.md updated (for releases)
- [ ] CHANGELOG.md updated (for releases)
- [ ] Version bump appropriate for changes (for releases)
- [ ] User-facing changes clearly documented
- [ ] Domain documentation updated if APD requirements change
- [ ] Design documentation updated if UX patterns change
- [ ] Testing documentation updated if procedures change

### Deployment Process

- All changes go through CI/CD pipeline
- Automated testing and deployment on main branch
- Local testing required before merging to main
- Rollback plan for production deployments
