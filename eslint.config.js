// Matlens ESLint flat config.
//
// Goal: catch real bugs (a11y violations, broken hook deps, banned eval)
// without drowning the codebase in stylistic noise. Prettier-style
// formatting is intentionally NOT enforced here — we keep the diff small.
//
// Rule philosophy:
//   - error  → must be fixed (security, a11y, broken hooks)
//   - warn   → should be fixed but doesn't block CI
//   - off    → known incompatibilities with the existing codebase
//
// To run: `pnpm lint`

import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import globals from 'globals';

export default [
  // Ignore build artefacts and vendor directories.
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      'storybook-static/**',
      '.vercel/**',
      'design-tokens/figma-plugin/code.js',
      '**/*.config.js',
      '**/*.config.ts',
      '**/*.test.{ts,tsx,js}',
      '**/*.stories.{ts,tsx}',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      // ----- Security -----
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',

      // ----- React -----
      'react/jsx-key': 'error',
      'react/jsx-no-target-blank': ['error', { allowReferrer: false }],
      'react/no-danger-with-children': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // ----- Accessibility (the whole point of this PR) -----
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/anchor-has-content': 'error',
      'jsx-a11y/anchor-is-valid': 'warn',
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-role': 'error',
      'jsx-a11y/aria-unsupported-elements': 'error',
      'jsx-a11y/no-noninteractive-element-interactions': 'warn',
      'jsx-a11y/no-redundant-roles': 'error',
      'jsx-a11y/role-has-required-aria-props': 'error',
      'jsx-a11y/role-supports-aria-props': 'error',

      // ----- TypeScript -----
      // The codebase still has some `any` and ad-hoc Function-typed
      // dispatchers we don't want to refactor in this PR. Keep these as
      // warnings so they show up in editors but don't block CI.
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/ban-ts-comment': 'warn',

      // ----- General -----
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      'no-debugger': 'error',
      'no-unused-vars': 'off', // TS rule above takes over

      // ----- Regex-related allowances -----
      // We intentionally match null bytes in input validation (security
      // hardening) and the regex has escape-char noise some linters call
      // "useless"; both are semantically correct for our use case.
      'no-control-regex': 'off',
      'no-useless-escape': 'warn',
    },
  },

  // JS files (vite config, scripts, api routes) — relax TS-only rules.
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-debugger': 'error',
      'no-control-regex': 'off',
      'no-useless-escape': 'warn',
    },
  },
];
