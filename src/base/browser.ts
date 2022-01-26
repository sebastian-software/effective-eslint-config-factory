import { Linter } from "eslint"
import confusingGlobals from "confusing-browser-globals"

const config: Linter.BaseConfig = {
  env: {
    node: false,
    browser: true
  },
  rules: {
    "no-restricted-globals": ["error", ...confusingGlobals]
  }
}

export default config
