import expect from 'expect';
import {serializeError, deserializeError} from "../src/seneca-wrapper"

describe("SenecaWrapper", () => {
  context("serializeError", () => {
    it("should return error as object", () => {
      const e = new Error("hello")
      expect(serializeError(e)).toBeA(Object)
    })
    it("should show Error name", () => {
      const e = new Error("error")
      e.name = "hello"
      expect(serializeError(e)).toInclude({name: 'hello'})
    })
    it("should show Error stack", () => {
      const e = new Error("error")
      expect(serializeError(e)).toIncludeKey("stack")
    })
    it("should show errors data", () => {
      const e = new Error("error")
      e.errors = [
        {key: "eieie", value: "fffff"},
        {key: "1", value: "2"}
      ]
      expect(serializeError(e)).toInclude({errors: e.errors})
    })
    it("should show other Error property", () => {
      const e = new Error("error")
      e.firstName = "John"
      e.lastName = "Doe"
      expect(serializeError(e)).toInclude({firstName: 'John', lastName: "Doe"})
    })
  })
  context("deserializeError", () => {
    it("should be error instance", () => {
      const e = {message: "hello", name: "GoodError"}
      const error = deserializeError(e)
      expect(error).toBeAn(Error)
    })
    it("should have key-value from the object", () => {
      const e = {message: "hello", name: "GoodError", firstName: "John", user: {id: 1, lastName: "Doe"}}
      const error = deserializeError(e)
      expect(error).toBeAn(Error)
      expect(error.firstName).toBe("John")
      expect(error.user).toInclude({id: 1, lastName: "Doe"})
    })
  })
})