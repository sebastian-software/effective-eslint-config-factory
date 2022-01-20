import pkgDir from 'pkg-dir';
import {join} from "path"
import { configs } from "eslint-plugin-react"

interface CliOptions {
  nodejs: boolean
  react: boolean
  typescript: boolean
}

export async function main(flags: CliOptions) {
  console.log("Effective ESLint...", flags)

  const eslintRecommended = await getESLintRecommended()
  console.log("ESLint:",eslintRecommended)

  const reactRecommended = await getReactRecommended()
  console.log("React:", reactRecommended)

  const tsRecommended = await getTypeScriptRecommended()
  console.log("TypeScript:", tsRecommended)

  const jsxRecommended = await getJSXRecommended()
  console.log("JSX:", jsxRecommended)

  const hooksRecommended = await getReactHooksRecommended()
  console.log("ReactHooks:", hooksRecommended)

  const craRecommended = await getCreateReactAppRecommended()
  console.log("CRA:", craRecommended)

  const prettierDisabled = await getPrettierDisabledRules()
  console.log("Prettier:", prettierDisabled)
}

async function getESLintRecommended() {
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

async function getReactRecommended() {
  const react = await import("eslint-plugin-react")
  const { rules, ...config } = react.configs.recommended
  return {
    config,
    rules
  }
}

async function getTypeScriptRecommended(typeChecks=true) {
  const { configs } = await import("@typescript-eslint/eslint-plugin")
  const config = configs.base
  const recommended = configs.recommended.rules
  const tsc = typeChecks ? configs["recommended-requiring-type-checking"].rules : {}

  return {
    config,
    rules: { ...recommended, ...tsc }
  }
}

async function getPrettierDisabledRules() {
  process.env.ESLINT_CONFIG_PRETTIER_NO_DEPRECATED = "true"

  const { rules } = await import("eslint-config-prettier")
  return { rules }
}

async function getCreateReactAppRecommended() {
  const { rules } = await import("eslint-config-react-app")
  return {
    rules
  }
}

async function getJSXRecommended() {
  const plugin = await import("eslint-plugin-jsx-a11y")
  const { rules, ...config } = plugin.configs.recommended
  return {
    config,
    rules
  }
}

async function getReactHooksRecommended() {
  const plugin = await import("eslint-plugin-react-hooks")
  const { rules, ...config } = plugin.configs.recommended
  return { config, rules }
}
