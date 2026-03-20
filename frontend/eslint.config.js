import react from "eslint-plugin-react";
import hooksPlugin from "eslint-plugin-react-hooks";
import importPlugin from "eslint-plugin-import";
import globals from "globals";

export default [
  {
    files: ["**/*.js", "**/*.jsx"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react,
      "react-hooks": hooksPlugin,
      import: importPlugin,
    },
    rules: {
      "import/no-unresolved": "error",
      "no-undef": "error",
      "no-unused-vars": "warn",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react/react-in-jsx-scope": "off",
    },
    settings: {
      react: { version: "detect" },
      "import/resolver": {
        alias: {
          map: [["@", "./src"]],          
          extensions: [".js", ".jsx"]
        },
        node: {
          extensions: [".js", ".jsx"]
        }
      }
    },
  },
];