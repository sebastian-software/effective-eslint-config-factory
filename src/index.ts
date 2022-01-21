import pkgDir from 'pkg-dir';
import {join} from "path"
import {merge,assign} from "lodash"

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

function removedFilteredRules(rules: KeyValue) {
  const ruleNames = Object.keys(rules).filter((ruleName) => !ignoreRules.test(ruleName))
  const filteredRules: KeyValue = {}
  for (const ruleName of ruleNames) {
    filteredRules[ruleName] = rules[ruleName]
  }
  return filteredRules
}

function mergeIntoStructure(source: RuleLoaderReturn, originName: string, dist: OrginStructuredRules) {
  const { rules, config } = source

  for (const ruleName in rules) {
    if (!dist[ruleName]) {
      dist[ruleName] = {}
    }
    dist[ruleName][originName] = rules[ruleName]
  }
}

function sortRules(source: KeyValue) {
  const ruleNames = Object.keys(source)
  ruleNames.sort((first: string, second: string) => {
    if ((first.includes("/") && second.includes("/")) || (!first.includes("/") && !second.includes("/"))) {
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

export async function main(flags: CliOptions) {
  console.log("Effective ESLint...", flags)
  const dist: OrginStructuredRules = {}

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

  const craRecommended = await getCreateReactAppRecommended()
  mergeIntoStructure(craRecommended, "cra", dist)

  const prettierDisabled = await getPrettierDisabledRules()
  mergeIntoStructure(prettierDisabled, "prettier", dist)

  const airbnbBase = await getAirbnbBase()
  mergeIntoStructure(airbnbBase, "airbnb", dist)

  const airbnbReact = await getAirbnbReact()
  mergeIntoStructure(airbnbReact, "airbnb-react", dist)

  const result = sortRules(removedFilteredRules(dist))
  console.log(result)
}

function flattenExtends(extendsBlock: string[]) {
  const loader: Linter.BaseConfig[] = extendsBlock.filter((importPath: string) => !importPath.includes("airbnb-base")).map((importPath: string) => require(importPath))

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

async function getTypeScriptRecommended(typeChecks=true): Promise<RuleLoaderReturn> {
  const { configs } = await import("@typescript-eslint/eslint-plugin")
  const config = configs.base
  const recommended = configs.recommended.rules as Linter.RulesRecord
  const tsc = typeChecks ? configs["recommended-requiring-type-checking"].rules as Linter.RulesRecord : {}
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
