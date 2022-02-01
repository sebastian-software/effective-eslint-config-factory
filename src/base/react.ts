import { Linter } from "eslint"
import { getNamingConventionRule } from "../util/rule"

const config: Linter.BaseConfig = {
  plugins: ["react", "jsx-a11y", "react-hooks"],
  parserOptions: { ecmaFeatures: { jsx: true } },
  settings: {
    "import/extensions": [".js", ".jsx", ".ts", ".tsx"],
    react: { pragma: "React", version: "detect" },
    propWrapperFunctions: ["forbidExtraProps", "exact", "Object.freeze"]
  },
  overrides: [
    {
      files: ["**/*.tsx"],
      rules: {
        ...getNamingConventionRule({ isTsx: true })
      }
    }
  ]
}

export default config
