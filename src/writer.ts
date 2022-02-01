import path from "node:path"
import { writeFile, mkdir } from "node:fs/promises"
import { Linter } from "eslint"
import prettier from "prettier"
import { dump } from "js-yaml"

type ConfigList = Record<string, Linter.BaseConfig>

function formatJSON(json: any): string {
  return prettier.format(JSON.stringify(json), { parser: "json" })
}

type SupportedFormats = "json" | "yaml" | "js"

function produce(object: any, format: SupportedFormats) {
  if (format === "js" || format === "json") {
    const fileContent = formatJSON(object)
    if (format === "js") {
      return `module.exports = ${fileContent}`
    }

    return fileContent
  }

  if (format === "yaml") {
    return dump(object)
  }

  throw new Error(`Invalid format:${format}`)
}

export async function writeFiles(
  configs: ConfigList,
  dist: string,
  format: SupportedFormats = "yaml"
) {
  mkdir(dist, { recursive: true })

  const configNames = Object.keys(configs)
  const fileNames = configNames.map((baseName) =>
    path.join(dist, `${baseName}.${format}`)
  )

  await Promise.all(
    fileNames.map((fileName, index) => {
      writeFile(fileName, produce(configs[configNames[index]], format))
    })
  )
}
