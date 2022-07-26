import { dirname, basename } from "node:path"
import { KeyValue } from "./types"

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

export function sortRules(source: KeyValue) {
  const ruleNames = Object.keys(source)
  ruleNames.sort(ruleComparator)

  const result: KeyValue = {}
  for (const ruleName of ruleNames) {
    result[ruleName] = source[ruleName]
  }

  return result
}

export function blockModernModuleResolution() {
  const fullPath = require.resolve("@rushstack/eslint-patch/modern-module-resolution")

  require.cache[fullPath] = {
    id: fullPath,
    filename: basename(fullPath),
    path: dirname(fullPath),
    isPreloading: false,
    require,
    exports: '{}',
    loaded: true,
    children: [],
    paths: [],
    parent: null
  }
}
