import { Linter } from "eslint"
import pkg from "jest/package.json"

const override: Linter.ConfigOverride = {
  // Explicitly use `/src/*` as we might have e2e tests (Cypress/Playwright)
  // in another root-level folder e.g. `e2e` and do not like to risk compatibility.
  files: ["src/*.{spec,test}.{js,jsx,ts,tsx}"],
  plugins: ["jest", "testing-library"],
  env: {
    "jest/globals": true
  },
  settings: {
    // Setting version here is smart as it prevent failing at the user project when
    // no local jest version is installed (prevents probing).
    version: pkg.version,
  }
}

export default override
