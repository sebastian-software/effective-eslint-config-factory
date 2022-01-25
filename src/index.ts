import { isEqual } from "lodash"
import { Linter } from "eslint"
import {
  getAirbnbBase,
  getAirbnbReact,
  getCreateReactAppRecommended,
  getESLintRecommended,
  getJSXRecommended,
  getPrettierDisabledRules,
  getReactHooksRecommended,
  getReactRecommended,
  getSatya164,
  getTypeScriptRecommended,
  getUnicornRecommended,
  getXo,
  getXoReact,
  getXoTypescript,
  RuleLoaderReturn
} from "./loader"
import { writeFiles } from "./writer"

interface CliOptions {
  nodejs: boolean
  react: boolean
  typescript: boolean
}

type OriginRuleConfig = Record<string, Linter.RuleEntry>
type OrginStructuredRules = Record<string, OriginRuleConfig>
type KeyValue = Record<string, any>

const ignoreRules = /^(vue|flowtype|standard|prettier|react-native)\//

const sourcePriority = ["local", "prettier", "ts"]

const ruleBasedSourcePriority: KeyValue = {
  "react/no-direct-mutation-state": "cra",
  "react/jsx-no-target-blank": "cra",
  "react/jsx-no-duplicate-props": "airbnb-react"
}



function removedFilteredRules(rules: KeyValue) {
  const ruleNames = Object.keys(rules).filter(
    (ruleName) => !ignoreRules.test(ruleName)
  )
  const filteredRules: KeyValue = {}
  for (const ruleName of ruleNames) {
    filteredRules[ruleName] = rules[ruleName]
  }
  return filteredRules
}

function humanizeRuleLevel(ruleLevel: 0 | 1 | 2) {
  if (ruleLevel === 0) {
    return "off"
  } else if (ruleLevel === 1) {
    return "warn"
  } else if (ruleLevel === 2) {
    return "error"
  }

  throw new Error("Invalid rule level: " + ruleLevel)
}

function mergeIntoStructure(
  source: RuleLoaderReturn,
  originName: string,
  dist: OrginStructuredRules
) {
  const { rules, config } = source

  for (const ruleName in rules) {
    if (!dist[ruleName]) {
      dist[ruleName] = {}
    }

    let ruleValue = rules[ruleName]

    // Human-readable values for level
    if (typeof ruleValue === "number") {
      ruleValue = humanizeRuleLevel(ruleValue)
    } else if (Array.isArray(ruleValue) && typeof ruleValue[0] === "number") {
      ruleValue[0] = humanizeRuleLevel(ruleValue[0])
    }

    // Unify level-only to be always array
    if (typeof ruleValue === "string") {
      ruleValue = [ruleValue]
    }

    // If a rule is disabled reduce it to just off
    if (ruleValue[0] === "off" && ruleValue.length > 1) {
      ruleValue = ["off"]
    }

    // If a ruleLevel is "warn", normalize it to "error"
    // Indentions between different libraries vary here and need
    // a different set-up approach in a merged configuration
    if (ruleValue[0] === "warn") {
      ruleValue[0] = "error"
    }

    dist[ruleName][originName] = ruleValue
  }
}

function sortRules(source: KeyValue) {
  const ruleNames = Object.keys(source)
  ruleNames.sort((first: string, second: string) => {
    if (
      (first.includes("/") && second.includes("/")) ||
      (!first.includes("/") && !second.includes("/"))
    ) {
      return first > second ? 1 : -1
    }
    if (first.includes("/")) {
      return 1
    }
    if (second.includes("/")) {
      return -1
    }

    return 0
  })

  const result: KeyValue = {}
  for (const ruleName of ruleNames) {
    result[ruleName] = source[ruleName]
  }
  return result
}

export function getSingleSourceKey(object: KeyValue): string | null {
  let single = null
  for (const key in object) {
    if (single) {
      return null
    } else {
      single = key
    }
  }

  return single
}

function getPriorityValue(ruleValues: KeyValue): Linter.RuleEntry | undefined {
  for (const sourceName of sourcePriority) {
    const sourceValue = ruleValues[sourceName]
    if (sourceValue) {
      return sourceValue
    }
  }
}

/**
 * Return the value when all values are equal. Otherwise return undefined.
 *
 * @param ruleValues List of values
 * @returns The detected equal value, otherwise undefined
 */
export function getEqualValue(
  ruleValues: KeyValue
): Linter.RuleEntry | undefined {
  let last
  for (const sourceName in ruleValues) {
    const currentValue = ruleValues[sourceName]
    if (!last) {
      last = currentValue
      continue
    }
    if (!isEqual(last, currentValue)) {
      return
    }
  }

  return last
}

