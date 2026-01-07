export default [
  {
    files: ["app/src/main/resources/static/js/**/*.js"],
    languageOptions: {
      parserOptions: { ecmaVersion: 2020, sourceType: "module" },
      globals: { window: "readonly", document: "readonly" }
    },
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
      "semi": ["error", "always"]
    }
  }
];
