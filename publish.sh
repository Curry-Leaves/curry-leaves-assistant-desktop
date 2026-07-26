#!/usr/bin/env bash
#
# Publish a cross-platform release of the Curry Leaves desktop app.
#
# Unlike the web UI (an npm library the backend installs), this repo is an
# Electron *end-user app*. Its distributables are the per-OS installers that
# `electron-forge make` produces (macOS .zip, Windows .exe, Linux .deb/.rpm) —
# a release is a GitHub Release with those attached, not `npm publish`.
#
# Electron installers can't be cross-compiled, so the actual building for all
# three OSes happens in CI: .github/workflows/release.yml runs a macOS + Windows
# + Linux matrix on tag push and uploads each platform's artifacts to the Release.
#
# This script drives that: it validates, creates the GitHub Release, then pushes
# the v<version> tag which triggers the CI matrix to attach the binaries.
#
#   - refuse to release from a dirty working tree,
#   - refuse if the CHANGELOG has no entry for this version,
#   - refuse if a GitHub Release for this tag already exists,
#   - create the (empty) GitHub Release with notes from the CHANGELOG,
#   - tag v<version> and push it → CI builds every OS and uploads artifacts.
#
# Requires the GitHub CLI (`gh`), authenticated: https://cli.github.com
#
# Usage:
#   ./publish.sh            # create the release + push the tag; CI builds all OSes
#   ./publish.sh --dry-run  # validate only; don't tag, push, or create a release
#   ./publish.sh --local    # build on THIS machine (macOS only) and upload locally,
#                            #   instead of relying on CI. Ships only this host's arch(es).
#
set -euo pipefail

cd "$(dirname "$0")"

MODE="ci"
case "${1:-}" in
  --dry-run) MODE="dry" ;;
  --local)   MODE="local" ;;
  "")        MODE="ci" ;;
  *) echo "usage: $0 [--dry-run | --local]" >&2; exit 2 ;;
esac

NAME="$(node -p "require('./package.json').name")"
VERSION="$(node -p "require('./package.json').version")"
TAG="v${VERSION}"

echo "==> ${NAME}@${VERSION} (mode: ${MODE})"

# 0. Tools we need.
if [[ "$MODE" != "dry" ]] && ! command -v gh >/dev/null 2>&1; then
  echo "error: GitHub CLI (gh) not found. Install it from https://cli.github.com and run 'gh auth login'." >&2
  exit 1
fi

# 1. Clean working tree — never release something that isn't committed.
if [[ -n "$(git status --porcelain)" ]]; then
  echo "error: working tree is dirty. Commit or stash before releasing." >&2
  git status --short >&2
  exit 1
fi

# 2. Make sure the CHANGELOG mentions this version (cheap guard against forgetting to stamp it).
if ! grep -q "\[${VERSION}\]" CHANGELOG.md; then
  echo "error: CHANGELOG.md has no entry for [${VERSION}]. Stamp it before releasing." >&2
  exit 1
fi

# 3. Don't clobber an existing release for this tag.
if [[ "$MODE" != "dry" ]] && gh release view "${TAG}" >/dev/null 2>&1; then
  echo "error: a GitHub Release for ${TAG} already exists. Bump the version first." >&2
  exit 1
fi

# Release notes: the CHANGELOG section for this version.
NOTES_FILE="$(mktemp)"
trap 'rm -f "$NOTES_FILE"' EXIT
awk -v ver="[${VERSION}]" '
  $0 ~ "^## " && index($0, ver) {grab=1; next}
  grab && /^## / {exit}
  grab {print}
' CHANGELOG.md > "$NOTES_FILE"
if [[ ! -s "$NOTES_FILE" ]]; then
  echo "See CHANGELOG.md for details." > "$NOTES_FILE"
fi

# ── --local: build here and upload this host's artifacts (macOS only) ──────────
if [[ "$MODE" == "local" ]]; then
  echo "==> local build (npm run make) — ships only this machine's arch(es)"
  npm run make
  ARTIFACTS=()
  # `find`, not a `**` glob — macOS ships bash 3.2, which has no globstar.
  while IFS= read -r f; do ARTIFACTS+=("$f"); done < <(
    find out/make -type f \( -name '*.zip' -o -name '*.exe' -o -name '*.nupkg' -o -name '*.deb' -o -name '*.rpm' \)
  )
  if [[ ${#ARTIFACTS[@]} -eq 0 ]]; then
    echo "error: no artifacts found under out/make. Did 'npm run make' succeed?" >&2
    exit 1
  fi
  echo "==> built ${#ARTIFACTS[@]} artifact(s):"
  printf '    %s\n' "${ARTIFACTS[@]}"

  if ! git rev-parse -q --verify "refs/tags/${TAG}" >/dev/null; then
    git tag -a "${TAG}" -m "${NAME} ${TAG}"
  fi
  git push origin "${TAG}"
  echo "==> gh release create ${TAG} (local artifacts)"
  gh release create "${TAG}" --title "${TAG}" --notes-file "$NOTES_FILE" "${ARTIFACTS[@]}"
  echo "==> Released (local) ${NAME}@${VERSION}."
  echo "    https://github.com/Curry-Leaves/curry-leaves-assistant-desktop/releases/tag/${TAG}"
  exit 0
fi

# ── --dry-run: validate + show the notes, change nothing ──────────────────────
if [[ "$MODE" == "dry" ]]; then
  echo "==> dry run: would create release ${TAG} with these notes:"
  sed 's/^/    /' "$NOTES_FILE"
  echo "==> dry run complete. Nothing was tagged, pushed, or released."
  exit 0
fi

# ── ci (default): push the tag, create the release, let CI attach binaries ─────
# Push the tag FIRST — that push event triggers the release build matrix. Then
# create the Release against the now-existing tag (CI appends assets to it).
echo "==> git tag ${TAG} && push (triggers the release build matrix)"
if ! git rev-parse -q --verify "refs/tags/${TAG}" >/dev/null; then
  git tag -a "${TAG}" -m "${NAME} ${TAG}"
fi
git push origin "${TAG}"

echo "==> gh release create ${TAG}"
gh release create "${TAG}" --title "${TAG}" --notes-file "$NOTES_FILE"

echo "==> Release ${TAG} created; CI is building macOS + Windows + Linux artifacts."
echo "    Track it:   https://github.com/Curry-Leaves/curry-leaves-assistant-desktop/actions"
echo "    Release:    https://github.com/Curry-Leaves/curry-leaves-assistant-desktop/releases/tag/${TAG}"
