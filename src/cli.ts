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
        alias: "n",
        default: false
      },
      react: {
        type: "boolean",
        alias: "n",
        default: false
      },
      typescript: {
        type: "boolean",
        alias: "n",
        default: false
      }
    }
  }
)

main(cli.flags).then(() => {
  console.log("Written files successfully!")
}).catch((error) => {
  console.error("Error during execution:", error)
})
