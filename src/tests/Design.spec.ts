import { Design } from "../models/Design.js"

describe('Design', () => {
  describe('should throw an error when getting a Design of an unqualified value type', () => {
    it.each([null, undefined, 0, 'string', 123, Symbol('symbol'), {}])('trying on %p should throw the error', (attempt) => {
      expect(() => Design.for(attempt as any)).toThrowError()
    })
  })
  describe('should throw and error when use trait unqualified value type', () => {
    it.each([null, undefined, 0, 'string', 123, Symbol('symbol'), {}])('trying on %p should throw the error', (attempt) => {
      expect(() => Design.for(function() {}, true).use(attempt as any)).toThrowError()
    })
  })
})
