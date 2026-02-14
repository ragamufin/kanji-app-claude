const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const reactHooks = require('eslint-plugin-react-hooks');
const prettier = require('eslint-config-prettier');

module.exports = tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // PanResponder callbacks and Animated.Value refs are not render-time calls
      'react-hooks/purity': 'off',
      'react-hooks/refs': 'off',
      // Reanimated shared values use .value assignment, not React state
      'react-hooks/immutability': 'off',
      // React Compiler memoization rules conflict with manual useMemo patterns
      'react-hooks/preserve-manual-memoization': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    ignores: ['node_modules/', '.expo/', 'dist/', 'babel.config.js', 'eslint.config.js'],
  }
);
