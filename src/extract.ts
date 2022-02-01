import { Linter } from "eslint"

type KeyValue = Record<string, any>

export function extractJestOverrideRules(source: KeyValue): Linter.RulesRecord {
  const jestRules: Linter.RulesRecord = {}
  const ruleNames = Object.keys(source)

  for (const ruleName of ruleNames) {
    if (ruleName.startsWith("jest/")) {
      jestRules[ruleName] = source[ruleName]
      delete source[ruleName]
    }
  }

  return jestRules
}

export function extractTestingLibOverrideRules(
  source: KeyValue
): Linter.RulesRecord {
  const testingLibraryRules: Linter.RulesRecord = {}
  const ruleNames = Object.keys(source)

  for (const ruleName of ruleNames) {
    if (ruleName.startsWith("testing-library/")) {
      testingLibraryRules[ruleName] = source[ruleName]
      delete source[ruleName]
    }
  }

  return testingLibraryRules
}

export function extractNode(source: KeyValue): Linter.BaseConfig {
  const filteredRules: KeyValue = {}
  const ruleNames = Object.keys(source)

  for (const ruleName of ruleNames) {
    if (ruleName.startsWith("node/")) {
      filteredRules[ruleName] = source[ruleName]
      delete source[ruleName]
    }
  }

  return {
    env: {
      node: true,
      browser: false
    },
    rules: filteredRules
  }
}

export function extractReact(source: KeyValue): Linter.RulesRecord {
  const filteredRules: KeyValue = {}
  const ruleNames = Object.keys(source)

  for (const ruleName of ruleNames) {
    if (
      ruleName.startsWith("react/") ||
      ruleName.startsWith("react-hooks/") ||
      ruleName.startsWith("jsx-a11y/")
    ) {
      filteredRules[ruleName] = source[ruleName]
      delete source[ruleName]
    }
  }

  return filteredRules
}
