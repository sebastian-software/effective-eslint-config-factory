/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires, unicorn/prefer-module */

import pkgDir from "pkg-dir"
import { join } from "node:path"

import { Linter } from "eslint"
import { merge, assign } from "lodash"

export interface RuleLoaderReturn {
  config?: any
  rules: Linter.RulesRecord
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

export function getTypeScriptRecommended(typeChecks = true): RuleLoaderReturn {
  const { configs } = require("@typescript-eslint/eslint-plugin")
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

export function getPrettierDisabledRules(): RuleLoaderReturn {
  process.env.ESLINT_CONFIG_PRETTIER_NO_DEPRECATED = "true"

  const { rules } = require("eslint-config-prettier")
  return { rules }
}

export function getCreateReactAppRecommended(): RuleLoaderReturn {
  const { rules, ...config } = require("eslint-config-react-app")
  return {
    config,
    rules
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

function getTypescriptOverride(overrides: Linter.ConfigOverride[]) {
  const match = overrides.find((overrideEntry: Linter.ConfigOverride) =>
    overrideEntry.files.toString().includes("*.ts")
  )
  const { rules, ...config } = match ?? {}
  return { rules, config }
}

export function getSatya164(): RuleLoaderReturn {
  const config = require("eslint-config-satya164")

  const { rules, overrides, ...restConfig } = config
  const tsOverride = getTypescriptOverride(overrides)

  return {
    config: {
      ...restConfig,
      ...tsOverride.config
    },

    rules: {
      ...rules,
      ...tsOverride.rules
    }
  }
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

  return {
    config: {},

    // Merge all into one. We filter e.g. jest-plugin related rules
    // later on the process.
    rules: {
      ...core.rules,
      ...core.overrides[0].rules,
      ...importPlugin.rules,
      ...importPlugin.overrides[0].rules,
      ...reactPlugin.rules,
      ...reactPlugin.overrides[0].rules,
      ...a11yPlugin.rules,
      ...jestPlugin.overrides[0].rules
    }
  }
}
