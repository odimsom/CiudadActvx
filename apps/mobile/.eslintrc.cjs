module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true },
  extends: [
    'eslint:recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'public', '*.d.ts', 'vite.config.ts', 'tailwind.config.js'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-undef': 'off', // TypeScript handles this
  },
  overrides: [
    {
      files: ['*.js', '*.jsx'],
      env: { browser: true, es2020: true },
    }
  ],
}
