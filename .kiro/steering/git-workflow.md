# Git Workflow and Deployment Process for eAPD-Next

## Branch Strategy

### Main Branches

- **`main`** - Production-ready code, deployed to production environment
- **`test`** - Staging environment for testing before production
- **`dev`** - Development environment for ongoing development work

### Feature Branches

- **Naming**: `feature/task-description` or `feature/issue-number-description`
- **Purpose**: Individual features or tasks from the implementation plan
- **Lifecycle**: Created from `dev`, merged back to `dev` when complete
- **Examples**:
  - `feature/dashboard-apd-list`
  - `feature/template-parser`
  - `feature/budget-calculations`

### Bug Fix Branches

- **Naming**: `fix/issue-description` or `fix/bug-number-description`
- **Purpose**: Bug fixes and hotfixes
- **Lifecycle**: Created from appropriate base branch, merged back when fixed
- **Examples**:
  - `fix/validation-error-display`
  - `fix/export-pdf-formatting`

### Release Branches

- **Naming**: `release/version-number`
- **Purpose**: Prepare releases, final testing, and version bumping
- **Lifecycle**: Created from `dev`, merged to `main` and `test`
- **Examples**: `release/1.0.0`, `release/1.1.0`

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
   git checkout dev
   git pull origin dev
   ```

2. **Create feature branch**:

   ```bash
   git checkout -b feature/task-description
   ```

3. **Make changes and commit regularly**:

   ```bash
   git add .
   git commit -m "feat(component): implement initial structure"
   ```

4. **Push branch and create PR**:
   ```bash
   git push origin feature/task-description
   # Create PR through GitHub interface
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

## Multi-Environment Deployment

### Environment Configuration

#### Production Environment

- **Branch**: `main`
- **URL**: `https://username.github.io/eapd-next/`
- **Deployment**: Automatic on push to `main`
- **Purpose**: Live application for end users

#### Staging Environment

- **Branch**: `test`
- **URL**: `https://username.github.io/eapd-next-test/`
- **Deployment**: Automatic on push to `test`
- **Purpose**: Final testing before production release

#### Development Environment

- **Branch**: `dev`
- **URL**: `https://username.github.io/eapd-next-dev/`
- **Deployment**: Automatic on push to `dev`
- **Purpose**: Ongoing development and integration testing

### Deployment Pipeline

#### Automated Deployment Process

1. **Code push** to tracked branch
2. **CI/CD pipeline** runs automatically:
   - Install dependencies
   - Run type checking
   - Run linting
   - Run tests
   - Build application
   - Deploy to GitHub Pages
3. **Deployment verification** checks site accessibility
4. **Rollback** if deployment fails (production only)

#### Manual Deployment

For emergency deployments or special cases:

```bash
# Deploy specific commit to staging
git checkout test
git cherry-pick <commit-hash>
git push origin test

# Deploy hotfix to production
git checkout main
git cherry-pick <hotfix-commit>
git push origin main
```

### Release Process

#### Regular Release (Weekly/Bi-weekly)

1. **Create release branch** from `dev`:

   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b release/1.1.0
   ```

2. **Update version numbers** and changelog:

   ```bash
   npm version minor  # or patch/major
   # Update CHANGELOG.md
   git commit -am "chore(release): prepare version 1.1.0"
   ```

3. **Test on staging**:

   ```bash
   git checkout test
   git merge release/1.1.0
   git push origin test
   # Perform manual testing on staging environment
   ```

4. **Deploy to production**:

   ```bash
   git checkout main
   git merge release/1.1.0
   git push origin main
   git tag v1.1.0
   git push origin v1.1.0
   ```

5. **Merge back to dev**:
   ```bash
   git checkout dev
   git merge release/1.1.0
   git push origin dev
   git branch -d release/1.1.0
   ```

#### Hotfix Process

1. **Create hotfix branch** from `main`:

   ```bash
   git checkout main
   git checkout -b fix/critical-bug
   ```

2. **Implement fix and test**:

   ```bash
   # Make necessary changes
   git commit -m "fix(critical): resolve security vulnerability"
   ```

3. **Deploy to staging for verification**:

   ```bash
   git checkout test
   git merge fix/critical-bug
   git push origin test
   ```

4. **Deploy to production**:

   ```bash
   git checkout main
   git merge fix/critical-bug
   git push origin main
   ```

5. **Merge back to dev**:
   ```bash
   git checkout dev
   git merge fix/critical-bug
   git push origin dev
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
- [ ] Documentation updated if needed
- [ ] No merge conflicts
- [ ] Accessibility review for UI changes

### Deployment Requirements

Before deploying to production:

- [ ] All tests pass on staging
- [ ] Manual testing completed
- [ ] Performance impact assessed
- [ ] Security review completed
- [ ] Rollback plan prepared

## Branch Protection Rules

### Main Branch Protection

- **Require PR reviews**: 1 required reviewer
- **Require status checks**: All CI/CD checks must pass
- **Require up-to-date branches**: Must be current with main
- **Include administrators**: Rules apply to all users
- **Restrict force pushes**: Prevent history rewriting

### Test Branch Protection

- **Require status checks**: Build and test must pass
- **Allow force pushes**: For emergency fixes
- **Require up-to-date branches**: Recommended but not required

### Dev Branch Protection

- **Require status checks**: Basic build check
- **Allow force pushes**: For development flexibility
- **No review required**: For rapid development

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

### Sync Issues Between Environments

```bash
# Sync staging with production
git checkout test
git reset --hard main
git push --force origin test

# Sync development with staging
git checkout dev
git merge test
git push origin dev
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

- **Test thoroughly**: Use staging environment
- **Monitor deployments**: Watch for errors after deployment
- **Have rollback plan**: Know how to revert quickly
- **Communicate changes**: Notify team of deployments
