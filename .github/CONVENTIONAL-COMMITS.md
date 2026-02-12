# Conventional Commits Quick Reference

## Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

## Types

| Type | Version Bump | Description | Example |
|------|--------------|-------------|---------|
| `feat` | Minor (1.x.0) | New feature | `feat: add mass email button` |
| `fix` | Patch (1.0.x) | Bug fix | `fix: resolve modal rendering issue` |
| `perf` | Patch (1.0.x) | Performance improvement | `perf: optimize database queries` |
| `refactor` | None* | Code refactoring | `refactor: simplify email logic` |
| `docs` | None | Documentation only | `docs: update API documentation` |
| `style` | None | Formatting, white-space | `style: format with prettier` |
| `test` | None | Adding/updating tests | `test: add campaign tests` |
| `chore` | None | Maintenance tasks | `chore: update dependencies` |
| `build` | None | Build system changes | `build: update webpack config` |
| `ci` | None | CI/CD changes | `ci: add PR check workflow` |
| `revert` | Patch (1.0.x) | Revert previous commit | `revert: feat: add mass email` |

*Appears in changelog but doesn't trigger release by default

## Breaking Changes

Add `!` after type or include `BREAKING CHANGE:` in footer → Major version bump (x.0.0)

```bash
# Method 1: Exclamation mark
git commit -m "feat!: redesign authentication system"

# Method 2: Footer
git commit -m "feat: redesign authentication

BREAKING CHANGE: old auth tokens will no longer work"
```

## Examples

### Feature Addition
```bash
git commit -m "feat: add confirmation modal for unsaved changes"
```

### Bug Fix
```bash
git commit -m "fix: prevent {name} variables in mass BCC emails"
```

### Feature with Scope
```bash
git commit -m "feat(campaigns): add mass email BCC functionality"
```

### Multi-line with Body
```bash
git commit -m "feat: add version display to sidebar

The version number is now displayed at the bottom of the sidebar.
It is automatically updated during CI/CD deployment via Release Please."
```

### Breaking Change
```bash
git commit -m "feat!: migrate to new database schema

BREAKING CHANGE: requires running migrations and data will be reset"
```

### Multiple Changes
```bash
# Separate commits for each logical change
git commit -m "feat: add ConfirmationModal component"
git commit -m "feat: integrate modal into campaign page"
git commit -m "fix: handle empty recipient list"
```

## Tips

1. **Use imperative mood** - "add" not "added" or "adds"
2. **Lowercase subject** - Start with lowercase letter
3. **No period at end** - Don't end subject line with period
4. **Limit subject to 72 characters**
5. **Separate subject from body** with blank line
6. **Explain what and why** - Not how (code shows how)

## Good Examples ✅

```bash
feat: add mass email BCC button
fix: resolve line break rendering in modals
docs: add CI/CD setup guide
chore: update wrangler to v4
refactor: extract email logic to separate function
test: add unit tests for email validation
```

## Bad Examples ❌

```bash
Added stuff                          # No type, vague
fix: Fixed the bug.                  # Past tense, period
FEAT: Add feature                    # Uppercase type
feature: new email thing             # Wrong type
git commit -m "misc changes"         # Not descriptive
```

## Workflow

```bash
# 1. Create feature branch
git checkout -b feat/mass-email

# 2. Make changes
# ... edit files ...

# 3. Stage changes
git add .

# 4. Commit with conventional format
git commit -m "feat: add mass email BCC functionality"

# 5. Push and open PR
git push origin feat/mass-email

# 6. After PR approval, merge to main
# Release Please will handle versioning automatically
```

## Resources

- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [Angular Commit Guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit)
