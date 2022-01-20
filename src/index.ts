interface CliOptions {
  nodejs: boolean
  react: boolean
  typescript: boolean
}

export function main(flags: CliOptions) {
  console.log("Effective ESLint...", flags)
}
