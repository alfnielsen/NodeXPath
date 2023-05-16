# NodeXPath

Join Helper methods for fs and path (Most likely one of a millions other similar helper libs!!)

Ex:

```ts
import { x } from "node-x-path"

const c = await x.load("path/to/file.txt")
```

Code:

```ts
// (... Class version ...)

export const x = {
  fromPath: NodeXPath.fromPath,
  fromPathWithContent: NodeXPath.fromPathWithContent,
  fromRelPath: NodeXPath.fromRelPath,
  fromRelPathWithContent: NodeXPath.fromRelPathWithContent,
  sep: nodePath.sep,
  join(...paths: string[]) {
    let fullPath = nodePath.join(...paths)
    return fullPath
  },
  lines(content: string) {
    return content.split("\n")
  },
  trimEmptyLines(content: string) {
    return content.replace(/^\s*\n/, "").replace(/\n\s*$/, "") // remove empty lines from start and end
  },
  removeEmptyLines(content: string) {
    // remove each empty line
    return content.replace(/^\s*\n/gm, "")
  },
  addIndent: (content: string, indent = _indent) => {
    return indent + content.replace(/\n/g, "\n" + indent)
  },
  removeIndent: (content: string, indent = _indent) => {
    return content.replace(new RegExp(`(^|\n)${indent}`, "g"), "\n")
  },
  minIndent: (content: string, max = "        ") => {
    let baseIndent = max
    let lines = content.split("\n")
    for (const line of lines) {
      if (line.length === 0 || emptyLineRegex.test(line)) continue // exclude empty lines
      let indent = line.match(indentRegex)
      if (!indent) continue
      if (indent[0].length === 0) return ""
      if (indent[0].length < baseIndent.length) {
        baseIndent = indent[0]
      }
    }
    return baseIndent
  },
  load: async (fullPath: string, stripReturnFeed = true) => {
    const content = await fs.readFile(fullPath, { encoding: "utf8" })
    if (stripReturnFeed) {
      return content.replace(/\r\n/g, "\n")
    }
    return content
  },
  loadJson: async <TJson>(fullPath: string, stripReturnFeed = true) => {
    let c = await x.load(fullPath, stripReturnFeed)
    try {
      return JSON.parse(c) as TJson
    } catch (e) {
      console.log?.("NodeXPath - loadJson SyntaxError:", e)
    }
  },
  save: async (fullPath: string, content: string, encoding: BufferEncoding = "utf8") => {
    await fs.ensureDir(nodePath.dirname(fullPath))
    await fs.writeFile(fullPath, content, { encoding })
  },
  delete: async (fullPath: string) => {
    if (await fs.pathExists(fullPath)) {
      await fs.remove(fullPath)
    }
  },
  exists: async (fullPath: string) => {
    return await fs.pathExists(fullPath)
  },
  ensureDir: async (fullPath: string) => {
    let exists = await fs.pathExists(fullPath)
    let dir = fullPath
    if (exists) {
      let stat = await fs.stat(fullPath)
      let isFile = stat.isFile()
      if (isFile) {
        dir = nodePath.dirname(fullPath)
      }
      await fs.ensureDir(dir)
      return
    }
    let p = nodePath.parse(fullPath)
    if (p.ext) {
      dir = nodePath.dirname(fullPath)
    }
    await fs.ensureDir(dir)
  },
  isFile: async (fullPath: string) => {
    let exists = await fs.pathExists(fullPath)
    if (!exists) return false
    let stat = await fs.stat(fullPath)
    return stat.isFile()
  },
  isDir: async (fullPath: string) => {
    let exists = await fs.pathExists(fullPath)
    if (!exists) return false
    let stat = await fs.stat(fullPath)
    return stat.isDirectory()
  },
  children: async (fullPath: string) => {
    let exists = await fs.pathExists(fullPath)
    if (!exists) return []
    let children = await fs.readdir(fullPath, { withFileTypes: true })
    return children
  },
  childDirs: async (fullPath: string) => {
    let exists = await fs.pathExists(fullPath)
    if (!exists) return []
    let children = await fs.readdir(fullPath, { withFileTypes: true })
    let dirs = children.filter((item) => item.isDirectory())
    return dirs
  },
  childFiles: async (fullPath: string) => {
    let exists = await fs.pathExists(fullPath)
    if (!exists) return []
    let children = await fs.readdir(fullPath, { withFileTypes: true })
    let files = children.filter((item) => item.isFile())
    return files
  },
  relativeTo: (from: string, to: string) => {
    return nodePath.relative(from, to)
  },
}
```
