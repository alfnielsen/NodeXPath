/// <reference types="node" />
/// <reference types="node" />
import fs from "fs-extra";
export type NodeXPathType = "file" | "dir";
export declare class NodeXPath<TJson = any> {
    static sep: "\\" | "/";
    static fromPath<TJson>(fullPath: string, loadContent?: boolean, parseJson?: boolean): Promise<NodeXPath<TJson>>;
    static fromPathWithContent<TJson>(fullPath: string, content: string, parseJson?: boolean): Promise<NodeXPath<TJson>>;
    static fromRelPath(root: string, relPath: string, loadContent?: boolean, parseJson?: boolean): Promise<NodeXPath<any>>;
    static fromRelPathWithContent(root: string, relPath: string, content: string, parseJson?: boolean): Promise<NodeXPath<any>>;
    fullPath: string;
    exists: boolean;
    stat: fs.Stats | undefined;
    type: NodeXPathType;
    loaded: boolean;
    content: string;
    json: TJson | undefined;
    basename: string;
    ext: string;
    dir: string;
    parentDir: string;
    sep: "\\" | "/";
    setPath(fullPath: string, loadContent?: boolean, parseJson?: boolean): Promise<this>;
    setRelPath(root: string, relPath: string, loadContent?: boolean, parseJson?: boolean): Promise<this>;
    relativeTo(to: string): string;
    relativeFrom(from: string): string;
    join(path: string): string;
    joinTo(path: string): string;
    getChildren(): Promise<fs.Dirent[]>;
    getChildDirs(): Promise<fs.Dirent[]>;
    getChildFiles(): Promise<fs.Dirent[]>;
    loadContent(parseJson?: boolean): Promise<this>;
    setContent(content: string, parseJson?: boolean): Promise<this>;
    ensurePath(): Promise<void>;
    save(encoding?: BufferEncoding): Promise<this | undefined>;
    delete(): Promise<void>;
    replaceContent(regex: RegExp, replacement: string): this;
    replacePath(regex: RegExp, replacement: string): this;
    replaceLines(callback: (line: string, index: number) => void): this;
    addIndent(indent?: string): this;
    lines(): string[];
    minIndent(max?: string): string;
    parseJsonContent(): this | undefined;
    parseJson<TJson>(): TJson | undefined;
}
export declare function fx(fullPath: string): Promise<NodeXPath<unknown>>;
export declare const indentRegex: RegExp;
export declare const emptyLineRegex: RegExp;
export declare const setIndent: (indent: string) => void;
export declare const standardGlobIngorePattern: string[];
export declare const processCwd: string;
export declare enum FileSearchType {
    /** Search for a file with the exact name */
    exact = "exact",
    /** Search for a file with the name starting with the search term */
    start = "start",
    /** Search for a file with the name ending with the search term */
    end = "end",
    /** Search for a file with the name containing the search term */
    contains = "contains"
}
export type GlobSearchOptions = {
    /** ignore patterns (default: ["**\/bin\/**", "**\/node_modules\/**", "**\/obj\/**"]) */
    ignore?: string[];
    /** current working directory (root for search) (default: process.cwd()) */
    cwd?: string;
    /** Use case-insensitive match (default: true) */
    nocase?: boolean;
    /** Include files staring with dot */
    dot?: boolean;
    /** Add ignore patterns to default ignore patterns */
    addIgnore?: string[];
    /** Return full path instead of sub-path from cwd (default: true) */
    fullPaths?: boolean;
};
export type SearchOptions = {
    /** Filter the search (glob) by match of file content (RegExp or contain string) */
    match?: string | RegExp;
    /** Filter the search (glob) by match of file path (RegExp or contain string) */
    pathMatch?: string | RegExp;
};
export type SearchResult = {
    path: string;
    content: string;
};
export type SearchJsonResult<T extends object = object> = {
    path: string;
    json: T;
};
export type GlobPatternOptions = {
    /** string to search for (using the defined searchType)  */
    term?: string | string[];
    /** default is 'conrains'  */
    searchType?: FileSearchType;
    /** Allow finding files with multiple extension - Ex: searchTerm: file, ext: ts (will find: file.ts and file.util.ts)  */
    allowMultipleExt?: boolean;
    /** file extention */
    ext?: string | string[];
    /** [default = true] most have an extention (most files have - can be used to sort out folders) */
    mustHaveExt?: string;
};
export declare const constructGlobPattern: (options?: GlobPatternOptions) => string;
export declare const x: {
    fromPath: typeof NodeXPath.fromPath;
    fromPathWithContent: typeof NodeXPath.fromPathWithContent;
    fromRelPath: typeof NodeXPath.fromRelPath;
    fromRelPathWithContent: typeof NodeXPath.fromRelPathWithContent;
    sep: "\\" | "/";
    processCwd: string;
    standardGlobIngorePattern: string[];
    /** Wrap on glob search */
    glob(pattern: string, options?: GlobSearchOptions): Promise<string[]>;
    /** Wrap on glob search. Creates a glob pattern: '**./*<searchTerm>*' */
    searchPath(options?: GlobPatternOptions & GlobSearchOptions): Promise<string[]>;
    /** Search for files. Return path and content (using searchPath) */
    search(options?: GlobPatternOptions & GlobSearchOptions & SearchOptions): Promise<SearchResult[]>;
    /** Search for json files. Return path and json  (using search)*/
    searchJson<T extends object = object>(options?: GlobPatternOptions & GlobSearchOptions & SearchOptions): Promise<SearchJsonResult<T>[]>;
    /** Search for one file. Return path (using searchPath)*/
    findPath(options?: GlobPatternOptions & GlobSearchOptions): Promise<string | undefined>;
    /** Search for one file. Return path and content (using findPath)*/
    find(options?: GlobPatternOptions & GlobSearchOptions & SearchOptions): Promise<SearchResult | undefined>;
    /** Search for one json file. Return path and json (uses find)*/
    findJson<T_1 extends object = object>(options?: GlobPatternOptions & GlobSearchOptions & SearchOptions): Promise<SearchJsonResult<T_1>[] | undefined>;
    filename(fullPath: string): string;
    dir(fullPath: string): string;
    join(...paths: string[]): string;
    lines(content: string): string[];
    trimEmptyLines(content: string): string;
    removeEmptyLines(content: string): string;
    addIndent: (content: string, indent?: string) => string;
    removeIndent: (content: string, indent?: string) => string;
    minIndent(content: string, max?: string): string;
    load(fullPath: string, { stripReturnFeed, defaultContent, encoding, }?: {
        stripReturnFeed?: boolean | undefined;
        defaultContent?: string | undefined;
        encoding?: BufferEncoding | undefined;
    }): Promise<string>;
    loadSync(fullPath: string, { stripReturnFeed, defaultContent, encoding, }?: {
        stripReturnFeed?: boolean | undefined;
        defaultContent?: string | undefined;
        encoding?: BufferEncoding | undefined;
    }): string;
    parseJson<TJson>(content: string): TJson | undefined;
    loadJson<TJson_1 extends object>(fullPath: string, { stripReturnFeed, defaultContent, encoding, }?: {
        stripReturnFeed?: boolean | undefined;
        defaultContent?: TJson_1 | undefined;
        encoding?: BufferEncoding | undefined;
    }): Promise<TJson_1>;
    loadJsonSync<TJson_2 extends object>(fullPath: string, { stripReturnFeed, defaultContent, encoding, }?: {
        stripReturnFeed?: boolean | undefined;
        defaultContent?: TJson_2 | undefined;
        encoding?: BufferEncoding | undefined;
    }): TJson_2;
    save(fullPath: string, content: string, { encoding }?: {
        encoding?: BufferEncoding | undefined;
    }): Promise<void>;
    saveSync(fullPath: string, content: string, { encoding }?: {
        encoding?: BufferEncoding | undefined;
    }): void;
    delete(fullPath: string): Promise<void>;
    deleteSync(fullPath: string): void;
    exists(fullPath: string): Promise<boolean>;
    existsSync(fullPath: string): boolean;
    ensureDir(fullPath: string): Promise<void>;
    ensureDirSync(fullPath: string): void;
    isFile(fullPath: string): Promise<boolean>;
    isFileSync(fullPath: string): boolean;
    isDir(fullPath: string): Promise<boolean>;
    isDirSync(fullPath: string): boolean;
    children(fullPath: string, { encoding, recursive }?: {
        encoding?: BufferEncoding | undefined;
        recursive?: boolean | undefined;
    }): Promise<fs.Dirent[]>;
    childDirs(fullPath: string, { encoding, recursive }?: {
        encoding?: BufferEncoding | undefined;
        recursive?: boolean | undefined;
    }): Promise<fs.Dirent[]>;
    childFiles(fullPath: string, { encoding, recursive }?: {
        encoding?: BufferEncoding | undefined;
        recursive?: boolean | undefined;
    }): Promise<fs.Dirent[]>;
    relativeTo: (from: string, to: string) => string;
};
