import { Linter } from "eslint"

const override: Linter.ConfigOverride = {
  plugins: ["jest"],
  files: ["*.{spec,test}.{js,jsx,ts,tsx}", "**/__tests__/**/*.{js,jsx,ts,tsx}"],
  env: {
    jest: true,
    "jest/globals": true
  }
}

export default override
