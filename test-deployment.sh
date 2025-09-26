#!/bin/bash

echo "🚀 Simple GitHub Pages Deployment Test"
echo "======================================"

# Get repository info
GITHUB_USER=$(git remote get-url origin | sed 's/.*github\.com[:/]\([^/]*\)\/.*/\1/')
REPO_NAME=$(git remote get-url origin | sed 's/.*\/\([^.]*\)\.git/\1/')
PROD_URL="https://$GITHUB_USER.github.io/$REPO_NAME/"

echo "Repository: $GITHUB_USER/$REPO_NAME"
echo "Production URL: $PROD_URL"
echo "Current branch: $(git branch --show-current)"
echo ""

echo "🔍 Testing Production Site"
echo "========================="

# Test if production site is accessible
if curl -s "$PROD_URL" > /tmp/prod_page.html 2>/dev/null; then
    echo "✅ Production site is accessible"
    
    # Check page title
    TITLE=$(grep -o '<title>[^<]*</title>' /tmp/prod_page.html | sed 's/<[^>]*>//g')
    echo "📄 Page title: $TITLE"
    
    # Check for welcome message
    if grep -q "Welcome to eAPD-Next" /tmp/prod_page.html; then
        echo "✅ Shows welcome message"
    fi
    
    # Check for main content
    if grep -q "Create, manage, and export APDs" /tmp/prod_page.html; then
        echo "✅ Main content loaded correctly"
    fi
    
else
    echo "❌ Production site not accessible"
    echo "⏳ If you just pushed to main, wait 5-10 minutes for deployment"
fi

echo ""
echo "📋 Simple Deployment Strategy:"
echo "============================="
echo "✅ Only main branch deploys to production"
echo "🔧 Develop on feature branches locally"
echo "🚀 Merge to main when ready to deploy"
echo "🌐 Single production URL: $PROD_URL"

echo ""
echo "🔗 Useful Links:"
echo "==============="
echo "Production:  $PROD_URL"
echo "Repository:  https://github.com/$GITHUB_USER/$REPO_NAME"
echo "Actions:     https://github.com/$GITHUB_USER/$REPO_NAME/actions"

# Clean up
rm -f /tmp/prod_page.html

echo ""
echo "🎯 Workflow:"
echo "============"
echo "1. Work on feature branches (dev, test, feature/xyz)"
echo "2. Test locally with 'npm run dev'"
echo "3. When ready, merge to main branch"
echo "4. GitHub Actions automatically deploys to production"
echo "5. Visit $PROD_URL to see your changes"