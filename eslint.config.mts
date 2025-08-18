import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx,jsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "no-console": "warn",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-require-imports": "warn",
      "react/react-in-jsx-scope": "off",
      "no-useless-escape": "warn",
      "react/prop-types": "off",
      "testing-library/no-container": "off",
      "testing-library/no-node-access": "off",
      "prettier/prettier": ["error", { "endOfLine": "auto" }],
    },
  },
  {
    ignores: ["**/dist/**", "**/build/**", "**/coverage/**", "**/.env", "**/node_modules/**"],
  }
);