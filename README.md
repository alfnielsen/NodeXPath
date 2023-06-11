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
    return content.replace(/^(\s*\n)+/, "").replace(/(\n\s*)+$/, "") // remove empty lines from start and end
  },
  removeEmptyLines(content: string) {
    // remove each empty line
    return content.replace(/^\s*\n/gm, "")
  },
  addIndent: (content: string, indent = _indent) => {
    return content.replace(/(^|\n)/g, `$1${indent}`)
  },
  removeIndent: (content: string, indent = _indent) => {
    return content.replace(new RegExp(`(^|\n)${indent}`, "g"), "$1")
  },
  minIndent(content: string, max = "        ") {
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
  async load(fullPath: string, stripReturnFeed = true) {
    const content = await fs.readFile(fullPath, { encoding: "utf8" })
    if (stripReturnFeed) {
      return content.replace(/\r\n/g, "\n")
    }
    return content
  },
  loadSync(fullPath: string, stripReturnFeed = true) {
    const content = fs.readFileSync(fullPath, { encoding: "utf8" })
    if (stripReturnFeed) {
      return content.replace(/\r\n/g, "\n")
    }
    return content
  },
  async loadJson<TJson>(fullPath: string, stripReturnFeed = true) {
    let c = await x.load(fullPath, stripReturnFeed)
    try {
      return JSON.parse(c) as TJson
    } catch (e) {
      console.log?.("NodeXPath - loadJson SyntaxError:", e)
    }
  },
  loadJsonSync<TJson>(fullPath: string, stripReturnFeed = true) {
    let c = x.loadSync(fullPath, stripReturnFeed)
    try {
      return JSON.parse(c) as TJson
    } catch (e) {
      console.log?.("NodeXPath - loadJson SyntaxError:", e)
    }
  },
  async save(fullPath: string, content: string, encoding: BufferEncoding = "utf8") {
    await fs.ensureDir(nodePath.dirname(fullPath))
    await fs.writeFile(fullPath, content, { encoding })
  },
  saveSync(fullPath: string, content: string, encoding: BufferEncoding = "utf8") {
    fs.ensureDirSync(nodePath.dirname(fullPath))
    fs.writeFileSync(fullPath, content, { encoding })
  },
  async delete(fullPath: string) {
    if (await fs.pathExists(fullPath)) {
      await fs.remove(fullPath)
    }
  },
  deleteSync(fullPath: string) {
    if (fs.pathExistsSync(fullPath)) {
      fs.removeSync(fullPath)
    }
  },
  async exists(fullPath: string) {
    return await fs.pathExists(fullPath)
  },
  existsSync(fullPath: string) {
    return fs.pathExistsSync(fullPath)
  },
  async ensureDir(fullPath: string) {
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
  ensureDirSync(fullPath: string) {
    let exists = fs.pathExistsSync(fullPath)
    let dir = fullPath
    if (exists) {
      let stat = fs.statSync(fullPath)
      let isFile = stat.isFile()
      if (isFile) {
        dir = nodePath.dirname(fullPath)
      }
      fs.ensureDirSync(dir)
      return
    }
    let p = nodePath.parse(fullPath)
    if (p.ext) {
      dir = nodePath.dirname(fullPath)
    }
    fs.ensureDirSync(dir)
  },
  async isFile(fullPath: string) {
    let exists = await fs.pathExists(fullPath)
    if (!exists) return false
    let stat = await fs.stat(fullPath)
    return stat.isFile()
  },
  isFileSync(fullPath: string) {
    let exists = fs.pathExistsSync(fullPath)
    if (!exists) return false
    let stat = fs.statSync(fullPath)
    return stat.isFile()
  },
  async isDir(fullPath: string) {
    let exists = await fs.pathExists(fullPath)
    if (!exists) return false
    let stat = await fs.stat(fullPath)
    return stat.isDirectory()
  },
  isDirSync(fullPath: string) {
    let exists = fs.pathExistsSync(fullPath)
    if (!exists) return false
    let stat = fs.statSync(fullPath)
    return stat.isDirectory()
  },
  async children(fullPath: string) {
    let exists = await fs.pathExists(fullPath)
    if (!exists) return []
    let children = await fs.readdir(fullPath, { withFileTypes: true })
    return children
  },
  async childDirs(fullPath: string) {
    let exists = await fs.pathExists(fullPath)
    if (!exists) return []
    let children = await fs.readdir(fullPath, { withFileTypes: true })
    let dirs = children.filter((item) => item.isDirectory())
    return dirs
  },
  async childFiles(fullPath: string) {
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
