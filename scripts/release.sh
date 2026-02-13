#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# ── Parse args ──────────────────────────────────────────────
BUMP="patch"
for arg in "$@"; do
  case "$arg" in
    --major) BUMP="major" ;;
    --minor) BUMP="minor" ;;
    --help|-h)
      echo "Usage: ./scripts/release.sh [--major|--minor]"
      echo "  (no flag)  → bump patch  (0.1.0 → 0.1.1)"
      echo "  --minor    → bump minor  (0.1.1 → 0.2.0)"
      echo "  --major    → bump major  (0.2.0 → 1.0.0)"
      exit 0
      ;;
    *) echo "Unknown arg: $arg"; exit 1 ;;
  esac
done

# ── Load .env ───────────────────────────────────────────────
if [ -f "$ROOT/.env" ]; then
  set -a; source "$ROOT/.env"; set +a
else
  echo "ERROR: .env file not found"; exit 1
fi

# ── Validate signing keys ────────────────────────────────────
if [ -z "${TAURI_SIGNING_PRIVATE_KEY:-}" ]; then
  if [ -f "$ROOT/.secrets/private.key" ]; then
    TAURI_SIGNING_PRIVATE_KEY=$(cat "$ROOT/.secrets/private.key")
  else
    echo "ERROR: TAURI_SIGNING_PRIVATE_KEY not set and .secrets/private.key not found"; exit 1
  fi
fi
export TAURI_SIGNING_PRIVATE_KEY
export TAURI_SIGNING_PRIVATE_KEY_PASSWORD="${TAURI_SIGNING_PRIVATE_KEY_PASSWORD:-}"

# ── Read current version ────────────────────────────────────
CURRENT=$(grep '"version"' "$ROOT/package.json" | head -1 | sed 's/.*"\([0-9]*\.[0-9]*\.[0-9]*\)".*/\1/')
IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT"

echo "Current version: $CURRENT"

# ── Bump ────────────────────────────────────────────────────
case "$BUMP" in
  major) MAJOR=$((MAJOR + 1)); MINOR=0; PATCH=0 ;;
  minor) MINOR=$((MINOR + 1)); PATCH=0 ;;
  patch) PATCH=$((PATCH + 1)) ;;
esac
VERSION="$MAJOR.$MINOR.$PATCH"
echo "New version:     $VERSION ($BUMP bump)"

# ── Update version in all config files ──────────────────────
# package.json
sed -i '' "s/\"version\": \"$CURRENT\"/\"version\": \"$VERSION\"/" "$ROOT/package.json"

# tauri.conf.json
sed -i '' "s/\"version\": \"$CURRENT\"/\"version\": \"$VERSION\"/" "$ROOT/src-tauri/tauri.conf.json"

# Cargo.toml
sed -i '' "s/^version = \"$CURRENT\"/version = \"$VERSION\"/" "$ROOT/src-tauri/Cargo.toml"

echo "Updated package.json, tauri.conf.json, Cargo.toml → $VERSION"

# ── Ensure clean working tree (except version bumps) ────────
if ! git diff --quiet -- ':!package.json' ':!src-tauri/tauri.conf.json' ':!src-tauri/Cargo.toml' ':!src-tauri/Cargo.lock' 2>/dev/null; then
  echo "WARNING: uncommitted changes outside version files"
  git status --short
  read -rp "Continue anyway? [y/N] " yn
  [[ "$yn" =~ ^[Yy]$ ]] || exit 1
fi

# ── Build ───────────────────────────────────────────────────
echo ""
echo "Building v$VERSION..."

export APPLE_SIGNING_IDENTITY="${APPLE_SIGNING_IDENTITY:?Missing APPLE_SIGNING_IDENTITY in .env}"
export APPLE_ID="${APPLE_ID:?Missing APPLE_ID in .env}"
export APPLE_PASSWORD="${APPLE_APP_SPECIFIC_PASSWORD:?Missing APPLE_APP_SPECIFIC_PASSWORD in .env}"
export APPLE_TEAM_ID="${APPLE_TEAM_ID:?Missing APPLE_TEAM_ID in .env}"

