import path from "node:path"
import { writeFile, mkdir } from "node:fs/promises"
import { Linter } from "eslint"
import prettier from "prettier"
import { dump } from "js-yaml"

type ConfigList = Record<string, Linter.BaseConfig | string>

function formatJson(json: JSON): string {
  return prettier.format(JSON.stringify(json), { parser: "json" })
}

type SupportedFormats = "json" | "yaml" | "js" | "html"

function produce(object: any, format: SupportedFormats) {
  if (format === "js" || format === "json") {
    const fileContent = formatJson(object)
    if (format === "js") {
      return `module.exports = ${fileContent}`
    }

    return fileContent
  }

  if (format === "yaml") {
    return dump(object)
  }

  if (format === "html") {
    return prettier.format(object, { parser: "html" })
  }

  throw new Error(`Invalid format:${format}`)
}

export async function writeFiles(
  configs: ConfigList,
  dist: string,
  format: SupportedFormats = "yaml"
) {
  await mkdir(dist, { recursive: true })

  const configNames = Object.keys(configs)
  const fileNames = configNames.map((baseName) =>
    path.join(dist, `${baseName}.${format}`)
  )

  await Promise.all(
    fileNames.map(async (fileName, index) =>
      writeFile(fileName, produce(configs[configNames[index]], format))
    )
  )
}
