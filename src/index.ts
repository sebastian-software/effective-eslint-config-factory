import { isEqual, mergeWith } from "lodash"
import { Linter } from "eslint"
import { getFixableRules } from "eslint-get-rules"
import { rules as TSEnabledRules } from "@typescript-eslint/eslint-plugin"
import { getMerged } from "./loader"
import { writeFiles } from "./writer"
import baseCore from "./base/core"
import baseReact from "./base/react"
import testingOverrideCore from "./override/testing"
import {
  extractJestOverrideRules,
  extractReact,
  extractTestingLibraryOverrideRules
} from "./extract"
import {
  KeyValue,
  RuleMeta,
  SimplifiedRuleValue,
  SimplifyResult,
  SourcePriorityValue,
  UnifiedRuleFormat
} from "./types"
import { ruleBasedSourcePriority } from "./rules"
import { formatMeta, formatAlternatives, getReadableValue } from "./html"
import { blockModernModuleResolution, sortRules } from "./util"

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

function getForcedDisabledOrigin(
  ruleName: string,
  ruleValues: KeyValue
): string | undefined {
  if (
    !ruleName.startsWith("@typescript-eslint/") &&
    ruleName in TSEnabledRules
  ) {
    // Highest priority to rules from eslint builtin configured by TS preset to be disabled (replaced rules)
    if (ruleValues.ts && ruleValues.ts[0] === "off") {
      return "ts"
    }

    // Highest priority to rules from eslint builtin configured by TS preset to be disabled (replaced rules)
    if (
      ruleValues["xo-typescript"] &&
      ruleValues["xo-typescript"][0] === "off"
    ) {
      return "xo-typescript"
    }
  }

  // Next to are all rules which came from prettier
  if (
    ruleValues.prettier &&
    ruleValues.prettier[0] === "off" &&
    !ruleName.startsWith("prettier/")
  ) {
    return "prettier"
  }
}

interface EqualReturn {
  value: SimplifiedRuleValue
  sources: string[]
}

/**
 * Return the value when all values are equal. Otherwise return undefined.
 *
 * @param ruleValues Map of values (key = source name)
 * @returns The detected equal value, otherwise undefined
 */
export function getEqualValue(ruleValues: KeyValue): undefined | EqualReturn {
  let last
  const sources = []
  for (const sourceName in ruleValues) {
    const currentValue = ruleValues[sourceName]
    sources.push(sourceName)
    if (!last) {
      last = currentValue
      continue
    }

    if (!isEqual(last, currentValue)) {
      return
    }
  }

  return { value: last, sources }
}

async function simplify(source: KeyValue): Promise<SimplifyResult> {
  const simplified: UnifiedRuleFormat = {}
  const meta: Record<string, RuleMeta> = {}

  for (const ruleName in source) {
    const ruleValues = source[ruleName]
    const resolutionValue: SourcePriorityValue =
      ruleBasedSourcePriority[ruleName]

    const ruleMeta: RuleMeta = {}
    meta[ruleName] = ruleMeta

    const forcedDisabledOrigin = getForcedDisabledOrigin(ruleName, ruleValues)
    if (forcedDisabledOrigin) {
      simplified[ruleName] = ["off"]
      ruleMeta.source = "disabled"
      ruleMeta.origin = forcedDisabledOrigin
      if (resolutionValue) {
        console.warn(`Useless resolution in ${ruleName}! #ForcedDisabled`)
      }
      continue
    }

    ruleMeta.alternatives = formatAlternatives(ruleValues, resolutionValue?.use)

    const singleSourceName = getSingleSourceKey(ruleValues)
    if (singleSourceName) {
      const singleValue = source[ruleName][singleSourceName]
      simplified[ruleName] = singleValue
      ruleMeta.source = "single"
      ruleMeta.origin = singleSourceName
      if (resolutionValue) {
        console.warn(`Useless resolution in ${ruleName}! #SingleKey`)
      }
      continue
    }

    const equalValue = getEqualValue(ruleValues)
    if (equalValue) {
      simplified[ruleName] = equalValue.value
      ruleMeta.source = "uniform"
      ruleMeta.origin = equalValue.sources.sort().join(", ")
      if (resolutionValue) {
        console.warn(`Useless resolution in ${ruleName}! #EqualValue`)
      }

      continue
    }

    if (resolutionValue) {
      if (resolutionValue.use !== "off") {
        simplified[ruleName] = ruleValues[resolutionValue.use]
        if (!simplified[ruleName]) {
          console.warn(
            `Invalid resolution: ${resolutionValue.use} for rule ${ruleName}!`
          )
        }
      }

      ruleMeta.source = "priority"
      ruleMeta.origin = resolutionValue.use
      ruleMeta.comment = resolutionValue.comment
      continue
    }

    console.warn(`Unresolved rule: ${ruleName}!`)
    ruleMeta.source = "unresolved"
  }

  for (const ruleName in source) {
    const ruleValue = simplified[ruleName] as string[]
    if (ruleValue && ruleValue[0] === "off") {
      delete simplified[ruleName]
      meta[ruleName].droppedValue = true
    } else {
      meta[ruleName].config = getReadableValue(simplified[ruleName])
    }
  }

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

  for (const ruleName of fixable) {
    if (ruleName in simplified) {
      simplified[ruleName][0] = "warn"
      meta[ruleName].relaxedLevel = true
    }
  }

  return { simplified, meta }
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

export async function compileFiles(): Promise<Record<string, any>> {
  const dist = getMerged()

  // Post-Processing
  const result = sortRules(removeOutOfScopeRules(dist))
  const { simplified, meta } = await simplify(result)

  // Extracing specific parts
  const jestOverrideRules = extractJestOverrideRules(simplified)
  const testingLibraryOverrideRules =
    extractTestingLibraryOverrideRules(simplified)
  const reactSpecific = extractReact(simplified)

  const baseCoreAndReact = mergeIntoNewConfig([baseCore, baseReact])

  return {
    meta,

    index: {
      ...baseCore,
      rules: {
        ...simplified
      },
      overrides: [
        ...(baseCore.overrides ?? []),
        {
          ...testingOverrideCore,
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
          ...testingOverrideCore,
          rules: {
            ...jestOverrideRules,
            ...testingLibraryOverrideRules
          }
        }
      ]
    }
  }
}

export async function main(flags: CliOptions) {
  console.log("Effective ESLint...", flags)

  blockModernModuleResolution()

  const outputFolder = "./config"
  const fileLists = await compileFiles()

  await writeFiles(fileLists, outputFolder)

  const metaVisualized = await formatMeta(fileLists.meta)
  await writeFiles({ meta: metaVisualized }, outputFolder, "html")
}
