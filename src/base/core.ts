import { Linter } from "eslint"
import { getNamingConventionRule } from "../util/rule"

const core: Linter.BaseConfig = {
  parser: "@typescript-eslint/parser",

  // https://eslint.org/docs/user-guide/configuring/language-options#specifying-parser-options
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",

    // Inspired by NextJS
    allowImportExportEverywhere: true,

    // Typescript specific
    warnOnUnsupportedTypeScriptVersion: false,

    // Babel specific to disable config file requirement
    requireConfigFile: false,

    // Do not define to improve support for mono repositories and pure JS files
    // project: "tsconfig.json"
  },
  plugins: ["@typescript-eslint", "import", "unicorn"],
  env: { es2021: true, "shared-node-browser": true },
  reportUnusedDisableDirectives: true,
  settings: {
    "import/extensions": [".js", ".ts"],
    "import/parsers": { "@typescript-eslint/parser": [".ts", ".tsx", ".d.ts"] },
    "import/resolver": {
      [require.resolve('eslint-import-resolver-node')]: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
      [require.resolve('eslint-import-resolver-typescript')]: {
        alwaysTryTypes: true,
      },
    }
  },
  overrides: [
    {
      files: ["**/*.d.ts"],
      rules: { "@typescript-eslint/no-unused-vars": "off" }
    },
    {
      files: ["**/*.ts"],
      rules: {
        ...getNamingConventionRule({ isTsx: false })
      }
    }
  ]
}

export default core
