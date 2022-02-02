import { Linter } from "eslint"
import { removeDisabledRules } from "./loader"

test("removeDisabledRules", () => {
  const rules: Linter.RulesRecord = {
    first: "off",
    second: ["off"],
    third: "error",
    fourth: ["error"]
  }

  removeDisabledRules(rules)
  expect(rules).toMatchInlineSnapshot(`
    Object {
      "fourth": Array [
        "error",
      ],
      "third": "error",
    }
  `)
})
