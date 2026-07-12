#!/usr/bin/env bash
# Production build & deploy script for e-learning-backend.
# Run on the target server (Linux) from repo root: bash scripts/deploy.sh
set -euo pipefail

REQUIRED_NODE_MAJOR=20
APP_NAME="e-learning-backend"
BRANCH="${DEPLOY_BRANCH:-main}"

log() { echo -e "\n\033[1;34m[deploy]\033[0m $1"; }
die() { echo -e "\033[1;31m[deploy][error]\033[0m $1" >&2; exit 1; }

# 1. Preconditions
command -v node >/dev/null || die "node not found"
command -v npm >/dev/null || die "npm not found"
NODE_MAJOR="$(node -v | sed 's/^v//' | cut -d. -f1)"
[ "$NODE_MAJOR" -ge "$REQUIRED_NODE_MAJOR" ] || die "node >=$REQUIRED_NODE_MAJOR required, found v$NODE_MAJOR"
[ -f ".env.production" ] || die ".env.production missing — fill it before deploying"

# 2. Sync source (skip if deploying from a pre-checked-out CI workspace)
if [ "${SKIP_GIT_PULL:-false}" != "true" ]; then
  log "fetching branch $BRANCH"
  git fetch origin "$BRANCH"
  git checkout "$BRANCH"
  git reset --hard "origin/$BRANCH"
fi

# 3. Install exact deps from lockfile
log "installing dependencies (npm ci)"
npm ci

# 4. Static checks — fail fast before touching the running process
log "lint"
npm run lint
log "type-check"
npm run type-check
log "tests"
npm test

# 5. Compile TypeScript -> dist/
log "building"
rm -rf dist
npm run build
[ -f "dist/server.js" ] || die "build did not produce dist/server.js"

# 6. Validate required env vars are actually set (fails loudly, not at runtime)
log "validating .env.production"
NODE_ENV=production node -e "require('dotenv').config({path:'.env.production'}); require('./dist/config/env.js');" \
  || die "env validation failed — check .env.production"

# 7. Prune dev dependencies for a leaner prod install
log "pruning dev dependencies"
npm prune --omit=dev

# 8. Ensure upload dir exists (multer writes here)
UPLOAD_DIR="$(grep -E '^UPLOAD_DIR=' .env.production | cut -d= -f2- || echo uploads)"
mkdir -p "$UPLOAD_DIR"

# 9. Restart via PM2 (zero-downtime reload if already running)
if command -v pm2 >/dev/null; then
  log "reloading pm2 process $APP_NAME"
  pm2 startOrReload ecosystem.config.js --env production
  pm2 save
else
  die "pm2 not found — install with 'npm i -g pm2' or replace step 9 with your process manager"
fi

log "deploy complete"
