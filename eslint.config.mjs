import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";


/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ["**/*.{js,mjs,cjs,ts}"] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "no-console": "warn",
      "@typescript-eslint/naming-convention": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-var-requires": "off",
      "@typescript-eslint/no-throw-literal": "off",
      "@typescript-eslint/promise-function-async": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "new-cap": "off",
      "max-lines": [
        "error",
        300
      ],
      "max-params": [
        "error",
        6
      ],
      "max-depth": [
        "error",
        3
      ],

      // StandardJS-like rules
      "semi": ["error", "never"],
      "quotes": ["error", "single"],
      "indent": ["error", 2],
      "space-before-function-paren": ["error", "always"],
      "eqeqeq": ["error", "always"],
      "no-var": "error",
      "prefer-const": "error",
      "comma-dangle": ["error", "never"],
      "arrow-spacing": ["error", { "before": true, "after": true }],
      "object-curly-spacing": ["error", "always"],
      "keyword-spacing": ["error", { "before": true, "after": true }],
      "space-infix-ops": "error",
      "key-spacing": ["error", { "beforeColon": false, "afterColon": true }],
      "spaced-comment": ["error", "always"],
      "space-before-blocks": ["error", "always"],
      "brace-style": ["error", "1tbs", { "allowSingleLine": true }]
    }
  },

];