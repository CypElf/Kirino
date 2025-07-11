import { defineConfig } from "eslint/config";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([{
    extends: compat.extends("eslint:recommended", "plugin:@typescript-eslint/recommended"),

    plugins: {
        "@typescript-eslint": typescriptEslint,
    },

    languageOptions: {
        globals: {
            ...globals.node,
        },

        parser: tsParser,
        ecmaVersion: "latest",
        sourceType: "module",
    },

    rules: {
        "@typescript-eslint/ban-ts-comment": "off",
        indent: ["error", 4],

        "max-nested-callbacks": ["error", {
            max: 4,
        }],

        "max-statements-per-line": ["error", {
            max: 1,
        }],

        quotes: ["error", "double"],
        semi: ["error", "never"],
        "comma-dangle": "error",
        "comma-spacing": "error",
        "comma-style": "error",
        "no-undef": "off",

        "brace-style": ["error", "stroustrup", {
            allowSingleLine: true,
        }],

        yoda: "error",
        "no-var": "error",
        "no-trailing-spaces": "error",

        "no-shadow": ["error", {
            allow: ["err", "resolve", "reject", "option"],
        }],

        "no-lonely-if": "error",
        "object-curly-spacing": ["error", "always"],
        "no-multi-spaces": "error",
        "prefer-const": "error",
        curly: ["error", "multi-line"],
        "dot-location": ["error", "property"],
        "no-empty-function": "error",
        "no-floating-decimal": "error",

        "no-multiple-empty-lines": ["error", {
            max: 2,
            maxEOF: 0,
            maxBOF: 0,
        }],

        "space-before-blocks": "error",
        "keyword-spacing": "error",

        "space-before-function-paren": ["error", {
            anonymous: "never",
            named: "never",
            asyncArrow: "always",
        }],

        "space-in-parens": "error",
        "space-infix-ops": "error",
        "space-unary-ops": "error",
        "spaced-comment": "error",
        "node/no-deprecated-api": "off",
    },
}]);