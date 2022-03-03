import { isEqual, mergeWith } from "lodash"
import { Linter } from "eslint"
import { getFixableRules } from "eslint-get-rules"
import { rules as TSEnabledRules } from "@typescript-eslint/eslint-plugin"
import { getMerged } from "./loader"
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
import { KeyValue, SimplifiedRuleValue, UnifiedRuleFormat } from "./types"
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

export function ruleComparator(first: string, second: string) {
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
}

function sortRules(source: KeyValue) {
  const ruleNames = Object.keys(source)
  ruleNames.sort(ruleComparator)

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

interface RuleMeta {
  source: 'disabled' | 'uniform' | 'single' | 'priority' | 'unresolved'
  resolution?: boolean
  droppedValue?: boolean
  relaxedLevel?: boolean
}

interface SimplifyResult {
  simplified: Linter.RulesRecord,
  meta: Record<string, RuleMeta>
}

async function simplify(source: KeyValue): Promise<SimplifyResult> {
  const simplified: UnifiedRuleFormat = {}
  const meta: Record<string, RuleMeta> = {}

  console.log("Reducing...")
  for (const ruleName in source) {
    const ruleValues = source[ruleName]
    const resolutionSource = ruleBasedSourcePriority[ruleName]

    const ruleMeta: RuleMeta = {}
    meta[ruleName] = ruleMeta

    if (resolutionSource) {
      ruleMeta.priorityMeta = {
        source: resolutionSource,
        alternatives: source[ruleName]
      }
    }

    const forcedDisabledValue = getForcedDisabled(ruleName, ruleValues)
    if (forcedDisabledValue) {
      ruleMeta.source = "disabled"
      continue
    }

    const singleKey = getSingleSourceKey(ruleValues)
    if (singleKey) {
      const singleValue = source[ruleName][singleKey]
      simplified[ruleName] = singleValue
      ruleMeta.source = "single"
      ruleMeta.details = {
        value: singleValue,
        origin: singleKey
      }
      continue
    }

    const equalValue = getEqualValue(ruleValues)
    if (equalValue) {
      simplified[ruleName] = equalValue
      ruleMeta.source = "uniform"
      ruleMeta.details = {
        value: equalValue
      }
      continue
    }

    if (resolutionSource) {
      if (Array.isArray(resolutionSource)) {
        simplified[ruleName] = resolutionSource
      } else if (resolutionSource === "off") {
        simplified[ruleName] = ["off"]
      } else {
        simplified[ruleName] = ruleValues[resolutionSource]
      }

      ruleMeta.source = "priority"
      continue
    }

    ruleMeta.source = "unresolved"
  }

  console.log("Cleaning up...")
  for (const ruleName in source) {
    const ruleValue = simplified[ruleName] as string[]
    if (ruleValue && ruleValue[0] === "off") {
      delete simplified[ruleName]
      meta[ruleName].droppedValue = true
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

export async function compileFiles() {
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

  const metaVisualized = await formatMeta(fileLists.meta)
  await writeFiles({ meta: metaVisualized}, outputFolder, "html")
}

function formatRuleMeta(ruleMeta, ruleName: string) {
  let cells = ``
  cells += `<td>${ruleMeta.source}</td>`

  return `<tr class="source-${ruleMeta.source}"><th>${ruleName}</th>${cells}</tr>`
}

export async function formatMeta(rulesMeta) {
  const metaKeys = Object.keys(rulesMeta)
  metaKeys.sort(ruleComparator)
  const rowsHtml = metaKeys.map((ruleName) => formatRuleMeta(rulesMeta[ruleName], ruleName)).join("\n")
  const styles = `
  html {
    font: 11px sans-serif;
    background: white;
    color: black;
  }

  th, td {
    text-align: left;
  }

  .source-disabled{
    text-decoration: line-through;
    color: grey;
  }

  .source-priority{
    color: orange;
  }

  `



  return `<html><style>${styles}</style><table>${rowsHtml}</table></html>`
}
