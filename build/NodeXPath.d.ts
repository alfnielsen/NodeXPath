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
export declare const x: {
    fromPath: typeof NodeXPath.fromPath;
    fromPathWithContent: typeof NodeXPath.fromPathWithContent;
    fromRelPath: typeof NodeXPath.fromRelPath;
    fromRelPathWithContent: typeof NodeXPath.fromRelPathWithContent;
    sep: "\\" | "/";
    join(...paths: string[]): string;
    lines(content: string): string[];
    trimEmptyLines(content: string): string;
    removeEmptyLines(content: string): string;
    addIndent: (content: string, indent?: string) => string;
    removeIndent: (content: string, indent?: string) => string;
    minIndent: (content: string, max?: string) => string;
    load: (fullPath: string, stripReturnFeed?: boolean) => Promise<string>;
    loadJson: <TJson>(fullPath: string, stripReturnFeed?: boolean) => Promise<TJson | undefined>;
    save: (fullPath: string, content: string, encoding?: BufferEncoding) => Promise<void>;
    delete: (fullPath: string) => Promise<void>;
    exists: (fullPath: string) => Promise<boolean>;
    ensureDir: (fullPath: string) => Promise<void>;
    isFile: (fullPath: string) => Promise<boolean>;
    isDir: (fullPath: string) => Promise<boolean>;
    children: (fullPath: string) => Promise<fs.Dirent[]>;
    childDirs: (fullPath: string) => Promise<fs.Dirent[]>;
    childFiles: (fullPath: string) => Promise<fs.Dirent[]>;
    relativeTo: (from: string, to: string) => string;
};
