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
    parseJsonContent(): this | undefined;
    parseJson<TJson>(): TJson | undefined;
}
declare function X(fullPath: string): Promise<NodeXPath<unknown>>;
declare namespace X {
    export var fromPath: typeof NodeXPath.fromPath;
    export var fromPathWithContent: typeof NodeXPath.fromPathWithContent;
    export var fromRelPath: typeof NodeXPath.fromRelPath;
    export var fromRelPathWithContent: typeof NodeXPath.fromRelPathWithContent;
    export var sep: "\\" | "/";
    export var load: (fullPath: string) => Promise<string>;
    export var loadJson: <TJson>(fullPath: string) => Promise<TJson | undefined>;
    export var save: (fullPath: string, content: string, encoding?: BufferEncoding) => Promise<void>;
    var _a: (fullPath: string) => Promise<void>;
    export var exists: (fullPath: string) => Promise<boolean>;
    export var ensureDir: (fullPath: string) => Promise<void>;
    export var isFile: (fullPath: string) => Promise<boolean>;
    export var isDir: (fullPath: string) => Promise<boolean>;
    export var children: (fullPath: string) => Promise<fs.Dirent[]>;
    export var childDirs: (fullPath: string) => Promise<fs.Dirent[]>;
    export var childFiles: (fullPath: string) => Promise<fs.Dirent[]>;
    export var relativeTo: (from: string, to: string) => string;
    export { _a as delete };
}
export default X;
