import { Linter } from "eslint"

const override: Linter.ConfigOverride = {
  // Explicitly use `/src/*` as we might have e2e tests (Cypress/Playwright)
  // in another root-level folder and do not like to risk compatibility.
  files: ["src/*.{spec,test}.{js,jsx,ts,tsx}"],
  plugins: ["jest", "testing-library"],
  env: {
    jest: true,
    "jest/globals": true
  }
}

export default override
