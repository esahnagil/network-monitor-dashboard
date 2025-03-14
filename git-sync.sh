#!/bin/bash

# Git Sync Script
# This script automatically syncs changes to GitHub repository

# Set email and name for commits if not already set
git config --global --get user.email > /dev/null || git config --global user.email "replit@example.com"
git config --global --get user.name > /dev/null || git config --global user.name "Replit User"

# Get commit message from parameter or use default
COMMIT_MESSAGE=${1:-"Update project files"}

# Stage all changes
git add .

# Check if there are any changes to commit
if git diff --staged --quiet; then
  echo "No changes to commit."
  exit 0
fi

# Commit changes
git commit -m "$COMMIT_MESSAGE"

# Push to GitHub
git push origin main

echo "Changes successfully pushed to GitHub."