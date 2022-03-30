import { getSingleSourceKey, getEqualValue, compileFiles } from "."

describe("getSingleSourceKey()", () => {
  test("supports empty", () => {
    expect(getSingleSourceKey({})).toBeUndefined()
  })

  test("supports with one entry", () => {
    expect(getSingleSourceKey({ first: 1 })).toBe("first")
  })

  test("supports with two entries", () => {
    expect(getSingleSourceKey({ first: 1, second: 2 })).toBeUndefined()
  })
})

describe("getEqualValue", () => {
  test("return result when one value", () => {
    expect(getEqualValue([{ first: 1, second: 2 }])?.value).toEqual({
      first: 1,
      second: 2
    })
  })

  test("return result when two equal", () => {
    expect(
      getEqualValue([
        { first: 1, second: 2 },
        { first: 1, second: 2 }
      ])?.value
    ).toEqual({ first: 1, second: 2 })
  })

  test("return undefined when two equal and one different", () => {
    expect(
      getEqualValue([
        { first: 1, second: 2 },
        { first: 1, second: 2 },
        { first: 1, second: 3 }
      ])?.value
    ).toBeUndefined()
  })

  test("return result when three equal", () => {
    expect(
      getEqualValue([
        { first: 1, second: 2 },
        { first: 1, second: 2 },
        { first: 1, second: 2 }
      ])?.value
    ).toEqual({ first: 1, second: 2 })
  })

  test("return result when two equal but different order", () => {
    expect(
      getEqualValue([
        { first: 1, second: 2 },
        { second: 2, first: 1 }
      ])?.value
    ).toEqual({ first: 1, second: 2 })
  })
})

describe("compileFiles", () => {
  test("Produces two files which match snapshots", async () => {
    const fileLists = await compileFiles()

    expect(fileLists.index).toMatchSnapshot()
    expect(fileLists.react).toMatchSnapshot()
  })
})
