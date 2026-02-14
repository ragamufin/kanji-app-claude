Commit staged and unstaged changes to git:

1. Run these commands in parallel to understand the current state:
   - `git status` to see all changed/untracked files
   - `git diff` to see unstaged changes
   - `git diff --cached` to see staged changes
   - `git log --oneline -5` to see recent commit message style

2. Analyze all changes and draft a commit message:
   - Summarize the nature of changes (new feature, enhancement, bug fix, refactor, test, docs, etc.)
   - Use imperative mood ("Add feature" not "Added feature")
   - Keep first line under 72 characters
   - Follow the repository's existing commit message style
   - Do not commit files that likely contain secrets (.env, credentials, etc.)

3. Stage and commit:
   - Stage relevant changed files (prefer specific files over `git add -A`)
   - Run `git status` after commit to verify success

4. If commit fails due to pre-commit hooks:
   - Fix the issues
   - Create a NEW commit (do not amend)

Important:
- Do NOT push to remote unless explicitly requested
- Do NOT amend existing commits unless explicitly requested
- Use HEREDOC format for multi-line commit messages
