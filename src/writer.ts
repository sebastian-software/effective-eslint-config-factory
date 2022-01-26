import path from "path"
import { Linter } from "eslint"
import prettier from "prettier"
import { writeFile } from "fs/promises"

type ConfigList = Record<string, Linter.BaseConfig>

function formatJSON(json: any): string {
  return prettier.format(JSON.stringify(json), { parser: "json" })
}

export async function writeFiles(configs: ConfigList, dist: string) {
  const configNames = Object.keys(configs)
  const fileNames = configNames.map((baseName) =>
    path.join(dist, baseName + ".js")
  )

  await Promise.all(
    fileNames.map((fileName, index) =>
      writeFile(fileName, formatJSON(configs[configNames[index]]))
    )
  )
}