pnpm tauri build

DMG="$ROOT/src-tauri/target/release/bundle/dmg/2FA Auth_${VERSION}_aarch64.dmg"
APP="$ROOT/src-tauri/target/release/bundle/macos/2FA Auth.app"

if [ ! -f "$DMG" ]; then
  echo "ERROR: DMG not found at $DMG"; exit 1
fi

echo "Build complete: $DMG"

# ── Locate updater artifacts ─────────────────────────────────
BUNDLE_DIR="$ROOT/src-tauri/target/release/bundle/macos"
TARGZ="$BUNDLE_DIR/2FA Auth.app.tar.gz"
TARGSIG="$BUNDLE_DIR/2FA Auth.app.tar.gz.sig"

if [ ! -f "$TARGZ" ]; then
  echo "ERROR: Updater tar.gz not found at $TARGZ"; exit 1
fi
if [ ! -f "$TARGSIG" ]; then
  echo "ERROR: Updater signature not found at $TARGSIG"; exit 1
fi

TARGZ_SAFE="$BUNDLE_DIR/2FA-Auth.app.tar.gz"
cp "$TARGZ" "$TARGZ_SAFE"
cp "$TARGSIG" "${TARGZ_SAFE}.sig"
echo "Updater artifacts ready"

# ── Verify signature ────────────────────────────────────────
echo ""
echo "Verifying code signature..."
codesign --verify --deep "$APP" 2>&1
spctl --assess --verbose=4 --type execute "$APP" 2>&1
echo "Signature valid"

# ── Generate updater manifest ────────────────────────────────
echo ""
echo "Generating latest.json..."
SIGNATURE=$(cat "$TARGSIG")
PUB_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

cat > "$ROOT/latest.json" <<MANIFEST
{
  "version": "$VERSION",
  "notes": "Release v$VERSION",
  "pub_date": "$PUB_DATE",
  "platforms": {
    "darwin-aarch64": {
      "signature": "$SIGNATURE",
      "url": "https://github.com/kmhari/2fa-desktop-app/releases/download/v$VERSION/2FA-Auth.app.tar.gz"
    }
  }
}
MANIFEST
echo "Generated latest.json"

# ── Git commit + tag ────────────────────────────────────────
echo ""
echo "Committing version bump..."
git add package.json src-tauri/tauri.conf.json src-tauri/Cargo.toml src-tauri/Cargo.lock
git commit -m "$(cat <<EOF
release: v$VERSION
EOF
)"

TAG="v$VERSION"
git tag -a "$TAG" -m "Release $TAG"
echo "Tagged $TAG"

# ── Push to GitHub ──────────────────────────────────────────
echo ""
echo "Pushing to GitHub..."
git push origin main --tags

# ── Create GitHub Release with DMG ──────────────────────────
echo ""
echo "Creating GitHub release..."
gh release create "$TAG" \
  "$DMG" \
  "$TARGZ_SAFE" \
  "${TARGZ_SAFE}.sig" \
  "$ROOT/latest.json" \
  --title "2FA Auth $TAG" \
  --notes "$(cat <<EOF
## 2FA Auth $TAG

### Download
- **macOS (Apple Silicon):** \`2FA Auth_${VERSION}_aarch64.dmg\`

### Auto-Update
Existing installations will be notified automatically.

Signed with Developer ID and notarized by Apple.
EOF
)" \
  --latest

# ── Cleanup ──────────────────────────────────────────────────
rm -f "$ROOT/latest.json"
rm -f "$TARGZ_SAFE"
rm -f "${TARGZ_SAFE}.sig"

echo ""
echo "✓ Released v$VERSION"
echo "  https://github.com/kmhari/2fa-desktop-app/releases/tag/$TAG"
