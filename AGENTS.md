# Git & Commit Rules

## Commit Policy
- **User Approval**: Never commit or push changes unless explicitly instructed by the user.
- **Verification**: Always run `git status` and `git diff` before creating a commit to ensure only intended changes are staged.
- **Clean History**: Do not commit build artifacts, temporary files, environment variables, or sensitive credentials (e.g., API keys, `.env` files).

## Commit Message Standards
Follow the **Conventional Commits** specification:

```
<type>(<optional scope>): <description>

[optional body]

[optional footer(s)]
```

### Allowed Types
- `feat`: A new feature or capability
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Formatting changes that do not affect code logic (white-space, formatting, semicolons)
- `refactor`: Code changes that neither fix a bug nor add a feature
- `perf`: Performance improvement
- `test`: Adding missing tests or correcting existing tests
- `chore`: Maintenance tasks, dependency updates, or build tooling changes

### Formatting Guidelines
- **Subject line**:
  - Use the imperative mood ("add", not "added" or "adds").
  - Do not capitalize the first letter of the description.
  - Do not end the subject line with a period.
  - Keep within 50–72 characters.
- **Body** (when needed):
  - Separate from the subject line with a blank line.
  - Explain the *what* and *why*, not the *how*.
  - Wrap lines at 72 characters.
- **Footers**:
  - Reference relevant issues or breaking changes (`BREAKING CHANGE: ...` or `Closes #123`).

---

# UI Maintenance Rules

## Skeleton Sync — Keep Skeletons in Lockstep with Real Artifacts

`web/components/artifacts/artifact-skeleton.tsx` contains five layout-matched
skeleton loading states (one per artifact type). Each skeleton's shimmer blocks
are hand-tuned to mirror the grid, flex geometry, and proportions of its live
counterpart.

**Rule:** Any time you change the layout or structure of an artifact component,
you MUST update the corresponding skeleton variant to match. Failing to do so
will cause layout shift when the real content loads in.

Artifacts and their skeletons:

| Artifact file | Skeleton function |
|---|---|
| `artwork-info-card.tsx` | `InfoSkeleton` in `artifact-skeleton.tsx` |
| `gallery-map-view.tsx` | `MapSkeleton` in `artifact-skeleton.tsx` |
| `comparison-view.tsx` | `ComparisonSkeleton` in `artifact-skeleton.tsx` |
| `timeline-view.tsx` | `TimelineSkeleton` in `artifact-skeleton.tsx` |
| `detail-hotspots-view.tsx` | `HotspotsSkeleton` in `artifact-skeleton.tsx` |
| `chat-history-view.tsx` | `ChatSkeleton` in `artifact-skeleton.tsx` |

**How to test:** Start the tour, then click the **"skeleton"** dev toggle button
in the footer. Switch tabs to see each skeleton. Compare side-by-side with the
real artifact to confirm geometry matches.
