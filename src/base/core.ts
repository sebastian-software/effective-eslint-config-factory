import { Linter } from "eslint"
import { getNamingConventionRule } from "../util/rule"

const core: Linter.BaseConfig = {
  parser: "@typescript-eslint/parser",

  // https://eslint.org/docs/user-guide/configuring/language-options#specifying-parser-options
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",

    // Typescript specific
    warnOnUnsupportedTypeScriptVersion: false,

    // Babel specific to disable config file requirement
    // requireConfigFile: false,

    project: "tsconfig.json"
  },
  plugins: ["@typescript-eslint", "import"],
  env: { es2021: true, "shared-node-browser": true },
  reportUnusedDisableDirectives: true,
  settings: {
    "import/extensions": [".js", ".ts"],
    "import/parsers": { "@typescript-eslint/parser": [".ts", ".tsx"] },
    "import/resolver": { node: { extensions: [".js", ".jsx", ".ts", ".tsx"] } }
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