function simplify(source: KeyValue): KeyValue {
  const result: KeyValue = {}
  let openCounter = 0
  let solvedCounter = 0
  for (const ruleName in source) {
    const ruleValues = source[ruleName]
    const singleKey = getSingleSourceKey(ruleValues)
    if (singleKey) {
      result[ruleName] = source[ruleName][singleKey]
      solvedCounter++
    } else {
      const equal = getEqualValue(ruleValues)
      if (equal) {
        result[ruleName] = equal
        solvedCounter++
      } else {
        const priorityValue = getPriorityValue(ruleValues)
        if (priorityValue) {
          result[ruleName] = priorityValue
          solvedCounter++
        } else {
          const resolutionSource = ruleBasedSourcePriority[ruleName]
          if (resolutionSource && ruleValues[resolutionSource]) {
            result[ruleName] = ruleValues[resolutionSource]
            solvedCounter++
          } else {
            //console.log("Needs resolution for: " + ruleName, JSON.stringify(ruleValues, null, 2))
            openCounter++
          }
        }
      }
    }
  }

  console.log("Solved/Open: " + solvedCounter + "/" + openCounter)

  for (const ruleName in source) {
    if (result[ruleName] && result[ruleName][0] === "off") {
      console.log("Dropping: ", ruleName)
      delete result[ruleName]
    }
  }

  return result
}

export function extractJestOverride(source: KeyValue): Linter.ConfigOverride {
  const jestRules: KeyValue = {}
  const ruleNames = Object.keys(source)

  for (const ruleName of ruleNames) {
    if (ruleName.startsWith("jest/")) {
      jestRules[ruleName] = source[ruleName]
      delete source[ruleName]
    }
  }

  return {
    plugins: ['jest'],
    files: ['*.{spec,test}.{js,ts,tsx}', '**/__tests__/**/*.{js,ts,tsx}'],
    env: {
      jest: true,
      'jest/globals': true,
    },
    rules: jestRules
  }
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

export function extractReact(source: KeyValue): Linter.BaseConfig {
  const filteredRules: KeyValue = {}
  const ruleNames = Object.keys(source)

  for (const ruleName of ruleNames) {
    if (ruleName.startsWith("react/") || ruleName.startsWith("react-hooks/") || ruleName.startsWith("jsx-a11y/")) {
      filteredRules[ruleName] = source[ruleName]
      delete source[ruleName]
    }
  }

  return {
    rules: filteredRules
  }
}

export function getBrowserVariant() {
  const confusingGlobals = require('confusing-browser-globals')
  return {
    env: {
      node: false,
      browser: true,
    },
    rules: {
      'no-restricted-globals': [
        'error',
        ...confusingGlobals,
      ],
    },
  }
}

export async function main(flags: CliOptions) {
  console.log("Effective ESLint...", flags)
  const dist: OrginStructuredRules = {}

  // ==== ==== ==== ==== ==== ==== ====
  // Single Origin Recommendation
  // ==== ==== ==== ==== ==== ==== ====

  const eslintRecommended = await getESLintRecommended()
  mergeIntoStructure(eslintRecommended, "eslint", dist)

  const reactRecommended = await getReactRecommended()
  mergeIntoStructure(reactRecommended, "react", dist)

  const tsRecommended = await getTypeScriptRecommended()
  mergeIntoStructure(tsRecommended, "ts", dist)

  const jsxRecommended = await getJSXRecommended()
  mergeIntoStructure(jsxRecommended, "jsx", dist)

  const hooksRecommended = await getReactHooksRecommended()
  mergeIntoStructure(hooksRecommended, "hooks", dist)

  const unicornRecommended = await getUnicornRecommended()
  mergeIntoStructure(unicornRecommended, "unicorn", dist)

  // TODO: eslint-plugin-shopify-lean
  // TODO: eslint-plugin-jsdoc
  // TODO: eslint-plugin-jest
  // TODO: eslint-plugin-import + eslint-import-resolver-babel-module
  // TODO: eslint-plugin-filenames

  // ==== ==== ==== ==== ==== ==== ====
  // Cross-Plugin Recommendations
  // ==== ==== ==== ==== ==== ==== ====

  const craRecommended = await getCreateReactAppRecommended()
  mergeIntoStructure(craRecommended, "cra", dist)

  const prettierDisabled = await getPrettierDisabledRules()
  mergeIntoStructure(prettierDisabled, "prettier", dist)

  const airbnbBase = await getAirbnbBase()
  mergeIntoStructure(airbnbBase, "airbnb", dist)

  const airbnbReact = await getAirbnbReact()
  mergeIntoStructure(airbnbReact, "airbnb-react", dist)

  const satya164 = await getSatya164()
  mergeIntoStructure(satya164, "satya164", dist)

  const xo = await getXo()
  mergeIntoStructure(xo, "xo-typescript", dist)

  const xoReact = await getXoReact()
  mergeIntoStructure(xoReact, "xo-react", dist)

  const xoTypescript = await getXoTypescript()
  mergeIntoStructure(xoTypescript, "xo-typescript", dist)

  // ==== ==== ==== ==== ==== ==== ====
  // Post-Processing
  // ==== ==== ==== ==== ==== ==== ====

  const result = sortRules(removedFilteredRules(dist))
  const simplified = simplify(result)
  //console.log(simplified)


  const jestOverride = extractJestOverride(simplified)

  const nodeSpecific = extractNode(simplified)
  const reactSpecific = extractReact(simplified)

  const browserVariant = getBrowserVariant();



  writeFiles({
    index: simplified,
    node: nodeSpecific,
    react: reactSpecific,

    jest: jestOverride,
    browser: browserVariant
  }, './config')
}
