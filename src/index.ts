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
    rules,
    config
  }
}
