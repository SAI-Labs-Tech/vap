#!/usr/bin/env bash
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

if [[ "$(git branch --show-current)" != "main" ]]; then
  echo "checkout main first (full tree, including docs)" >&2
  exit 1
fi

git push guard main

git checkout github-public
git merge --no-edit main
if git ls-files --error-unmatch docs >/dev/null 2>&1; then
  git rm -r docs
fi
if ! grep -q '^docs/$' .gitignore; then
  printf '\n# Docs site is published from GitLab, not GitHub\ndocs/\n' >> .gitignore
  git add .gitignore
fi
if ! git diff --cached --quiet || ! git diff --quiet; then
  git commit -m "Omit the docs site from the public GitHub tree"
fi
git push origin github-public:main
git checkout main
