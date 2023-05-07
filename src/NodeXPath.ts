import fs from "fs-extra"
import path from "path"
import nodePath from "path"

export type NodeXPathType = "file" | "dir"

export class NodeXPath<TJson = any> {
  static sep = nodePath.sep

  static async fromPath<TJson>(
    fullPath: string,
    loadContent = false,
    parseJson = true,
  ): Promise<NodeXPath<TJson>> {
    let x = new NodeXPath().setPath(fullPath, loadContent, parseJson)
    return x
  }

  static async fromPathWithContent<TJson>(
    fullPath: string,
    content: string,
    parseJson = true,
  ): Promise<NodeXPath<TJson>> {
    let x = new NodeXPath()
    await x.setPath(fullPath, false, false)
    await x.setContent(content, parseJson)
    return x
  }

  static async fromRelPath(
    root: string,
    relPath: string,
    loadContent = false,
    parseJson = true,
  ) {
    let x = new NodeXPath()
    x.setRelPath(root, relPath, loadContent, parseJson)
    return x
  }

  static async fromRelPathWithContent(
    root: string,
    relPath: string,
    content: string,
    parseJson = true,
  ) {
    let x = new NodeXPath()
    await x.setRelPath(root, relPath, false, false)
    await x.setContent(content, parseJson)
    return x
  }

  fullPath: string = ""
  exists = false
  stat: fs.Stats | undefined = undefined
  type: NodeXPathType = "file"
  loaded = false
  content = ""
  json: TJson | undefined = undefined
  // Parsed path
  basename = ""
  ext = ""
  dir = ""
  parentDir = ""

  sep = nodePath.sep

  async setPath(fullPath: string, loadContent = false, parseJson = true) {
    this.fullPath = fullPath
    this.exists = await fs.pathExists(fullPath)
    this.stat = await fs.stat(fullPath)
    this.type = this.stat.isFile() ? "file" : "dir"
    this.basename = nodePath.basename(this.fullPath)
    this.ext = nodePath.extname(this.fullPath)
    this.dir = this.type === "dir" ? this.fullPath : nodePath.dirname(this.fullPath)
    this.parentDir = nodePath.dirname(this.dir)
    if (this.type === "file" && loadContent) {
      this.content = await fs.readFile(this.fullPath, { encoding: "utf8" })
      this.loaded = true
      if (parseJson) {
        this.parseJsonContent()
      }
    }
    return this
  }

  async setRelPath(root: string, relPath: string, loadContent = false, parseJson = true) {
    this.fullPath = nodePath.join(root, relPath)
    this.setPath(this.fullPath, loadContent, parseJson)
    return this
  }

  relativeTo(to: string) {
    let fullPath = nodePath.relative(this.fullPath, to)
    return fullPath
  }

  relativeFrom(from: string) {
    let fullPath = nodePath.relative(from, this.fullPath)
    return fullPath
  }

  async getChildren() {
    if (this.type === "file") return []
    let children = await fs.readdir(this.fullPath, { withFileTypes: true })
    return children
  }
  async getChildDirs() {
    if (this.type === "file") return []
    let children = await fs.readdir(this.fullPath, { withFileTypes: true })
    let dirs = children.filter((item) => item.isDirectory())
    return dirs
  }
  async getChildFiles() {
    if (this.type === "file") return []
    let children = await fs.readdir(this.fullPath, { withFileTypes: true })
    let files = children.filter((item) => item.isFile())
    return files
  }

  async loadContent(parseJson = true) {
    this.content = await fs.readFile(this.fullPath, { encoding: "utf8" })
    this.loaded = true
    if (parseJson) {
      this.parseJsonContent()
    }
    return this
  }

  async setContent(content: string, parseJson = true) {
    this.content = content
    this.loaded = true
    if (parseJson) {
      this.parseJsonContent()
    }
    return this
  }

  async ensurePath() {
    await fs.ensureDir(this.dir)
  }

