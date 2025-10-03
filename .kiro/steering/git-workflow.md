# Git Workflow and Deployment Process for eAPD-Next

## Branch Strategy

### Main Branch

- **`main`** - Production-ready code, automatically deployed to production

### Development Branches

- **Feature branches** - Individual features and tasks (local development only)
- **Bug fix branches** - Bug fixes and hotfixes (local development only)

### Feature Branches

- **Naming**: `feature/task-description` or `feature/issue-number-description`
- **Purpose**: Individual features or tasks from the implementation plan
- **Lifecycle**: Created from `main`, merged back to `main` when ready for production
- **Examples**:
  - `feature/dashboard-apd-list`
  - `feature/template-parser`
  - `feature/budget-calculations`

### Bug Fix Branches

- **Naming**: `fix/issue-description` or `fix/bug-number-description`
- **Purpose**: Bug fixes and hotfixes
- **Lifecycle**: Created from `main`, merged back to `main` when fixed
- **Examples**:
  - `fix/validation-error-display`
  - `fix/export-pdf-formatting`

### Release Process

- **Tagging**: Use Git tags for version releases on `main` branch
- **Purpose**: Mark stable releases and track version history
- **Process**: Tag `main` branch when ready for release
- **Examples**: `git tag v1.0.0`, `git tag v1.1.0`

## Commit Message Standards

### Conventional Commits Format

Use the conventional commits specification for all commit messages:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Commit Types

- **feat**: New feature implementation
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, missing semicolons, etc.)
- **refactor**: Code refactoring without changing functionality
- **test**: Adding or updating tests
- **chore**: Maintenance tasks, dependency updates, build changes
- **perf**: Performance improvements
- **ci**: CI/CD pipeline changes

### Examples

```bash
# Feature implementation
feat(dashboard): add APD list component with sorting and filtering

# Bug fix
fix(validation): correct budget calculation for federal share

# Documentation update
docs(readme): add setup instructions for development environment

# Refactoring
refactor(storage): extract IndexedDB operations into service layer

# Test addition
test(components): add unit tests for Layout component

# Chore/maintenance
chore(deps): update Material-UI to latest version
```

### Commit Message Guidelines

- **First line**: 50 characters or less, imperative mood
- **Body**: Wrap at 72 characters, explain what and why
- **Footer**: Reference issues, breaking changes, etc.

```bash
feat(apd-editor): implement auto-save functionality

Add automatic saving of APD changes every 5 seconds to prevent
data loss. Uses debounced saving to IndexedDB with visual
indicators for save status.

- Debounced auto-save every 5 seconds
- Visual save status indicator
- Error handling for save failures
- Recovery mechanism for failed saves

Closes #123
```

## Development Workflow

### Starting New Work

1. **Update local repository**:

   ```bash
   git checkout main
   git pull origin main
   ```

2. **Create feature branch**:

   ```bash
   git checkout -b feature/task-description
   ```

3. **Develop and test locally**:

   ```bash
   npm run dev  # Test in development server
   npm test     # Run tests
   npm run lint # Check code quality
   ```

4. **Commit changes regularly**:

   ```bash
   git add .
   git commit -m "feat(component): implement initial structure"
   ```

5. **Merge to main when ready**:
   ```bash
   git checkout main
   git pull origin main
   git merge feature/task-description
   git push origin main  # Triggers automatic deployment
   ```

### Code Review Process

1. **Create Pull Request** with proper template
2. **Automated checks** must pass (CI/CD pipeline)
3. **Code review** from at least one team member
4. **Address feedback** and update PR
5. **Final approval** and merge

### Merging Strategy

- **Squash and merge** for feature branches to keep clean history
- **Merge commit** for release branches to preserve branch history
- **Rebase and merge** for small, clean commits

## Simple Deployment Strategy

### Production Environment

- **Branch**: `main`
- **URL**: `https://username.github.io/eapd-next/`
- **Deployment**: Automatic on push to `main`
- **Purpose**: Live application for end users

### Development Environment

- **Branches**: Feature branches (e.g., `feature/dashboard`, `fix/validation`)
- **Testing**: Local development server (`npm run dev`)
- **Purpose**: Local development and testing before merging to main

### Deployment Pipeline

#### Automated Deployment Process

1. **Code push** to `main` branch
2. **CI/CD pipeline** runs automatically:
   - Install dependencies
   - Run type checking
   - Run linting
   - Run tests
   - Build application
   - Deploy to GitHub Pages
3. **Deployment verification** checks site accessibility

#### Manual Deployment

For emergency deployments:

```bash
# Deploy hotfix to production
git checkout main
git pull origin main
# Make necessary changes
git add .
git commit -m "fix(critical): resolve urgent issue"
git push origin main  # Triggers automatic deployment
```

### Release Process

#### Regular Release

