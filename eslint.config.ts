import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import { defineConfig } from "eslint/config";
import globals from "globals";

import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

module.exports = defineConfig([
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },

      parser: tsParser,
    },

    extends: compat.extends(
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended"
    ),

    rules: {
      "@typescript-eslint/ban-types": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-this-alias": "off",
      "@typescript-eslint/consistent-type-imports": "warn",
      "no-case-declarations": "off",
      "no-prototype-builtins": "off",
      "no-useless-escape": "off",
      semi: ["warn", "always"],
    },
  },
]);
