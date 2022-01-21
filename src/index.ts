import pkgDir from "pkg-dir"
import { join } from "path"
import { merge, assign, isEqual } from "lodash"

import { Linter } from "eslint"

interface CliOptions {
  nodejs: boolean
  react: boolean
  typescript: boolean
}

interface RuleLoaderReturn {
  config?: any
  rules: Linter.RulesRecord
}

type OriginRuleConfig = Record<string, Linter.RuleEntry>
type OrginStructuredRules = Record<string, OriginRuleConfig>
type KeyValue = Record<string, any>

const ignoreRules = /^(vue|flowtype|standard)\//

const sourcePriority = ["local", "prettier", "ts"]

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
  let first = true
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
      const priorityValue = getPriorityValue(ruleValues)
      if (priorityValue) {
        result[ruleName] = priorityValue
        solvedCounter++
      } else {
        //console.log("Needs resolution for: " + ruleName, ruleValues)
        openCounter++

        const equal = getEqualValue(ruleValues)
        if (equal) {
          console.log("Found equal value in: " + ruleName, ruleValues)
        }
      }
    }
  }

  console.log("Solved/Open: " + solvedCounter + "/" + openCounter)
  // console.log(result)

  return result
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

  // ==== ==== ==== ==== ==== ==== ====
  // Post-Processing
  // ==== ==== ==== ==== ==== ==== ====

  const result = sortRules(removedFilteredRules(dist))
  const simplified = simplify(result)
  //console.log(simplified)
}

function flattenExtends(extendsBlock: string[]) {
  const loader: Linter.BaseConfig[] = extendsBlock
    .filter((importPath: string) => !importPath.includes("airbnb-base"))
    .map((importPath: string) => require(importPath))

  const allConfig = {}
  const allRules = {}

  loader.forEach((fileContent) => {
    const { rules, ...config } = fileContent
    assign(allRules, rules)
    merge(allConfig, config)
  })

  return {
    config: allConfig,
    rules: allRules
  }
}

async function getESLintRecommended(): Promise<RuleLoaderReturn> {
  const root = await pkgDir(require.resolve("eslint"))
  if (!root) {
    throw new Error("Installation Issue: ESLint package was not found!")
  }
  const recommendedPath = join(root, "conf/eslint-recommended")
  const { rules } = await import(recommendedPath)
  return {
    rules
  }
}

async function getReactRecommended(): Promise<RuleLoaderReturn> {
  const react = await import("eslint-plugin-react")
  const { rules, ...config } = react.configs.recommended
  return {
    config,
    rules
  }
}

async function getTypeScriptRecommended(
  typeChecks = true
): Promise<RuleLoaderReturn> {
  const { configs } = await import("@typescript-eslint/eslint-plugin")
  const config = configs.base
  const recommended = configs.recommended.rules as Linter.RulesRecord
  const tsc = typeChecks
    ? (configs["recommended-requiring-type-checking"]
        .rules as Linter.RulesRecord)
    : {}
  const rules: Linter.RulesRecord = { ...recommended, ...tsc }

  return {
    config,
    rules
  }
}

async function getPrettierDisabledRules(): Promise<RuleLoaderReturn> {
  process.env.ESLINT_CONFIG_PRETTIER_NO_DEPRECATED = "true"

  const { rules } = await import("eslint-config-prettier")
  return { rules }
}

async function getCreateReactAppRecommended(): Promise<RuleLoaderReturn> {
  const { rules } = await import("eslint-config-react-app")
  return {
    rules
  }
}

async function getJSXRecommended(): Promise<RuleLoaderReturn> {
  const plugin = await import("eslint-plugin-jsx-a11y")
  const { rules, ...config } = plugin.configs.recommended
  return {
    config,
    rules
  }
}

async function getReactHooksRecommended(): Promise<RuleLoaderReturn> {
  const plugin = await import("eslint-plugin-react-hooks")
  const { rules, ...config } = plugin.configs.recommended
  return { config, rules }
}

async function getAirbnbBase(): Promise<RuleLoaderReturn> {
  const plugin = await import("eslint-config-airbnb-base")
  return flattenExtends(plugin.extends)
}

async function getAirbnbReact(): Promise<RuleLoaderReturn> {
  const plugin = await import("eslint-config-airbnb")
  return flattenExtends(plugin.extends)
}

async function getUnicornRecommended(): Promise<RuleLoaderReturn> {
  const plugin = require("eslint-plugin-unicorn/configs/recommended")
  const { rules, ...config } = plugin
  return { config, rules }
}
