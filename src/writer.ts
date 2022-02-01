import path from "path"
import { Linter } from "eslint"
import prettier from "prettier"
import { writeFile, mkdir } from "fs/promises"
import { dump } from "js-yaml"

type ConfigList = Record<string, Linter.BaseConfig>

function formatJSON(json: any): string {
  return prettier.format(JSON.stringify(json), { parser: "json" })
}

type SupportedFormats = "json" | "yaml" | "js"

function produce(obj: any, format: SupportedFormats) {
  if (format === "js" || format === "json") {
    const fileContent = formatJSON(obj)
    if (format === "js") {
      return "module.exports = " + fileContent
    } else {
      return fileContent
    }
  }

  if (format === "yaml") {
    return dump(obj)
  }

  throw new Error("Invalid format:" + format)
}

export async function writeFiles(configs: ConfigList, dist: string, format: SupportedFormats = "yaml") {
  mkdir(dist, { recursive: true })

  const configNames = Object.keys(configs)
  const fileNames = configNames.map((baseName) =>
    path.join(dist, baseName + "." + format)
  )

  await Promise.all(
    fileNames.map((fileName, index) => {
      writeFile(fileName, produce(configs[configNames[index]], format))
    })
  )
}
