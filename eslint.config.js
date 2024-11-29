import prettier from "eslint-plugin-prettier";
import stylisticJs from "@stylistic/eslint-plugin-js";
import globals from "globals";

export default [
  {
    ignores: ["public/dist/*.js"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: {
        ...globals.jest, // add Jest globals
        ...globals.node, // add Node.js globals
        ...globals.browser, // add browser globals
      },
    },
    plugins: {
      prettier,
      "@stylistic/js": stylisticJs,
    },
    rules: {
      "max-len": ["error", { code: 140 }],
      "capitalized-comments": "off",
      "max-params": ["error", 5],
      "no-unused-vars": "warn",
      "no-await-in-loop": "warn",
      "no-else-return": "warn",
      "function-paren-newline": "off",
      "function-call-argument-newline": ["error", "consistent"],
      "multiline-comment-style": "off",
    },
  },
];
