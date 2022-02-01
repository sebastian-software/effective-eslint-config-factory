import { isEqual, mergeWith } from "lodash"
import { Linter } from "eslint"
import { getFixableRules } from "eslint-get-rules"
import { rules as TSEnabledRules } from "@typescript-eslint/eslint-plugin"
import {
  getAirbnbBase,
  getAirbnbReact,
  getCreateReactAppRecommended,
  getESLintRecommended,
  getImportRecommended,
  getJestRecommended,
  getJSXRecommended,
  getKentDodds,
  getMerged,
  getPrettierDisabledRules,
  getReactHooksRecommended,
  getReactRecommended,
  getSatya164,
  getTestingLibraryRecommended,
  getTypeScriptRecommended,
  getUnicornRecommended,
  getXo,
  getXoReact,
  getXoTypescript,
  RuleLoaderReturn
} from "./loader"
import { writeFiles } from "./writer"
import baseCore from "./base/core"
import baseReact from "./base/react"
import jestOverride from "./override/jest"
import testingLibraryOverride from "./override/testinglib"
import {
  extractJestOverrideRules,
  extractReact,
  extractTestingLibOverrideRules as extractTestingLibraryOverrideRules
} from "./extract"
import {
  KeyValue,
  RulesStructuredByOrigin,
  SimplifiedRuleValue,
  UnifiedRuleFormat
} from "./types"
import { ruleBasedSourcePriority } from "./rules"

interface CliOptions {
  nodejs: boolean
  react: boolean
  typescript: boolean
}

function removeOutOfScopeRules(
  rules: KeyValue,
  expr = /^(vue|flowtype|standard|prettier|react-native|node|eslint-comments|babel)\//
) {
  const relevantRuleNames = Object.keys(rules).filter(
    (ruleName) => !expr.test(ruleName)
  )
  const filteredRules: KeyValue = {}
  for (const ruleName of relevantRuleNames) {
    filteredRules[ruleName] = rules[ruleName]
  }

  return filteredRules
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

export function getSingleSourceKey(object: KeyValue): string | undefined {
  let single
  for (const key in object) {
    if (single) {
      return
    }

    single = key
  }

  return single
}

function getForcedDisabled(
  ruleName: string,
  ruleValues: KeyValue
): Linter.RuleEntry | undefined {
  if (
    !ruleName.startsWith("@typescript-eslint/") &&
    ruleName in TSEnabledRules
  ) {
    // Highest priority to rules from eslint builtin configured by TS preset to be disabled (replaced rules)
    if (ruleValues.ts && ruleValues.ts[0] === "off") {
      return ruleValues.ts
    }

    // Highest priority to rules from eslint builtin configured by TS preset to be disabled (replaced rules)
    if (
      ruleValues["xo-typescript"] &&
      ruleValues["xo-typescript"][0] === "off"
    ) {
      return ruleValues["xo-typescript"]
    }
  }

  // Next to are all rules which came from prettier
  if (
    ruleValues.prettier &&
    ruleValues.prettier[0] === "off" &&
    !ruleName.startsWith("prettier/")
  ) {
    return ruleValues.prettier
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
): SimplifiedRuleValue | undefined {
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

async function simplify(source: KeyValue): Promise<Linter.RulesRecord> {
  const result: UnifiedRuleFormat = {}

  let forcedDisabledCount = 0
  let unresolvedRules = 0
  let uniformCount = 0
  let solvedRulesCount = 0

  console.log("Reducing...")
  for (const ruleName in source) {
    const ruleValues = source[ruleName]

    const forcedDisabledValue = getForcedDisabled(ruleName, ruleValues)
    if (forcedDisabledValue) {
      forcedDisabledCount++
      continue
    }

    const singleKey = getSingleSourceKey(ruleValues)
    if (singleKey) {
      result[ruleName] = source[ruleName][singleKey]
      uniformCount++
      continue
    }

    const equal = getEqualValue(ruleValues)
    if (equal) {
      result[ruleName] = equal
      uniformCount++
      continue
    }

    const resolutionSource = ruleBasedSourcePriority[ruleName]
    if (resolutionSource) {
      if (Array.isArray(resolutionSource)) {
        result[ruleName] = resolutionSource
      } else if (resolutionSource === "off") {
        result[ruleName] = ["off"]
      } else {
        result[ruleName] = ruleValues[resolutionSource]
      }

      solvedRulesCount++
      continue
    }

    unresolvedRules++

    if (unresolvedRules < 6) {
      console.log(
        `#${unresolvedRules}: Needs resolution for: ${ruleName}`,
        JSON.stringify(ruleValues, null, 2)
      )
    }
  }

  console.log("  - Disabled Rules:", forcedDisabledCount)
  console.log("  - Uniform Rule Values:", uniformCount)
  console.log("  - Priority Solved Rules:", solvedRulesCount)
  console.log("  - Unresolved Rules:", unresolvedRules)

  console.log("Cleaning up...")
  let cleanupCounter = 0
  for (const ruleName in source) {
    const ruleValue = result[ruleName] as string[]
    if (ruleValue && ruleValue[0] === "off") {
      // Console.log("Dropping disabled:", ruleName)
      delete result[ruleName]
      cleanupCounter++
    }
  }

  console.log(`  - Entirely deleted: ${cleanupCounter} disabled rules`)

  console.log("Relaxing...")
  const fixable = await getFixableRules({
    plugins: [
      "react",
      "react-hooks",
      "jsx-a11y",
      "@typescript-eslint",
      "unicorn",
      "import"
    ]
  })
  let fixableCounter = 0
  for (const ruleName of fixable) {
    if (ruleName in result) {
      result[ruleName][0] = "warn"
      fixableCounter++
    }
  }

  console.log(`  - Warning Level: ${fixableCounter} autofixable rules`)

  return result
}

function mergeIntoNewConfig(configs: Linter.BaseConfig[]): Linter.BaseConfig {
  const dist: Linter.BaseConfig = {}
  for (const config of configs)
    mergeWith(dist, config, (objectValue: any, sourceValue: any) => {
      if (Array.isArray(objectValue) && Array.isArray(sourceValue)) {
        return [...new Set([...objectValue, ...sourceValue])]
      }
    })

  return dist
}

export async function compileFiles() {
  const dist = getMerged()

  // Post-Processing
  const result = sortRules(removeOutOfScopeRules(dist))
  const simplified = await simplify(result)

  // Extracing specific parts
  const jestOverrideRules = extractJestOverrideRules(simplified)
  const testingLibraryOverrideRules =
    extractTestingLibraryOverrideRules(simplified)
  const reactSpecific = extractReact(simplified)

  const baseCoreAndReact = mergeIntoNewConfig([baseCore, baseReact])

  return {
    index: {
      ...baseCore,
      rules: {
        ...simplified
      },
      overrides: [
        ...(baseCore.overrides ?? []),
        {
          ...jestOverride,
          rules: jestOverrideRules
        }
      ]
    },

    react: {
      ...baseCoreAndReact,
      rules: {
        ...simplified,
        ...reactSpecific
      },
      overrides: [
        ...(baseCoreAndReact.overrides ?? []),
        {
          ...testingLibraryOverride,
          rules: testingLibraryOverrideRules
        }
      ]
    }
  }
}

export async function main(flags: CliOptions) {
  console.log("Effective ESLint...", flags)

  const outputFolder = "./config"
  const fileLists = await compileFiles()

  await writeFiles(fileLists, outputFolder)
}
