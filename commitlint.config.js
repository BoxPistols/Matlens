// Commit message linter — enforces the Conventional Commits spec so the
// git log stays machine-parseable (for changelogs, semantic-release, etc.).
//
// Run via the husky commit-msg hook, which invokes
// `pnpm commitlint --edit $1`.
//
// Format:   <type>(<optional scope>): <subject>
// Examples: feat(ai): add Gemini streaming
//           fix(search): guard against empty db
//           chore: bump dependencies
//
// Allowed commit types match the @commitlint/config-conventional default
// preset so existing tooling (Dependabot, commitizen, semantic-release)
// works without further config. Scopes are intentionally NOT constrained
// here — Matlens-specific areas like `rag`, `maiml`, `a11y`, `ai`, `ui`
// are fine to use but are enforced only by convention, not by lint.
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert',
      ],
    ],
    // Subject must not end with a period, match Conventional Commits.
    'subject-full-stop': [2, 'never', '.'],
    // Allow slightly longer subjects than the default 72 — Japanese
    // descriptions naturally run longer due to katakana width.
    'header-max-length': [2, 'always', 100],
    // Body lines may be long (logs, URLs). Skip the default 100-char body cap.
    'body-max-line-length': [0],
  },
};
