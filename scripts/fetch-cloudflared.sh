#!/usr/bin/env bash
# Download cloudflared into a destination directory.
# Usage: fetch-cloudflared.sh [DEST_DIR]
# Default DEST_DIR: <repo>/bin
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="${1:-$ROOT/bin}"
mkdir -p "$DEST"

OS="$(uname -s)"
ARCH="$(uname -m)"
ASSET=""
EXTRACT="tgz"

case "$OS" in
  Darwin)
    case "$ARCH" in
      arm64|aarch64) ASSET="cloudflared-darwin-arm64.tgz" ;;
      x86_64) ASSET="cloudflared-darwin-amd64.tgz" ;;
    esac
    ;;
  Linux)
    EXTRACT="bin"
    case "$ARCH" in
      x86_64) ASSET="cloudflared-linux-amd64" ;;
      arm64|aarch64) ASSET="cloudflared-linux-arm64" ;;
    esac
    ;;
esac

if [[ -z "$ASSET" ]]; then
  echo "Unsupported platform: $OS $ARCH (install cloudflared via brew / package manager instead)" >&2
  exit 1
fi

echo "Downloading $ASSET → $DEST …"
TMP="$(mktemp -t cloudflared.XXXXXX)"
curl -fsSL "https://github.com/cloudflare/cloudflared/releases/latest/download/$ASSET" -o "$TMP"

if [[ "$EXTRACT" == "tgz" ]]; then
  tar -xzf "$TMP" -C "$DEST"
  rm -f "$TMP"
else
  mv "$TMP" "$DEST/cloudflared"
fi

if [[ ! -f "$DEST/cloudflared" ]]; then
  echo "Fetch failed: expected $DEST/cloudflared after extract" >&2
  ls -la "$DEST" >&2 || true
  exit 1
fi

chmod +x "$DEST/cloudflared"
xattr -cr "$DEST/cloudflared" 2>/dev/null || true
"$DEST/cloudflared" --version
echo "Installed $DEST/cloudflared"
