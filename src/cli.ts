import meow from "meow"
import { main } from "."

const cli = meow(
  `
	Usage
	  $ effective-eslint

	Options
	  --nodejs, -n  Enable NodeJS support
		--react, -r  Enable React support
		--typescript, -t  Enable TypeScript support

	Example
	  $ effective-eslint --react --typescript
`,
  {
    flags: {
      nodejs: {
        type: "boolean",
        alias: "n"
      },
      react: {
        type: "boolean",
        alias: "n"
      },
      typescript: {
        type: "boolean",
        alias: "n"
      }
    }
  }
)

main(cli.flags)
