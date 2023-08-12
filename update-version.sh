VERSION_NUMBER=$(grep '"version"' package.json | cut -d '"' -f 4)
MAJOR_VERSION_NUMBER=$(echo "$VERSION_NUMBER" | cut -d '.' -f 1)
VERSION=$(echo "v$VERSION_NUMBER")
MAJOR_VERSION=$(echo "v$MAJOR_VERSION_NUMBER")

# Prepare code to upload
npm run prepare
git add .
git commit -m "Version $VERSION"
git push origin main

# Create or update a Git tag with the version number
git tag -f -a "$VERSION" -m "Version $VERSION"

# Check if the major tag already exists
if git rev-parse "$MAJOR_VERSION" >/dev/null 2>&1; then
  # Update the existing major tag
  git tag -f -a "$MAJOR_VERSION" -m "Version $MAJOR_VERSION"
else
  # Create a new tag
  git tag -a "$MAJOR_VERSION" -m "Version $MAJOR_VERSION"
fi

# Push the Git tags to GitHub
git push origin "$VERSION" --force
git push origin "$MAJOR_VERSION" --force
