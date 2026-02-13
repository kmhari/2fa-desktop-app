# 2FA Auth

A native macOS desktop client for [2FAuth](https://docs.2fauth.app/) — access your two-factor authentication codes without opening a browser.

## Features

- **OTP codes at a glance** — View all your TOTP/HOTP codes with live countdown timers
- **Menu bar tray popup** — Quick-access codes from the menu bar without switching windows
- **Click to copy** — Click any account row to copy the code instantly
- **Keyboard navigation** — Arrow keys to browse, Enter to copy, `Cmd+F` to search
- **QR code scanning** — Add accounts by scanning QR codes from your screen, uploading images, or pasting URIs
- **Encrypted storage** — Server credentials stored locally with AES-256-GCM encryption
- **Auto-updates** — In-app update notifications with signed releases

## Prerequisites

You need a running [2FAuth](https://docs.2fauth.app/) instance. 2FAuth is a self-hosted web app for managing your 2FA accounts — this desktop client connects to it via its API.

## Install

Download the latest `.dmg` from [Releases](https://github.com/kmhari/2fa-desktop-app/releases/latest).

> macOS Apple Silicon · Signed & notarized by Apple

## Setup

1. Open the app and click **Get Started**
2. Enter your 2FAuth server URL (e.g. `https://2fauth.example.com`)
3. Enter a [Personal Access Token](https://docs.2fauth.app/api/overview/#authentication) from your 2FAuth instance
4. Click **Test Connection**, then **Save & Continue**

## Tech Stack

| Layer | Tech |
|-------|------|
| Shell | [Tauri v2](https://v2.tauri.app/) (Rust) |
| Frontend | React 19, TypeScript, Tailwind CSS v4 |
| State | Zustand |
| UI | Radix UI, Lucide icons |
| Crypto | AES-256-GCM (aes-gcm crate) |
| QR Decode | rqrr + macOS screen capture APIs |

## Development

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm tauri dev

# Build for production
pnpm tauri build
```

### Environment Variables

Create a `.env` file in the project root for release builds:

```
APPLE_APP_SPECIFIC_PASSWORD=<your-apple-app-specific-password>
APPLE_SIGNING_IDENTITY=<your-signing-identity>
APPLE_ID=<your-apple-id>
APPLE_TEAM_ID=<your-team-id>
TAURI_SIGNING_PRIVATE_KEY=<base64-encoded-private-key>
TAURI_SIGNING_PRIVATE_KEY_PASSWORD=<key-password>
```

### Release

```bash
./scripts/release.sh           # patch bump (0.1.0 → 0.1.1)
./scripts/release.sh --minor   # minor bump (0.1.1 → 0.2.0)
./scripts/release.sh --major   # major bump (0.2.0 → 1.0.0)
```

## License

MIT
