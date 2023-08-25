import fs from "fs-extra"
import nodePath from "path"
import { glob } from "glob-promise"

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

export type GlobSearchOptions = {
  /** ignore patterns (default: ["**\/bin\/**", "**\/node_modules\/**", "**\/obj\/**"]) */
  ignore?: string[]
  /** current working directory (root for search) (default: process.cwd()) */
  cwd?: string
  /** Use case-insensitive match (default: true) */
  nocase?: boolean
  /** Include files staring with dot */
  dot?: boolean
  /** Add ignore patterns to default ignore patterns */
  addIgnore?: string[]
  /** Return full path instead of sub-path from cwd (default: true) */
  fullPaths?: boolean
}

export type SearchOptions = {
  /** Filter the search (glob) by match of file content (RegExp or contain string) */
  match?: string | RegExp
  /** Filter the search (glob) by match of file path (RegExp or contain string) */
  pathMatch?: string | RegExp
}

export type SearchResult = {
  path: string
  content: string
}
export type SearchJsonResult<T extends object = object> = {
  path: string
  json: T
}

export type GlobPatternOptions = {
  /** string to search for (using the defined searchType)  */
  term?: string | string[]
  /** default is 'conrains'  */
  searchType?: FileSearchType
  /** Allow finding files with multiple extension - Ex: searchTerm: file, ext: ts (will find: file.ts and file.util.ts)  */
  allowMultipleExt?: boolean
  /** file extention */
  ext?: string | string[]
  /** [default = true] most have an extention (most files have - can be used to sort out folders) */
  mustHaveExt?: string
}

export const constructGlobPattern = (options: GlobPatternOptions = {}) => {
  const { term, ext, mustHaveExt = true, searchType = FileSearchType.contains, allowMultipleExt = false } = options
  let pattern = `**/`
  if (term) {
    switch (searchType) {
      case FileSearchType.exact:
        pattern += `${term}`
        break
      case FileSearchType.start:
        pattern += `${term}*`
        break
      case FileSearchType.end:
        pattern += `*${term}`
        break
      case FileSearchType.contains:
        pattern += `*${term}*`
        break
    }
  } else {
    pattern += `*`
  }
  if (allowMultipleExt) {
    pattern += `?(.!(.))`
  }
  if (ext) {
    if (Array.isArray(ext)) {
      pattern += `.+(${ext.join("|")})`
    } else {
      pattern += `.${ext}`
    }
  }
  if (mustHaveExt && !ext) {
    pattern += `.*`
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
  /** Wrap on glob search */
  async glob(pattern: string, options?: GlobSearchOptions) {
    let {
      ignore = standardGlobIngorePattern,
      cwd = processCwd,
      nocase = true,
      dot = true,
      addIgnore,
      fullPaths,
    } = options ?? {}
    if (addIgnore) {
      ignore = [...ignore, ...addIgnore]
    }
    let result = await glob.glob(pattern, {
      ignore,
      cwd,
      nocase,
      dot,
    })
    if (fullPaths) {
      result = result.map(item => nodePath.join(cwd, item))
    }
    return result
  },
  /** Wrap on glob search. Creates a glob pattern: '**./*<searchTerm>*' */
  async searchPath(options?: GlobPatternOptions & GlobSearchOptions) {
    const {
      addIgnore,
      ignore = standardGlobIngorePattern,
      cwd = processCwd,
      nocase = true,
      dot = true,
      fullPaths = true,
      ...searchOptions
    } = options ?? {}
    const pattern = constructGlobPattern({ ...searchOptions })
    return await x.glob(pattern, {
      ignore,
      cwd,
      nocase,
      dot,
      addIgnore,
      fullPaths,
    })
  },
  /** Search for files. Return path and content (using searchPath) */
  async search(options?: GlobPatternOptions & GlobSearchOptions & SearchOptions) {
    const { match, pathMatch, ...searchOptions } = options ?? {}
    const filePaths = await x.searchPath({ ...searchOptions })
    const matchRegex = match ? new RegExp(match) : undefined
    const pathMatchRegex = pathMatch ? new RegExp(pathMatch) : undefined
    let results: SearchResult[] = []
    for (const filePath of filePaths) {
      let content = await x.load(filePath)
      if (matchRegex && !matchRegex.test(content)) continue
      if (pathMatchRegex && !pathMatchRegex.test(filePath)) continue
      results.push({ path: filePath, content })
    }
    return results
  },
  /** Search for json files. Return path and json  (using search)*/
  async searchJson<T extends object = object>(options?: GlobPatternOptions & GlobSearchOptions & SearchOptions) {
    const { ext = "json" } = options ?? {}
    const searchResults = await x.search({ ...options, ext })
    let results: SearchJsonResult<T>[] = []
    for (const searchResult of searchResults) {
      let json = x.parseJson<T>(searchResult.content)
      if (!json) continue
      results.push({ path: searchResult.path, json })
    }
    return results
  },
  /** Search for one file. Return path (using searchPath)*/
  async findPath(options?: GlobPatternOptions & GlobSearchOptions): Promise<string | undefined> {
    const paths = await x.searchPath(options)
    return paths?.[0]
  },
  /** Search for one file. Return path and content (using findPath)*/
  async find(options?: GlobPatternOptions & GlobSearchOptions & SearchOptions): Promise<SearchResult | undefined> {
    const path = await x.findPath(options)
    if (!path) return undefined
    const content = await x.load(path)
    return { path, content }
  },
  /** Search for one json file. Return path and json (uses find)*/
  async findJson<T extends object = object>(options?: GlobPatternOptions & GlobSearchOptions & SearchOptions) {
    const { ext = "json" } = options ?? {}
    const searchResult = await x.find({ ...options, ext })
    if (!searchResult) return undefined
    let results: SearchJsonResult<T>[] = []
    let json = x.parseJson<T>(searchResult.content)
    if (!json) return undefined
    results.push({ path: searchResult.path, json })
    return results
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
  parseJson<TJson>(content: string) {
    try {
      return JSON.parse(content) as TJson
    } catch (e) {
      if (e instanceof SyntaxError) {
        console.log?.("NodeXPath - ParseJson SyntaxError:\n", e, content)
      } else {
        console.log?.("NodeXPath - ParseJson ParseError:", e)
      }
    }
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
    return x.parseJson<TJson>(c) ?? defaultContent
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
