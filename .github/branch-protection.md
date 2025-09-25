# Branch Protection Configuration

## Setup Instructions

To configure branch protection rules for this repository, follow these steps:

### 1. Navigate to Repository Settings

- Go to your GitHub repository
- Click on "Settings" tab
- Select "Branches" from the left sidebar

### 2. Add Branch Protection Rule for `main`

**Branch name pattern:** `main`

**Protection Settings:**

- ✅ Restrict pushes that create files larger than 100MB
- ✅ Require a pull request before merging
  - ✅ Require approvals: 1
  - ✅ Dismiss stale PR approvals when new commits are pushed
  - ✅ Require review from code owners (if CODEOWNERS file exists)
- ✅ Require status checks to pass before merging
  - ✅ Require branches to be up to date before merging
  - Required status checks:
    - `build-and-test`
    - `accessibility-check`
    - `code-quality`
    - `type-check`
- ✅ Require conversation resolution before merging
- ✅ Require signed commits (recommended for security)
- ✅ Include administrators (applies rules to repository administrators)

### 3. Add Branch Protection Rule for `test`

**Branch name pattern:** `test`

**Protection Settings:**

- ✅ Restrict pushes that create files larger than 100MB
- ✅ Require a pull request before merging
  - ✅ Require approvals: 1
- ✅ Require status checks to pass before merging
  - Required status checks:
    - `build-and-test`
    - `accessibility-check`

### 4. Add Branch Protection Rule for `dev`

**Branch name pattern:** `dev`

**Protection Settings:**

- ✅ Restrict pushes that create files larger than 100MB
- ✅ Require status checks to pass before merging
  - Required status checks:
    - `build-and-test`

## CODEOWNERS File

Create a `.github/CODEOWNERS` file to automatically request reviews from specific team members:

```
# Global owners
* @repository-owner

# Frontend components
/src/components/ @frontend-team

# Documentation
/docs/ @documentation-team
*.md @documentation-team

# Configuration files
/.github/ @devops-team
/package.json @devops-team
/tsconfig.json @devops-team
```

## Automated Setup (Optional)

You can also use the GitHub CLI to set up branch protection rules:

```bash
# Install GitHub CLI if not already installed
# brew install gh (macOS)
# Or download from https://cli.github.com/

# Authenticate
gh auth login

# Set up branch protection for main
gh api repos/:owner/:repo/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["build-and-test","accessibility-check","code-quality","type-check"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
  --field restrictions=null
```
