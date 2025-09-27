#!/bin/bash

# Generate Changelog Draft
# This script helps create changelog entries from git commits since the last tag

echo "🔍 Generating changelog draft since last release..."
echo ""

# Get the last tag
LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "Initial commit")
echo "📋 Changes since: $LAST_TAG"
echo ""

# Function to get commits by type
get_commits_by_type() {
    local type=$1
    local section=$2
    
    commits=$(git log ${LAST_TAG}..HEAD --oneline --no-merges --grep="^${type}:" 2>/dev/null)
    
    if [ ! -z "$commits" ]; then
        echo "### $section"
        echo ""
        while IFS= read -r commit; do
            # Extract commit message after the type prefix
            message=$(echo "$commit" | sed "s/^[a-f0-9]* ${type}[^:]*: //")
            echo "- $message"
        done <<< "$commits"
        echo ""
    fi
}

# Generate sections
get_commits_by_type "feat" "Added"
get_commits_by_type "fix" "Fixed"
get_commits_by_type "docs" "Changed (Documentation)"
get_commits_by_type "perf" "Changed (Performance)"
get_commits_by_type "refactor" "Changed (Refactoring)"

# Show other commits that might need manual review
echo "### Other Commits (Review Manually)"
echo ""
other_commits=$(git log ${LAST_TAG}..HEAD --oneline --no-merges --invert-grep --grep="^(feat|fix|docs|perf|refactor):" 2>/dev/null)
if [ ! -z "$other_commits" ]; then
    while IFS= read -r commit; do
        echo "- $commit"
    done <<< "$other_commits"
else
    echo "- No other commits found"
fi
echo ""

echo "📝 Instructions:"
echo "1. Copy relevant entries to CHANGELOG.md"
echo "2. Group related commits into meaningful features"
echo "3. Rewrite technical language for user-facing impact"
echo "4. Add version number and date"
echo "5. Focus on user-visible changes"