import path from "path"
import { Linter } from "eslint"
import { writeFile } from "fs/promises"

type ConfigList = Record<string, Linter.BaseConfig>

export async function writeFiles(configs: ConfigList, dist: string) {
  const configNames = Object.keys(configs)
  const fileNames = configNames.map((baseName) => path.join(dist, baseName + '.js'))

  await Promise.all(fileNames.map((fileName, index) => writeFile(fileName, JSON.stringify(configs[configNames[index]], null, 2))))
}
