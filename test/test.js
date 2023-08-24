// Node script to run tests
// using build/NodeXPath.cjs
import { x } from "../build/NodeXPath.cjs"

// Test 1
console.log("Test 1")
const res = await x.search({ term: "test" })

console.log(res)
