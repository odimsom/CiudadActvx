module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true },
  extends: [
    'eslint:recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', '.astro', 'tailwind.config.mjs', '*.astro', 'public', '*.d.ts'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-undef': 'off', // Astro and service workers use globals
  },
  overrides: [
    {
      files: ['*.js', '*.jsx'],
      env: { browser: true, es2020: true },
    }
  ],
}
