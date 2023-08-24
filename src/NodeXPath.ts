import fs from "fs-extra"
import nodePath from "path"
import glob, { Glob } from "glob-promise"

export type NodeXPathType = "file" | "dir"

export class NodeXPath<TJson = any> {
  static sep = nodePath.sep

  static async fromPath<TJson>(fullPath: string, loadContent = false, parseJson = false): Promise<NodeXPath<TJson>> {
    let x = new NodeXPath()
    await x.setPath(fullPath, loadContent, parseJson)
    return x
  }

  static async fromPathWithContent<TJson>(
    fullPath: string,
    content: string,
    parseJson = false
  ): Promise<NodeXPath<TJson>> {
    let x = new NodeXPath()
    await x.setPath(fullPath, false, false)
    await x.setContent(content, parseJson)
    return x
  }

  static async fromRelPath(root: string, relPath: string, loadContent = false, parseJson = false) {
    let x = new NodeXPath()
    await x.setRelPath(root, relPath, loadContent, parseJson)
    return x
  }

  static async fromRelPathWithContent(root: string, relPath: string, content: string, parseJson = false) {
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

  async setPath(fullPath: string, loadContent = false, parseJson = false) {
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

  async setRelPath(root: string, relPath: string, loadContent = false, parseJson = false) {
    this.fullPath = nodePath.join(root, relPath)
    await this.setPath(this.fullPath, loadContent, parseJson)
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

  join(path: string) {
    let fullPath = nodePath.join(this.fullPath, path)
    return fullPath
  }

  joinTo(path: string) {
    let fullPath = nodePath.join(path, this.fullPath)
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
    let dirs = children.filter(item => item.isDirectory())
    return dirs
  }
  async getChildFiles() {
    if (this.type === "file") return []
    let children = await fs.readdir(this.fullPath, { withFileTypes: true })
    let files = children.filter(item => item.isFile())
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

  addIndent(indent = _indent) {
    this.content = indent + this.content.replace(/\n/g, "\n" + indent)
    return this
  }

  lines() {
    return this.content.split("\n")
  }

  minIndent(max = "        ") {
    let baseIndent = max
    let lines = this.lines()
    for (const line of lines) {
      if (emptyLineRegex.test(line)) continue // exclude empty lines
      if (line[1].length < baseIndent.length) {
        let indent = line.match(indentRegex)
        if (!indent) continue
        if (line[1].length === 0) return ""
        baseIndent = line[1]
      }
    }
    return baseIndent
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
export function fx(fullPath: string) {
  return NodeXPath.fromPath(fullPath)
}

export const indentRegex = /^\s*/
export const emptyLineRegex = /^\s*$/

let _indent = "    "
export const setIndent = (indent: string) => {
  _indent = indent
}

export const standardGlobIngorePattern = ["**/bin/**", "**/node_modules/**", "**/obj/**"]
export const processCwd = process.cwd()
export enum FileSearchType {
  /** Search for a file with the exact name */
  exact = "exact",
  /** Search for a file with the name starting with the search term */
  start = "start",
  /** Search for a file with the name ending with the search term */
  end = "end",
  /** Search for a file with the name containing the search term */
  contains = "contains",
}

export type constructGlobPatternOptions = {
  /** string to search for (using the defined searchType)  */
  searchTerm?: string | string[]
  /** default is 'conrains'  */
  searchType?: FileSearchType
  /** Allow finding files with multiple extension - Ex: searchTerm: file, ext: ts (will find: file.ts and file.util.ts)  */
  multiplePreExtensions?: boolean
  /** file extention */
  ext?: string | string[]
}

export const constructGlobPattern = (options: constructGlobPatternOptions = {}) => {
  const { searchTerm, ext, searchType = FileSearchType.contains, multiplePreExtensions = false } = options
  let pattern = `**/`
  switch (searchType) {
    case FileSearchType.exact:
      pattern += `${searchTerm}`
      break
    case FileSearchType.start:
      pattern += `${searchTerm}*`
      break
    case FileSearchType.end:
      pattern += `*${searchTerm}`
      break
    case FileSearchType.contains:
      pattern += `*${searchTerm}*`
      break
  }
  if (multiplePreExtensions) {
    pattern += `?(.!(.))`
  }
  if (ext) {
    pattern += `.${ext}`
  }
  return pattern
}

export const x = {
  fromPath: NodeXPath.fromPath,
  fromPathWithContent: NodeXPath.fromPathWithContent,
  fromRelPath: NodeXPath.fromRelPath,
  fromRelPathWithContent: NodeXPath.fromRelPathWithContent,
  sep: nodePath.sep,
  processCwd,
  standardGlobIngorePattern,
  async glob(
    pattern: string,
    { ignore = standardGlobIngorePattern, cwd = processCwd, nocase = true, dot = true } = {}
  ) {
    return await glob(pattern, {
      ignore,
      cwd,
      nocase,
      dot,
    })
  },
  /** Wrap on glob search. Creates a glob pattern: '**./*<searchTerm>*' */
  async searchFileName(
    options: constructGlobPatternOptions & {
      ignore?: string[]
      cwd?: string
      nocase?: boolean
      dot?: boolean
    } = {}
  ) {
    const { ignore, cwd, nocase, dot, ...searchOptions } = options
    const pattern = constructGlobPattern({ ...searchOptions })
    return await glob(pattern, {
      ignore,
      cwd,
      nocase,
      dot,
    })
  },
  filename(fullPath: string) {
    return nodePath.basename(fullPath)
  },
  dir(fullPath: string) {
    return nodePath.dirname(fullPath)
  },
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
  async load(
    fullPath: string,
    {
      stripReturnFeed = true,
      defaultContent = "",
      encoding = "utf8",
    }: {
      stripReturnFeed?: boolean
      defaultContent?: string
      encoding?: BufferEncoding
    } = {}
  ) {
    if (!(await fs.pathExists(fullPath))) {
      return defaultContent
    }
    const content = await fs.readFile(fullPath, { encoding })
    if (stripReturnFeed) {
      return content.replace(/\r\n/g, "\n")
    }
    return content
  },
  loadSync(
    fullPath: string,
    {
      stripReturnFeed = true,
      defaultContent = "",
      encoding = "utf8",
    }: {
      stripReturnFeed?: boolean
      defaultContent?: string
      encoding?: BufferEncoding
    } = {}
  ) {
    if (!fs.pathExistsSync(fullPath)) {
      return defaultContent
    }
    const content = fs.readFileSync(fullPath, { encoding })
    if (stripReturnFeed) {
      return content.replace(/\r\n/g, "\n")
    }
    return content
  },
  async loadJson<TJson extends object>(
    fullPath: string,
    {
      stripReturnFeed = true,
      defaultContent = {} as TJson,
      encoding = "utf8",
    }: { stripReturnFeed?: boolean; defaultContent?: TJson; encoding?: BufferEncoding } = {}
  ): Promise<TJson> {
    if (!(await fs.pathExists(fullPath))) {
      return defaultContent as TJson
    }
    let c = await x.load(fullPath, { stripReturnFeed, encoding })
    try {
      return JSON.parse(c) as TJson
    } catch (e) {
      console.log?.("NodeXPath - loadJson SyntaxError:", e)
    }
    return defaultContent as TJson
  },
  loadJsonSync<TJson extends object>(
    fullPath: string,
    {
      stripReturnFeed = true,
      defaultContent = {} as TJson,
      encoding = "utf8",
    }: { stripReturnFeed?: boolean; defaultContent?: TJson; encoding?: BufferEncoding } = {}
  ): TJson {
    if (!fs.pathExistsSync(fullPath)) {
      return defaultContent as TJson
    }
    let c = x.loadSync(fullPath, { stripReturnFeed, encoding })
    try {
      return JSON.parse(c) as TJson
    } catch (e) {
      console.log?.("NodeXPath - loadJson SyntaxError:", e)
    }
    return defaultContent as TJson
  },
  async save(fullPath: string, content: string, { encoding = "utf8" }: { encoding?: BufferEncoding } = {}) {
    await fs.ensureDir(nodePath.dirname(fullPath))
    await fs.writeFile(fullPath, content, { encoding })
  },
  saveSync(fullPath: string, content: string, { encoding = "utf8" }: { encoding?: BufferEncoding } = {}) {
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
  async children(fullPath: string, { encoding, recursive }: { encoding?: BufferEncoding; recursive?: boolean } = {}) {
    let exists = await fs.pathExists(fullPath)
    if (!exists) return []
    let children = await fs.readdir(fullPath, { withFileTypes: true, recursive, encoding })
    return children
  },
  async childDirs(fullPath: string, { encoding, recursive }: { encoding?: BufferEncoding; recursive?: boolean } = {}) {
    let exists = await fs.pathExists(fullPath)
    if (!exists) return []
    let children = await fs.readdir(fullPath, { withFileTypes: true, encoding, recursive })
    let dirs = children.filter(item => item.isDirectory())
    return dirs
  },
  async childFiles(fullPath: string, { encoding, recursive }: { encoding?: BufferEncoding; recursive?: boolean } = {}) {
    let exists = await fs.pathExists(fullPath)
    if (!exists) return []
    let children = await fs.readdir(fullPath, { withFileTypes: true, encoding, recursive })
    let files = children.filter(item => item.isFile())
    return files
  },
  relativeTo: (from: string, to: string) => {
    return nodePath.relative(from, to)
  },
}
