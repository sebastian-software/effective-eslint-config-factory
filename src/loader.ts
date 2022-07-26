/* eslint-disable @typescript-eslint/no-var-requires, unicorn/prefer-module */

import { join } from "node:path"
import { readFileSync } from "node:fs"
import pkgDir from "pkg-dir"
import { Linter } from "eslint"
import { merge, assign } from "lodash"
import requireFromString from "require-from-string"

import { RulesStructuredByOrigin, SimplifiedRuleValue } from "./types"
import { recommended } from "./recommended"

export interface RuleLoaderReturn {
  config?: any
  rules: Linter.RulesRecord
}

function humanizeRuleLevel(ruleLevel: 0 | 1 | 2) {
  if (ruleLevel === 0) {
    return "off"
  }

  if (ruleLevel === 1) {
    return "warn"
  }

  if (ruleLevel === 2) {
    return "error"
  }

  throw new Error(`Invalid rule level: ${ruleLevel as string}!`)
}

function mergeIntoStructure(
  source: RuleLoaderReturn,
  originName: string,
  dist: RulesStructuredByOrigin
) {
  const { rules } = source

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

    dist[ruleName][originName] = ruleValue as SimplifiedRuleValue
  }
}

export function getMerged(): RulesStructuredByOrigin {
  const dist: RulesStructuredByOrigin = {}

  // ==== ==== ==== ==== ==== ==== ====
  // Single Origin Recommendation
  // ==== ==== ==== ==== ==== ==== ====

  mergeIntoStructure(getESLintRecommended(), "eslint", dist)
  mergeIntoStructure(getReactRecommended(), "react", dist)
  mergeIntoStructure(getJestRecommended(), "jest", dist)
  mergeIntoStructure(getTestingLibraryRecommended(), "testinglib", dist)
  mergeIntoStructure(getTypeScriptRecommended(), "ts", dist)
  mergeIntoStructure(getTypeScriptStrict(), "ts-strict", dist)
  mergeIntoStructure(getJSXRecommended(), "jsx", dist)
  mergeIntoStructure(getReactHooksRecommended(), "hooks", dist)
  mergeIntoStructure(getImportRecommended(), "import", dist)

  // TODO: https://www.npmjs.com/package/eslint-plugin-shopify-lean
  // TODO: https://www.npmjs.com/package/eslint-plugin-jsdoc
  // TODO: https://www.npmjs.com/package/eslint-plugin-import + https://www.npmjs.com/package/eslint-import-resolver-babel-module
  // TODO: https://github.com/epaew/eslint-plugin-filenames-simple

  // ==== ==== ==== ==== ==== ==== ====
  // Authored presets
  // ==== ==== ==== ==== ==== ==== ====

  mergeIntoStructure(getCreateReactAppRecommended(), "cra", dist)
  mergeIntoStructure(getPrettierDisabledRules(), "prettier", dist)
  mergeIntoStructure(getAirbnbBase(), "airbnb", dist)
  mergeIntoStructure(getAirbnbReact(), "airbnb-react", dist)
  mergeIntoStructure(getRemixRecommended(), "remix", dist)
  mergeIntoStructure(getXo(), "xo", dist)
  mergeIntoStructure(getXoReact(), "xo-react", dist)
  mergeIntoStructure(getXoTypescript(), "xo-typescript", dist)
  mergeIntoStructure(getKentDodds(), "kentcdodds", dist)

  // ==== ==== ==== ==== ==== ==== ====
  // Effective
  // ==== ==== ==== ==== ==== ==== ====

  mergeIntoStructure(getEffectiveRecommended(), "effective", dist)

  return dist
}

export function getEffectiveRecommended(): RuleLoaderReturn {
  const { rules, ...config } = recommended
  return {
    config,
    rules
  }
}

export function getESLintRecommended(): RuleLoaderReturn {
  const root = pkgDir.sync(require.resolve("eslint"))
  if (!root) {
    throw new Error("Installation Issue: ESLint package was not found!")
  }

  const recommendedPath = join(root, "conf/eslint-recommended")
  const { rules, ...config } = require(recommendedPath)
  return {
    config,
    rules
  }
}

export function getReactRecommended(): RuleLoaderReturn {
  const react = require("eslint-plugin-react")
  const { rules, ...config } = react.configs.recommended
  return {
    config,
    rules
  }
}

export function getTypeScriptRecommended(enableTypeChecks = true): RuleLoaderReturn {
  const { configs } = require("@typescript-eslint/eslint-plugin")
  const config = configs.base

  const loaded = configs.recommended.rules as Linter.RulesRecord

  const tsc = enableTypeChecks
    ? (configs["recommended-requiring-type-checking"]
        .rules as Linter.RulesRecord)
    : {}
  const rules: Linter.RulesRecord = { ...loaded, ...tsc }

  return {
    config,
    rules
  }
}