  async save(encoding: BufferEncoding = "utf8") {
    if (this.type !== "file") return undefined
    await this.ensurePath()
    await fs.writeFile(this.fullPath, this.content, { encoding })
    this.exists = true
    return this
  }

  async delete() {
    if (this.type === "file" && this.exists) {
      await fs.remove(this.fullPath)
      this.exists = false
    }
  }

  replaceContent(regex: RegExp, replacement: string) {
    this.content = this.content.replace(regex, replacement)
    return this
  }

  replacePath(regex: RegExp, replacement: string) {
    this.fullPath = this.fullPath.replace(regex, replacement)
    return this
  }

  replaceLines(callback: (line: string, index: number) => void) {
    let lines = this.content
      .split("\n")
      .map((line, index) => {
        return callback(line, index)
      })
      .join("\n")
    this.content = lines
    return this
  }

  parseJsonContent() {
    if (this.type !== "file") return undefined
    if (!this.content) return undefined
    try {
      this.json = JSON.parse(this.content) as TJson
    } catch (e) {
      if (e instanceof SyntaxError) {
        console.log?.("NodeXPath - ParseJson SyntaxError:", e)
      }
    }
    return this
  }

  parseJson<TJson>() {
    if (this.type !== "file") return undefined
    if (!this.content) return undefined
    try {
      return JSON.parse(this.content) as TJson
    } catch (e) {
      if (e instanceof SyntaxError) {
        console.log?.("NodeXPath - ParseJson SyntaxError:", e)
      }
    }
  }
}

// Factory
function X(fullPath: string) {
  return NodeXPath.fromPath(fullPath)
}
X.fromPath = NodeXPath.fromPath
X.fromPathWithContent = NodeXPath.fromPathWithContent
X.fromRelPath = NodeXPath.fromRelPath
X.fromRelPathWithContent = NodeXPath.fromRelPathWithContent
X.sep = nodePath.sep
X.load = async (fullPath: string) => {
  return await fs.readFile(fullPath, { encoding: "utf8" })
}
X.loadJson = async <TJson>(fullPath: string) => {
  let c = await fs.readFile(fullPath, { encoding: "utf8" })
  try {
    return JSON.parse(c) as TJson
  } catch (e) {
    console.log?.("NodeXPath - loadJson SyntaxError:", e)
  }
}
X.save = async (fullPath: string, content: string, encoding: BufferEncoding = "utf8") => {
  await fs.ensureDir(nodePath.dirname(fullPath))
  await fs.writeFile(fullPath, content, { encoding })
}
X.delete = async (fullPath: string) => {
  if (await fs.pathExists(fullPath)) {
    await fs.remove(fullPath)
  }
}
X.exists = async (fullPath: string) => {
  return await fs.pathExists(fullPath)
}
X.ensureDir = async (fullPath: string) => {
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
}
X.isFile = async (fullPath: string) => {
  let exists = await fs.pathExists(fullPath)
  if (!exists) return false
  let stat = await fs.stat(fullPath)
  return stat.isFile()
}
X.isDir = async (fullPath: string) => {
  let exists = await fs.pathExists(fullPath)
  if (!exists) return false
  let stat = await fs.stat(fullPath)
  return stat.isDirectory()
}
X.children = async (fullPath: string) => {
  let exists = await fs.pathExists(fullPath)
  if (!exists) return []
  let children = await fs.readdir(fullPath, { withFileTypes: true })
  return children
}
X.childDirs = async (fullPath: string) => {
  let exists = await fs.pathExists(fullPath)
  if (!exists) return []
  let children = await fs.readdir(fullPath, { withFileTypes: true })
  let dirs = children.filter((item) => item.isDirectory())
  return dirs
}
X.childFiles = async (fullPath: string) => {
  let exists = await fs.pathExists(fullPath)
  if (!exists) return []
  let children = await fs.readdir(fullPath, { withFileTypes: true })
  let files = children.filter((item) => item.isFile())
  return files
}
X.relativeTo = (from: string, to: string) => {
  return nodePath.relative(from, to)
}

export default X
