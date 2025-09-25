# GitHub Projects Configuration for eAPD-Next

## Project Setup Instructions

### Main Project Board: "eAPD-Next Development"

**Columns:**

1. **Backlog** - New issues and feature requests
2. **Ready** - Issues that are ready to be worked on
3. **In Progress** - Currently being developed
4. **Review** - Pull requests under review
5. **Testing** - Features being tested
6. **Done** - Completed work

**Automation Rules:**

- Move issues to "In Progress" when assigned
- Move PRs to "Review" when opened
- Move issues to "Done" when closed
- Move PRs to "Done" when merged

### Milestone Planning

**Phase 1: Foundation (Weeks 1-2)**

- Repository setup and configuration
- Next.js project initialization
- Basic development environment
- CI/CD pipeline setup

**Phase 2: Core Features (Weeks 3-4)**

- Dashboard implementation
- Template system development
- Data management with IndexedDB
- Basic APD editor

**Phase 3: Advanced Features (Weeks 5-6)**

- Export functionality
- Validation system
- Progressive Web App features
- Accessibility improvements

**Phase 4: Polish & Production (Weeks 7-8)**

- Performance optimization
- Comprehensive testing
- Documentation completion
- Production deployment

### Issue Templates Integration

Issues created from templates will automatically:

- Be assigned appropriate labels based on template type
- Be added to the main project board in "Backlog"
- Be assigned to appropriate milestone based on priority
- Include all necessary information for triage

### Branch Protection Rules

**Main Branch Protection:**

- Require pull request reviews before merging
- Require status checks to pass before merging
- Require branches to be up to date before merging
- Restrict pushes that create files larger than 100MB
- Require signed commits (recommended)

**Required Status Checks:**

- Build and test workflow
- Accessibility tests
- Code quality checks (ESLint, Prettier)
- Type checking (TypeScript)

### Project Maintenance

**Weekly Tasks:**

- Review and triage new issues
- Update milestone progress
- Review and merge approved PRs
- Update project documentation

**Monthly Tasks:**

- Review and update labels
- Analyze project metrics
- Update project roadmap
- Clean up closed issues and PRs