export function getTypeScriptStrict(): RuleLoaderReturn {
  const { configs } = require("@typescript-eslint/eslint-plugin")

  const loaded = configs.strict.rules as Linter.RulesRecord

  return {
    rules: loaded
  }
}

export function getJestRecommended(): RuleLoaderReturn {
  const jest = require("eslint-plugin-jest")
  const { rules, ...config } = jest.configs.recommended

  // Also import the style rules. These are not about formatting, but
  // more about sensible hints in my opinion
  const allRules = { ...rules, ...jest.configs.style.rules }

  return {
    config,
    rules: allRules
  }
}

export function getTestingLibraryRecommended(): RuleLoaderReturn {
  const testingLibrary = require("eslint-plugin-testing-library")
  const { rules, ...config } = testingLibrary.configs.react

  return {
    config,
    rules
  }
}

export function getRemixRecommended(): RuleLoaderReturn {
  const base = require("@remix-run/eslint-config/index.js")
  const testing = require("@remix-run/eslint-config/jest-testing-library.js")

  const { rules, ...config } = base
  const testRules = testing.overrides[0].rules

  return {
    config,
    rules: { ...rules, ...testRules }
  }
}

export function getPrettierDisabledRules(): RuleLoaderReturn {
  process.env.ESLINT_CONFIG_PRETTIER_NO_DEPRECATED = "true"

  const { rules } = require("eslint-config-prettier")
  return { rules }
}

export function getCreateReactAppRecommended(): RuleLoaderReturn {
  const { rules, ...config } = require("eslint-config-react-app")
  const base = require("eslint-config-react-app/base.js")
  const jest = require("eslint-config-react-app/jest.js")

  return {
    config,
    rules: {
      ...rules,
      ...base.rules,
      ...jest.overrides[0].rules
    }
  }
}

export function getJSXRecommended(): RuleLoaderReturn {
  const plugin = require("eslint-plugin-jsx-a11y")
  const { rules, ...config } = plugin.configs.recommended
  return {
    config,
    rules
  }
}

export function getReactHooksRecommended(): RuleLoaderReturn {
  const plugin = require("eslint-plugin-react-hooks")
  const { rules, ...config } = plugin.configs.recommended
  return { config, rules }
}

function flattenAirbnbExtends(extendsBlock: string[]) {
  const loader: Linter.BaseConfig[] = extendsBlock
    .filter((importPath: string) => !importPath.includes("airbnb-base"))
    .map((importPath: string) => require(importPath))

  const allConfig = {}
  const allRules = {}

  for (const fileContent of loader) {
    const { rules, ...config } = fileContent
    assign(allRules, rules)
    merge(allConfig, config)
  }

  return {
    config: allConfig,
    rules: allRules
  }
}

export function getAirbnbBase(): RuleLoaderReturn {
  const plugin = require("eslint-config-airbnb-base")
  return flattenAirbnbExtends(plugin.extends)
}

export function getAirbnbReact(): RuleLoaderReturn {
  const plugin = require("eslint-config-airbnb")
  return flattenAirbnbExtends(plugin.extends)
}

export function getUnicornRecommended(): RuleLoaderReturn {
  const plugin = require("eslint-plugin-unicorn/configs/recommended")
  const { rules, ...config } = plugin
  return { config, rules }
}

export function getImportRecommended(): RuleLoaderReturn {
  const recommendedConfig = require("eslint-plugin-import/config/recommended")
  const typescriptConfig = require("eslint-plugin-import/config/typescript")

  const { rules, ...config } = merge({}, recommendedConfig, typescriptConfig)
  return { config, rules }
}

export function getXo(): RuleLoaderReturn {
  const { rules, ...config } = require("eslint-config-xo")

  return {
    config,
    rules
  }
}

export function getXoTypescript(): RuleLoaderReturn {
  const { rules, ...config } = require("eslint-config-xo-typescript")

  return {
    config,
    rules
  }
}

export function getXoReact(): RuleLoaderReturn {
  const { rules, ...config } = require("eslint-config-xo-react")

  return {
    config,
    rules
  }
}

export function getKentDodds(): RuleLoaderReturn {
  const core = require("eslint-config-kentcdodds")
  const importPlugin = require("eslint-config-kentcdodds/import")
  const reactPlugin = require("eslint-config-kentcdodds/react")
  const a11yPlugin = require("eslint-config-kentcdodds/jsx-a11y")
  const jestPlugin = require("eslint-config-kentcdodds/jest")

  const allRules = {
    ...core.rules,
    ...core.overrides[0].rules,
    ...importPlugin.rules,
    ...importPlugin.overrides[0].rules,
    ...reactPlugin.rules,
    ...reactPlugin.overrides[0].rules,
    ...a11yPlugin.rules,
    ...jestPlugin.overrides[0].rules
  }

  return {
    config: {},

    // Merge all into one. We filter e.g. jest-plugin related rules
    // later on the process.
    rules: allRules
  }
}
