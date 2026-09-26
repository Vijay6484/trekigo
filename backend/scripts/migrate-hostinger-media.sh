#!/usr/bin/env bash
set -euo pipefail

# Download all public image URLs from DB and save to api.nirwanastays.com/storage
cd "$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
npm run migrate:media "$@"
