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
    expect(getEqualValue({ foo: { first: 1, second: 2 } }))
      .toMatchInlineSnapshot(`
      Object {
        "sources": Array [
          "foo",
        ],
        "value": Object {
          "first": 1,
          "second": 2,
        },
      }
    `)
  })

  test("return result when two equal", () => {
    expect(
      getEqualValue({
        foo: { first: 1, second: 2 },
        bar: { first: 1, second: 2 }
      })
    ).toMatchInlineSnapshot(`
      Object {
        "sources": Array [
          "foo",
          "bar",
        ],
        "value": Object {
          "first": 1,
          "second": 2,
        },
      }
    `)
  })

  test("return undefined when two equal and one different", () => {
    expect(
      getEqualValue({
        foo: { first: 1, second: 2 },
        bar: { first: 1, second: 2 },
        hoo: { first: 1, second: 3 }
      })
    ).toBeUndefined()
  })

  test("return result when three equal", () => {
    expect(
      getEqualValue({
        foo: { first: 1, second: 2 },
        bar: { first: 1, second: 2 },
        hoo: { first: 1, second: 2 }
      })
    ).toMatchInlineSnapshot(`
      Object {
        "sources": Array [
          "foo",
          "bar",
          "hoo",
        ],
        "value": Object {
          "first": 1,
          "second": 2,
        },
      }
    `)
  })

  test("return result when two equal but different order", () => {
    expect(
      getEqualValue({
        foo: { first: 1, second: 2 },
        bar: { second: 2, first: 1 }
      })
    ).toMatchInlineSnapshot(`
      Object {
        "sources": Array [
          "foo",
          "bar",
        ],
        "value": Object {
          "first": 1,
          "second": 2,
        },
      }
    `)
  })
})

describe("compileFiles", () => {
  test("Produces two files which match snapshots", async () => {
    const fileLists = await compileFiles()

    expect(fileLists.index).toMatchSnapshot()
    expect(fileLists.react).toMatchSnapshot()
  })
})
