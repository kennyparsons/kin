# CI/CD Setup Guide

This project uses automated CI/CD pipelines for build validation, semantic versioning, and deployment.

## Overview

### 1. PR Check Pipeline (`pr-check.yml`)
- **Trigger:** When a PR is opened, updated, or reopened against `main`
- **Purpose:** Validate builds before allowing merge
- **Actions:**
  - Install dependencies for web and API
  - Build web application
  - Run TypeScript type checking for both web and API
  - Comment on PR with success/failure status

### 2. Release Please & Deploy Pipeline (`release-please.yml`)
- **Trigger:** When code is pushed to `main` (PR merges)
- **Purpose:** Automated versioning and deployment
- **Actions:**
  - Release Please analyzes conventional commits
  - Creates/updates a release PR with version bump and CHANGELOG
  - When release PR is merged, deploys to Cloudflare
  - Updates version number dynamically during build

## How It Works

### Workflow

1. **Developer creates feature branch**
   ```bash
   git checkout -b feat/new-feature
   ```

2. **Make changes with conventional commits**
   ```bash
   git commit -m "feat: add new feature"
   git commit -m "fix: resolve bug in component"
   ```

3. **Open PR to main**
   - PR Check workflow runs automatically
   - Must pass before merge is allowed

4. **Merge PR**
   - Release Please analyzes commits
   - Creates a release PR with:
     - Version bump (based on feat/fix/breaking changes)
     - Updated CHANGELOG
     - Updated package.json versions

5. **Merge Release PR**
   - Creates GitHub release with tag
   - Deploys to Cloudflare with new version
   - Version number injected into build

## Conventional Commit Format

Release Please uses conventional commits to determine version bumps:

- `feat:` → Minor version bump (1.0.0 → 1.1.0)
- `fix:` → Patch version bump (1.0.0 → 1.0.1)
- `feat!:` or `BREAKING CHANGE:` → Major version bump (1.0.0 → 2.0.0)
- `chore:`, `docs:`, `style:`, `refactor:`, `test:` → No version bump

### Examples

```bash
# Minor version bump
git commit -m "feat: add mass email BCC functionality"

# Patch version bump
git commit -m "fix: resolve modal line break rendering"

# Major version bump
git commit -m "feat!: redesign authentication system

BREAKING CHANGE: old auth tokens will no longer work"

# No version bump
git commit -m "chore: update dependencies"
git commit -m "docs: improve README"
```

## GitHub Setup Required

### 1. Branch Protection Rules

Go to: `Settings → Branches → Add rule` for `main`

Enable:
- ✅ Require a pull request before merging
- ✅ Require status checks to pass before merging
  - Add required check: `Build Validation`
- ✅ Require conversation resolution before merging
- ✅ Do not allow bypassing the above settings

### 2. GitHub Secrets

Go to: `Settings → Secrets and variables → Actions → New repository secret`

Required secrets:
- `CLOUDFLARE_API_TOKEN` - Your Cloudflare API token
- `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID

#### How to get Cloudflare credentials:

1. **API Token:**
   - Go to: https://dash.cloudflare.com/profile/api-tokens
   - Click "Create Token"
   - Use template "Edit Cloudflare Workers" or create custom token with:
     - Account: Cloudflare Workers Scripts: Edit
     - Account: Cloudflare Pages: Edit
     - Account: D1: Edit

2. **Account ID:**
   - Go to: https://dash.cloudflare.com
   - Select your account
   - Copy "Account ID" from the sidebar

### 3. Workflow Permissions

Go to: `Settings → Actions → General → Workflow permissions`

Select:
- ✅ Read and write permissions
- ✅ Allow GitHub Actions to create and approve pull requests

## Version Management

### Current Version
The current version is tracked in:
- `.release-please-manifest.json` - Source of truth
- `web/package.json` - Synced by Release Please
- `web/src/version.ts` - Injected during deployment

### Manual Version Update
If you need to manually adjust the version:

1. Update `.release-please-manifest.json`:
   ```json
   {
     ".": "2.0.0"
   }
   ```

2. Commit and push to main
3. Release Please will use this as the base version

## Testing the Pipeline

### Test PR Check
```bash
git checkout -b test/pr-check
git commit --allow-empty -m "test: validate PR check workflow"
git push origin test/pr-check
# Open PR on GitHub and watch the check run
```

### Test Release Please
```bash
git checkout main
git pull origin main
git commit --allow-empty -m "feat: test release please workflow"
git push origin main
# Watch for Release Please to create a PR
```

## Troubleshooting

### Build fails in PR check
- Check the workflow logs in the Actions tab
- Ensure TypeScript has no errors: `(cd web && npx tsc --noEmit)`
- Ensure build succeeds: `(cd web && npm run build)`

### Release Please doesn't create PR
- Ensure commits follow conventional commit format
- Check that commits have been pushed to `main`
- Verify workflow permissions are set correctly
- Check Actions tab for error logs

### Deployment fails
- Verify Cloudflare secrets are set correctly
- Check that Cloudflare API token has correct permissions
- Review deployment logs in Actions tab

## Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Release Please Documentation](https://github.com/googleapis/release-please)
- [Cloudflare Wrangler Action](https://github.com/cloudflare/wrangler-action)
