#!/usr/bin/env bash
set -euo pipefail

NEW_VERSION="${1:-}"
if [ -z "$NEW_VERSION" ]; then
  echo "Usage: $0 <version>" >&2
  echo "Example: $0 1.3.0" >&2
  exit 1
fi

VERSION="v$NEW_VERSION"
BRANCH="release/$VERSION"

# Pre-flight
if [ "$(git branch --show-current)" != "main" ]; then
  echo "Must be on main branch" >&2
  exit 1
fi
if [ -n "$(git status --porcelain)" ]; then
  echo "Working tree must be clean" >&2
  exit 1
fi
git fetch origin --quiet
if [ "$(git rev-parse HEAD)" != "$(git rev-parse origin/main)" ]; then
  echo "Local main must equal origin/main (run: git pull)" >&2
  exit 1
fi

# Bump and rebuild
npm version "$NEW_VERSION" --no-git-tag-version
npm run prepare

# Branch + commit + push
git checkout -b "$BRANCH"
git add package.json package-lock.json dist/
git commit -m "Version $VERSION"
git push -u origin "$BRANCH"

# Open PR
gh pr create \
  --title "Version $VERSION" \
  --body "Release commit for $VERSION. Tags will be created and pushed after merge via \`tag-release.sh\`."

echo ""
echo "Next steps:"
echo "  1. Merge the PR opened above"
echo "  2. git checkout main && git pull"
echo "  3. ./tag-release.sh $NEW_VERSION"
