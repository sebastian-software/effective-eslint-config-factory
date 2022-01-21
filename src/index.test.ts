import { getSingleSourceKey} from "."

describe("getSingleSourceKey()", () => {
  test("supports empty", () => {
    expect(getSingleSourceKey({})).toBe(null)
  })

  test("supports with one entry", () => {
    expect(getSingleSourceKey({first:1})).toBe("first")
  })

  test("supports with two entries", () => {
    expect(getSingleSourceKey({first:1, second:2})).toBe(null)
  })
})
