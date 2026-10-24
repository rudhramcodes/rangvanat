import tseslint from 'typescript-eslint'
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', '.legacy/**', 'storefront/**']),
  {
    files: ['src/**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {files:['src/admin/**/*.{ts,tsx}'],languageOptions:{parser:tseslint.parser,globals:globals.browser,parserOptions:{ecmaFeatures:{jsx:true}}},plugins:{'@typescript-eslint':tseslint.plugin},rules:{'@typescript-eslint/no-unused-vars':['error',{argsIgnorePattern:'^_',ignoreRestSiblings:true}]}},
  {
    files: ['server/**/*.js', 'scripts/**/*.mjs'],
    extends: [js.configs.recommended],
    languageOptions: { globals: globals.node },
    rules: { 'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrors: 'none', ignoreRestSiblings: true }] },
  },
])
