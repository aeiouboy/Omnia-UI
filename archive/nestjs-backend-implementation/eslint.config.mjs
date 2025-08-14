import eslintPluginImport from 'eslint-plugin-import';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import sonarjs from 'eslint-plugin-sonarjs';
import eslintPluginUnusedImports from 'eslint-plugin-unused-imports';

import eslint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';

/** @type {import('@typescript-eslint/utils').TSESLint.Linter.Config} */
const config = [
  { ignores: ['eslint.config.mjs'] },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  eslintPluginImport.flatConfigs.recommended,
  sonarjs.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.node, ...globals.jest },
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    plugins: {
      '@stylistic': stylistic,
      'unused-imports': eslintPluginUnusedImports,
    },
    rules: {
      '@stylistic/array-bracket-spacing': 'warn',
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/no-multi-spaces': 'warn',
      '@stylistic/no-multiple-empty-lines': ['warn', { max: 1 }],
      '@stylistic/no-trailing-spaces': ['warn', { skipBlankLines: true }],
      '@stylistic/padding-line-between-statements': [
        'error',
        { blankLine: 'never', next: 'if', prev: 'if' },
        {
          blankLine: 'always',
          next: ['block-like', 'const', 'export', 'let', 'return', 'throw'],
          prev: '*',
        },
        {
          blankLine: 'always',
          next: '*',
          prev: ['block-like', 'const', 'let'],
        },
        { blankLine: 'never', prev: 'class', next: '*' },
        { blankLine: 'never', next: 'const', prev: 'const' },
        { blankLine: 'never', next: 'let', prev: 'let' },
        {
          blankLine: 'always',
          next: '*',
          prev: ['multiline-const', 'multiline-let'],
        },
        {
          blankLine: 'never',
          next: 'singleline-export',
          prev: 'singleline-export',
        },
        {
          blankLine: 'never',
          next: 'const',
          prev: 'const',
        },
        {
          blankLine: 'never',
          next: 'let',
          prev: 'let',
        },
      ],
      '@stylistic/semi': 'error',
      '@stylistic/space-before-blocks': 'error',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-base-to-string': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-redundant-type-constituents': 'off',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          ignoreRestSiblings: true,
          vars: 'all',
        },
      ],
      'import/no-unresolved': 'off',
      'import/order': [
        'error',
        {
          alphabetize: { caseInsensitive: true, order: 'asc' },
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
          pathGroups: [
            { pattern: '@nestjs/**', group: 'external', position: 'before' },
          ],
          pathGroupsExcludedImportTypes: ['nestjs'],
        },
      ],
      'sonarjs/no-control-regex': 'off',
      'sonarjs/no-identical-functions': 'off',
      'sonarjs/no-useless-catch': 'off',
      'max-lines-per-function': [
        'error',
        { max: 100, skipBlankLines: true, skipComments: true },
      ],
      'no-control-regex': 'off',
      'no-else-return': ['error', { allowElseIf: false }],
      'no-fallthrough': 'warn',
      'no-useless-catch': 'off',
      'no-useless-return': 'error',
      'object-shorthand': 'error',
      'prefer-const': 'error',
      'prettier/prettier': [
        'warn',
        {
          singleQuote: true,
          trailingComma: 'all',
          tabWidth: 2,
          semi: true,
          printWidth: 80,
        },
      ],
      'sort-imports': [
        'error',
        {
          allowSeparatedGroups: true,
          ignoreDeclarationSort: true,
          memberSyntaxSortOrder: ['all', 'single', 'multiple', 'none'],
        },
      ],
      yoda: 'error',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
    },
    settings: {
      'import/resolver': {
        node: { extensions: ['.js', '.jsx', '.ts', '.tsx'], paths: ['.'] },
      },
    },
  },
  {
    files: ['sequelize/**/*.js'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'import/order': 'off',
      'max-lines-per-function': 'off',
      'unused-imports/no-unused-vars': 'off',
    },
  },
];

export default config;
