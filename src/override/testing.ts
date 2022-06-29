import { Linter } from "eslint"

const override: Linter.ConfigOverride = {
  files: ["*.{spec,test}.{js,jsx,ts,tsx}", "**/__tests__/**/*.{js,jsx,ts,tsx}"],
  plugins: ["jest", "testing-library"],
  env: {
    jest: true,
    "jest/globals": true
  }
}

export default override
