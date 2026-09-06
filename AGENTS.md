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
