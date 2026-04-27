#!/usr/bin/env bash
set -euo pipefail

NEW_VERSION="${1:-}"
if [ -z "$NEW_VERSION" ]; then
  echo "Usage: $0 <version>" >&2
  echo "Example: $0 1.3.0" >&2
  exit 1
fi

VERSION="v$NEW_VERSION"
MAJOR_VERSION="v$(echo "$NEW_VERSION" | cut -d. -f1)"

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

PACKAGE_VERSION=$(grep '"version"' package.json | cut -d '"' -f 4)
if [ "$PACKAGE_VERSION" != "$NEW_VERSION" ]; then
  echo "package.json reports version $PACKAGE_VERSION but expected $NEW_VERSION" >&2
  echo "Did you merge the PR opened by update-version.sh and pull main?" >&2
  exit 1
fi

# Create fixed tag, force-move major moving tag
git tag -a "$VERSION" -m "Version $VERSION"
git tag -f -a "$MAJOR_VERSION" -m "Version $MAJOR_VERSION"

# Push
git push origin "$VERSION"
git push origin "$MAJOR_VERSION" --force

echo ""
echo "Tags published:"
echo "  $VERSION       -> $(git rev-parse "$VERSION^{}")"
echo "  $MAJOR_VERSION         -> $(git rev-parse "$MAJOR_VERSION^{}")"
echo ""
echo "Optional final step — create a GitHub Release:"
echo "  gh release create $VERSION --title \"$VERSION\" --notes \"...\""
