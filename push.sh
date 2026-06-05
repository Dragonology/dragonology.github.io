#!/usr/bin/env bash
set -euo pipefail

# Usage: ./push.sh "Your commit message"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$REPO_ROOT"

REMOTE="${GIT_REMOTE:-origin}"
BRANCH="${GIT_BRANCH:-main}"
MESSAGE="${1:-Update site.}"

if [[ "$MESSAGE" == "-h" || "$MESSAGE" == "--help" ]]; then
  echo "Usage: ./push.sh \"Commit message\""
  echo ""
  echo "Stages all changes, commits, and pushes."
  exit 0
fi

if git diff --quiet && git diff --cached --quiet && [[ -z "$(git ls-files --others --exclude-standard)" ]]; then
  echo "Nothing to commit. Pushing existing commits..."
  git push "$REMOTE" "$BRANCH"
  exit 0
fi

git add -A
git commit -m "$MESSAGE"
git push "$REMOTE" "$BRANCH"
echo "Done: https://dragonology.github.io"
