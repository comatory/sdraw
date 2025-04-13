module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: ["eslint:recommended"],
  overrides: [
    {
      env: {
        node: true,
      },
      files: [".eslintrc.{js,cjs}"],
      parserOptions: {
        sourceType: "module",
      },
    },
  ],
  parserOptions: {
    ecmaVersion: "2022",
    sourceType: "module",
  },
  rules: {
    quotes: ["error", "double"],
    "no-shadow": ["error", { hoist: "functions", allow: [] }],
    "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
  },
};