1. **Ensure main is ready**:

   ```bash
   git checkout main
   git pull origin main
   # Verify all features are complete and tested
   ```

2. **Update version and create tag**:

   ```bash
   npm version minor  # or patch/major
   # Update CHANGELOG.md if needed
   git add .
   git commit -m "chore(release): prepare version 1.1.0"
   git tag v1.1.0
   ```

3. **Deploy to production**:

   ```bash
   git push origin main
   git push origin v1.1.0
   # GitHub Actions automatically deploys to production
   ```

#### Hotfix Process

1. **Create hotfix branch** from `main`:

   ```bash
   git checkout main
   git pull origin main
   git checkout -b fix/critical-bug
   ```

2. **Implement and test fix locally**:

   ```bash
   # Make necessary changes
   npm run dev  # Test locally
   npm test     # Run tests
   git commit -m "fix(critical): resolve security vulnerability"
   ```

3. **Deploy to production**:

   ```bash
   git checkout main
   git merge fix/critical-bug
   git push origin main  # Automatic deployment
   git branch -d fix/critical-bug
   ```

## Quality Gates

### Pre-commit Checks (Husky)

Automated checks before each commit:

- **Prettier formatting**: Code formatting consistency
- **ESLint**: Code quality and style rules
- **Type checking**: TypeScript compilation
- **Test execution**: Run affected tests

### Pull Request Requirements

Before merging any PR:

- [ ] All CI/CD checks pass
- [ ] Code review approved
- [ ] Tests added/updated for new functionality
- [ ] Documentation updated in appropriate `docs/` subdirectory if needed
- [ ] No merge conflicts
- [ ] Accessibility review for UI changes
- [ ] Domain documentation updated if APD requirements change
- [ ] Testing documentation updated if procedures change

### Deployment Requirements

Before merging to main (production):

- [ ] All tests pass locally (`npm test`)
- [ ] Code quality checks pass (`npm run lint`)
- [ ] TypeScript compilation successful (`npm run type-check`)
- [ ] Local testing completed (`npm run dev`)
- [ ] Performance impact assessed
- [ ] Security review completed
- [ ] Documentation structure maintained in `docs/` directory
- [ ] All README files updated to reflect changes

## Branch Protection Rules

### Main Branch Protection

- **Require PR reviews**: 1 required reviewer
- **Require status checks**: All CI/CD checks must pass
- **Require up-to-date branches**: Must be current with main
- **Include administrators**: Rules apply to all users
- **Restrict force pushes**: Prevent history rewriting

### Feature Branch Guidelines

- **Local development**: No protection rules needed
- **Testing required**: Must test locally before merging
- **Clean history**: Squash commits when merging to main
- **Delete after merge**: Clean up feature branches promptly

## Troubleshooting Common Issues

### Merge Conflicts

```bash
# Update your branch with latest changes
git checkout feature/my-feature
git fetch origin
git rebase origin/dev

# Resolve conflicts in your editor
# After resolving conflicts:
git add .
git rebase --continue
git push --force-with-lease origin feature/my-feature
```

### Failed Deployments

1. **Check CI/CD logs** for specific error messages
2. **Verify environment variables** are set correctly
3. **Test build locally** to reproduce issues
4. **Rollback if necessary** using previous deployment

### Branch Sync Issues

```bash
# Update feature branch with latest main
git checkout feature/my-feature
git fetch origin
git rebase origin/main

# Resolve conflicts in your editor
# After resolving conflicts:
git add .
git rebase --continue
```

## Git Hooks and Automation

### Pre-commit Hook

Located in `.husky/pre-commit`:

```bash
#!/usr/bin/env sh
npx lint-staged
```

### Lint-staged Configuration

In `package.json`:

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": ["prettier --write"],
    "*.{json,md,yml,yaml}": ["prettier --write"]
  }
}
```

### GitHub Actions Integration

- **Automatic deployment** on branch pushes
- **Status checks** for pull requests
- **Security scanning** with CodeQL
- **Dependency updates** with automated PRs

## Best Practices

### Commit Frequency

- **Commit often**: Small, logical changes
- **Atomic commits**: One logical change per commit
- **Complete features**: Don't commit broken code
- **Meaningful messages**: Clear, descriptive commit messages

### Branch Management

- **Keep branches focused**: One feature/fix per branch
- **Regular updates**: Sync with base branch frequently
- **Clean up**: Delete merged branches promptly
- **Short-lived**: Merge branches within a few days

### Code Review

- **Review thoroughly**: Check logic, style, and tests
- **Be constructive**: Provide helpful feedback
- **Test locally**: Pull and test changes when needed
- **Approve promptly**: Don't block progress unnecessarily

### Deployment Safety

- **Test thoroughly**: Use local development server
- **Monitor deployments**: Watch GitHub Actions and production site
- **Have rollback plan**: Know how to revert commits quickly
- **Communicate changes**: Notify team of production deployments
