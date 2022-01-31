import { isEqual, mergeWith } from "lodash"
import { Linter } from "eslint"
import { getFixableRules } from "eslint-get-rules"
import {
  getAirbnbBase,
  getAirbnbReact,
  getCreateReactAppRecommended,
  getESLintRecommended,
  getJestRecommended,
  getJSXRecommended,
  getPrettierDisabledRules,
  getReactHooksRecommended,
  getReactRecommended,
  getSatya164,
  getTestingLibRecommended,
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
import jestOverrideBlock from "./base/jest"
import testingLibOverrideBlock from "./base/testinglib"
import { rules as TSEnabledRules } from "@typescript-eslint/eslint-plugin"

interface CliOptions {
  nodejs: boolean
  react: boolean
  typescript: boolean
}

type OriginRuleConfig = Record<string, Linter.RuleEntry>
type OriginStructuredRules = Record<string, OriginRuleConfig>
type KeyValue = Record<string, any>

const ignoreRules = /^(vue|flowtype|standard|prettier|react-native|node)\//

const sourcePriority = ["local"]

type SourcePriorityTable = Record<string, Linter.RuleEntry | string>

const ruleBasedSourcePriority: SourcePriorityTable = {
  // Additional "except-parens" was used in some, but that's the default anyway
  "no-cond-assign": "eslint",

  // Some allow empty-catch, but that's not really useful anyway
  "no-empty": "eslint",

  // Some allow in loops but I most often not saw any good use or even need
  "no-labels": "xo-typescript",

  // Typical error... even if some relax it for props
  "no-self-assign": "eslint",

  // Disabled per typescript-eslint recommendation: https://github.com/typescript-eslint/typescript-eslint/blob/e26e43ffba96f6d46198b22f1c8dd5c814db2652/docs/getting-started/linting/FAQ.md#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
  "no-undef": "xo-typescript",

  // Best list of affected globals is built into CRA
  "no-restricted-globals": "cra",

  // Good idea to prevent accidental issues
  "no-unsafe-optional-chaining": "eslint",

  // Sensible default for starters, no good reason to do otherwise as senior
  "no-use-before-define": "cra",

  // Checking classes as well in XO
  "no-useless-computed-key": "xo-typescript",

  // Really useless. Prevent on all levels.
  "no-useless-rename": "xo-typescript",

  // Sensible to be a littler stricter here as in XO
  "valid-typeof": "xo-typescript",

  // Prefer the simple-array style.
  "@typescript-eslint/array-type": "xo-typescript",

  // Nice to allow ts-expect with description
  "@typescript-eslint/ban-ts-comment": "xo-typescript",

  // Very good extension and hints of different ban types
  "@typescript-eslint/ban-types": "xo-typescript",

  // objectLiteralTypeAssertions is a win for sure
  "@typescript-eslint/consistent-type-assertions": "xo-typescript",

  // Allow single extends
  "@typescript-eslint/no-empty-interface": "xo-typescript",

  // Some good limitations in XO
  "@typescript-eslint/no-extraneous-class": "xo-typescript",

  // Relaxing IIFEs in XO
  "@typescript-eslint/no-floating-promises": "xo-typescript",

  // XO disables void return checks for making event handling easier, not sure
  // what an example here looks like. I guess the risk of misuse is higher than
  // this convenience benefit.
  "@typescript-eslint/no-misused-promises": "ts",

  // Allow destructuring for convenience - that's also not really an alias
  "@typescript-eslint/no-this-alias": "xo-typescript",
  "@typescript-eslint/no-unused-vars": "xo-typescript",
  "@typescript-eslint/restrict-plus-operands": "xo-typescript",
  "@typescript-eslint/restrict-template-expressions": "xo-typescript",
  "@typescript-eslint/triple-slash-reference": "xo-typescript",

  // Using basic rule config from CRA
  "jsx-a11y/alt-text": "cra",
  "jsx-a11y/anchor-has-content": "cra",
  "jsx-a11y/anchor-is-valid": "cra",
  "jsx-a11y/aria-role": "cra",
  "jsx-a11y/autocomplete-valid": "airbnb-react",
  "jsx-a11y/no-autofocus": "airbnb-react",

  // Tricky with custom components... therefore disabled
  "jsx-a11y/control-has-associated-label": "jsx",
  "jsx-a11y/heading-has-content": "jsx",
  "jsx-a11y/interactive-supports-focus": "jsx",
  "jsx-a11y/media-has-caption": "jsx",

  "no-unsafe-negation": "xo-typescript",
  eqeqeq: "cra",
  "default-case": "cra",
  "array-callback-return": "cra",

  "jsx-a11y/no-interactive-element-to-noninteractive-role": "jsx",
  "jsx-a11y/no-noninteractive-element-interactions": "jsx",
  "jsx-a11y/no-distracting-elements": "jsx",
  "jsx-a11y/no-noninteractive-tabindex": "jsx",
  "jsx-a11y/no-noninteractive-element-to-interactive-role": "jsx",
  "jsx-a11y/label-has-associated-control": "jsx",

  "react/button-has-type": "xo-react",
  "react/boolean-prop-naming": "xo-react",

  "react/display-name": "react",

  // Prop Types are legacy React. We use TS.
  "react/prop-types": "off",
  "react/default-props-match-prop-types": "off",
  "react/no-unused-prop-types": "off",

  // Legacy class-based React
  "react/sort-comp": "airbnb-react",
  "react/prefer-es6-class": "airbnb-react",
  "react/state-in-constructor": "airbnb-react",

  "react/require-default-props": "xo-react",
  "react/jsx-no-bind": "xo-react",

  "react/jsx-curly-brace-presence": "xo-react",
  "react/jsx-boolean-value": "xo-react",

  // Prefer function declarations over arrow functions for all things
  "react/function-component-definition": "airbnb-react",

  // Ignoring the case is a good idea as this might be a typo
  "react/jsx-no-duplicate-props": "xo-react",

  // Combination of airbnb-react and xo-react
  "react/jsx-no-target-blank": [
    "error",
    {
      enforceDynamicLinks: "always",
      warnOnSpreadAttributes: true,
      forms: true
    }
  ],

  // Not sure about what's the reason to allow all-caps in CRA/Airbnb
  "react/jsx-pascal-case": "xo-react",

  // Future error in React >= 16.9
  "react/jsx-no-script-url": "xo-react",

  // Nice concept to bring some harmony into prop order. Interesting that
  // this the only preset containing such a rule definition.
  "react/jsx-sort-props": "xo-react",

  // Disabled effectively everywhere except Airbnb
  "react/no-direct-mutation-state": "react",
  "react/no-string-refs": "react",

  // Mostly focused on old API design of React
  "react/no-unsafe": "react",
  "react/no-did-mount-set-state": "off",

  // Good style, good find by XO
  "react/prefer-read-only-props": "xo-react",

  // Stricter and following the upcoming default. Fine.
  "react/jsx-key": "xo-react",

  // Practically common-sense to prevent this.
  "react/style-prop-object": "cra",

  // This unicorn rule is solved by TypeScript
  "unicorn/no-null": "xo-typescript",

  "react/static-property-placement": "xo-react",

  "jsx-a11y/no-static-element-interactions": "jsx"
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
  dist: OriginStructuredRules
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

function getForcedDisabled(
  ruleName: string,
  ruleValues: KeyValue
): Linter.RuleEntry | undefined {
  if (
    !ruleName.startsWith("@typescript-eslint/") &&
    ruleName in TSEnabledRules
  ) {
    // Highest priority to rules from eslint builtin configured by TS preset to be disabled (replaced rules)
    if (ruleValues["ts"] && ruleValues["ts"][0] === "off") {
      return ruleValues["ts"]
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

async function simplify(source: KeyValue): Linter.RulesRecord {
  const result: Linter.RulesRecord = {}

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

    const priorityValue = getPriorityValue(ruleValues)
    if (priorityValue) {
      result[ruleName] = priorityValue
      solvedRulesCount++
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
        "#" + unresolvedRules + ": Needs resolution for: " + ruleName,
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
      // console.log("Dropping disabled:", ruleName)
      delete result[ruleName]
      cleanupCounter++
    }
  }

  console.log("  - Entirely deleted: " + cleanupCounter + " disabled rules")

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

  console.log("  - Warning Level: " + fixableCounter + " autofixable rules")

  return result
}

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
  const testingLibRules: Linter.RulesRecord = {}
  const ruleNames = Object.keys(source)

  for (const ruleName of ruleNames) {
    if (ruleName.startsWith("testing-library/")) {
      testingLibRules[ruleName] = source[ruleName]
      delete source[ruleName]
    }
  }

  return testingLibRules
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

function mergeIntoNewConfig(configs: Linter.BaseConfig[]): Linter.BaseConfig {
  const dist: Linter.BaseConfig = {}
  configs.forEach((config) =>
    mergeWith(dist, config, (objValue: any, srcValue: any) => {
      if (Array.isArray(objValue) && Array.isArray(srcValue)) {
        return [...new Set([...objValue, ...srcValue])]
      }
    })
  )
  return dist
}

export async function main(flags: CliOptions) {
  console.log("Effective ESLint...", flags)
  const dist: OriginStructuredRules = {}

  // ==== ==== ==== ==== ==== ==== ====
  // Single Origin Recommendation
  // ==== ==== ==== ==== ==== ==== ====

  const eslintRecommended = await getESLintRecommended()
  mergeIntoStructure(eslintRecommended, "eslint", dist)

  const reactRecommended = await getReactRecommended()
  mergeIntoStructure(reactRecommended, "react", dist)

  const jestRecommended = await getJestRecommended()
  mergeIntoStructure(jestRecommended, "jest", dist)

  const testingLibRecommended = await getTestingLibRecommended()
  mergeIntoStructure(testingLibRecommended, "testinglib", dist)

  const tsRecommended = await getTypeScriptRecommended()
  mergeIntoStructure(tsRecommended, "ts", dist)

  const jsxRecommended = await getJSXRecommended()
  mergeIntoStructure(jsxRecommended, "jsx", dist)

  const hooksRecommended = await getReactHooksRecommended()
  mergeIntoStructure(hooksRecommended, "hooks", dist)

  const unicornRecommended = await getUnicornRecommended()
  mergeIntoStructure(unicornRecommended, "unicorn", dist)

  // TODO: https://www.npmjs.com/package/eslint-plugin-cypress
  // TODO: https://www.npmjs.com/package/eslint-plugin-shopify-lean
  // TODO: https://www.npmjs.com/package/eslint-plugin-jsdoc
  // TODO: https://www.npmjs.com/package/eslint-plugin-import + https://www.npmjs.com/package/eslint-import-resolver-babel-module
  // TODO: https://github.com/epaew/eslint-plugin-filenames-simple
  // TODO: https://www.npmjs.com/package/@graphql-eslint/eslint-plugin
  // TODO: https://www.npmjs.com/package/eslint-plugin-mdx

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
  const simplified = await simplify(result)

  // ==== ==== ==== ==== ==== ==== ====
  // Reducing levels
  // ==== ==== ==== ==== ==== ==== ====

  // ==== ==== ==== ==== ==== ==== ====
  // Extracing specific parts
  // ==== ==== ==== ==== ==== ==== ====

  const jestOverrideRules = extractJestOverrideRules(simplified)
  const testingLibOverrideRules = extractTestingLibOverrideRules(simplified)

  const reactSpecific = extractReact(simplified)

  // ==== ==== ==== ==== ==== ==== ====
  // Writing files
  // ==== ==== ==== ==== ==== ==== ====

  const outputFolder = "./config"
  const baseCoreAndReact = mergeIntoNewConfig([baseCore, baseReact])

  writeFiles(
    {
      index: {
        ...baseCore,
        rules: {
          ...simplified
        },
        overrides: [
          ...(baseCore.overrides || []),
          {
            ...jestOverrideBlock,
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
          ...(baseCoreAndReact.overrides || []),
          {
            ...testingLibOverrideBlock,
            rules: testingLibOverrideRules
          }
        ]
      }
    },
    outputFolder
  )
}
