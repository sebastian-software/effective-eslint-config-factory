import pkgDir from "pkg-dir"
import { join } from "path"

import { Linter } from "eslint"
import { merge, assign } from "lodash"

export interface RuleLoaderReturn {
  config?: any
  rules: Linter.RulesRecord
}

export async function getESLintRecommended(): Promise<RuleLoaderReturn> {
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

export async function getReactRecommended(): Promise<RuleLoaderReturn> {
  const react = await import("eslint-plugin-react")
  const { rules, ...config } = react.configs.recommended
  return {
    config,
    rules
  }
}

export async function getTypeScriptRecommended(
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

export async function getPrettierDisabledRules(): Promise<RuleLoaderReturn> {
  process.env.ESLINT_CONFIG_PRETTIER_NO_DEPRECATED = "true"

  const { rules } = await import("eslint-config-prettier")
  return { rules }
}

export async function getCreateReactAppRecommended(): Promise<RuleLoaderReturn> {
  const { rules } = await import("eslint-config-react-app")
  return {
    rules
  }
}

export async function getJSXRecommended(): Promise<RuleLoaderReturn> {
  const plugin = await import("eslint-plugin-jsx-a11y")
  const { rules, ...config } = plugin.configs.recommended
  return {
    config,
    rules
  }
}

export async function getReactHooksRecommended(): Promise<RuleLoaderReturn> {
  const plugin = await import("eslint-plugin-react-hooks")
  const { rules, ...config } = plugin.configs.recommended
  return { config, rules }
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

export async function getAirbnbBase(): Promise<RuleLoaderReturn> {
  const plugin = await import("eslint-config-airbnb-base")
  return flattenExtends(plugin.extends)
}

export async function getAirbnbReact(): Promise<RuleLoaderReturn> {
  const plugin = await import("eslint-config-airbnb")
  return flattenExtends(plugin.extends)
}

export async function getUnicornRecommended(): Promise<RuleLoaderReturn> {
  const plugin = require("eslint-plugin-unicorn/configs/recommended")
  const { rules, ...config } = plugin
  return { config, rules }
}

function getTSOverride(overrides: Linter.ConfigOverride[]) {
  const { rules, ...config } = overrides.filter((overrideEntry: Linter.ConfigOverride) => overrideEntry.files.toString().includes("*.ts"))[0]
  return { rules, config }
}

export async function getSatya164(): Promise<RuleLoaderReturn> {
  const config = require("eslint-config-satya164")

  const { rules, overrides, ...restConfig } = config
  const tsOverride = getTSOverride(overrides)

  return {
    config: {
      ...restConfig,
      ...tsOverride.config
    },

    rules:{
      ...rules,
      ...tsOverride.rules
    }
  }
}
