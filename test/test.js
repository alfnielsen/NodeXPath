// Node script to run tests
// using build/NodeXPath.cjs
import { x } from "../build/NodeXPath.cjs"

// x.searchPath
console.log("x.searchPath")
const searchPathResult = await x.searchPath({ term: "data" })
console.log(searchPathResult)

// x.search
console.log("x.search")
const searchResult = await x.search({ term: "data" })
console.log(searchResult)

// x.findPath
console.log("x.findPath")
const findPathResult = await x.findPath({ term: "data" })
console.log(findPathResult)

// x.find
console.log("x.find")
const findResult = await x.find({ term: "data" })
console.log(findResult)

// .searchJson
console.log(".searchJson")
const searchJsonResult = await x.searchJson({ term: "spiral" })
console.log(searchJsonResult)

// .findJson
console.log("x.findJson")
const findJsonResult = await x.findJson({ term: "spiral" })
console.log(findJsonResult)
