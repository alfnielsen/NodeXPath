"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.x = exports.setIndent = exports.emptyLineRegex = exports.indentRegex = exports.fx = exports.NodeXPath = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
class NodeXPath {
    constructor() {
        this.fullPath = "";
        this.exists = false;
        this.stat = undefined;
        this.type = "file";
        this.loaded = false;
        this.content = "";
        this.json = undefined;
        // Parsed path
        this.basename = "";
        this.ext = "";
        this.dir = "";
        this.parentDir = "";
        this.sep = path_1.default.sep;
    }
    static fromPath(fullPath, loadContent = false, parseJson = false) {
        return __awaiter(this, void 0, void 0, function* () {
            let x = new NodeXPath();
            yield x.setPath(fullPath, loadContent, parseJson);
            return x;
        });
    }
    static fromPathWithContent(fullPath, content, parseJson = false) {
        return __awaiter(this, void 0, void 0, function* () {
            let x = new NodeXPath();
            yield x.setPath(fullPath, false, false);
            yield x.setContent(content, parseJson);
            return x;
        });
    }
    static fromRelPath(root, relPath, loadContent = false, parseJson = false) {
        return __awaiter(this, void 0, void 0, function* () {
            let x = new NodeXPath();
            yield x.setRelPath(root, relPath, loadContent, parseJson);
            return x;
        });
    }
    static fromRelPathWithContent(root, relPath, content, parseJson = false) {
        return __awaiter(this, void 0, void 0, function* () {
            let x = new NodeXPath();
            yield x.setRelPath(root, relPath, false, false);
            yield x.setContent(content, parseJson);
            return x;
        });
    }
    setPath(fullPath, loadContent = false, parseJson = false) {
        return __awaiter(this, void 0, void 0, function* () {
            this.fullPath = fullPath;
            this.exists = yield fs_extra_1.default.pathExists(fullPath);
            this.stat = yield fs_extra_1.default.stat(fullPath);
            this.type = this.stat.isFile() ? "file" : "dir";
            this.basename = path_1.default.basename(this.fullPath);
            this.ext = path_1.default.extname(this.fullPath);
            this.dir = this.type === "dir" ? this.fullPath : path_1.default.dirname(this.fullPath);
            this.parentDir = path_1.default.dirname(this.dir);
            if (this.type === "file" && loadContent) {
                this.content = yield fs_extra_1.default.readFile(this.fullPath, { encoding: "utf8" });
                this.loaded = true;
                if (parseJson) {
                    this.parseJsonContent();
                }
            }
            return this;
        });
    }
    setRelPath(root, relPath, loadContent = false, parseJson = false) {
        return __awaiter(this, void 0, void 0, function* () {
            this.fullPath = path_1.default.join(root, relPath);
            yield this.setPath(this.fullPath, loadContent, parseJson);
            return this;
        });
    }
    relativeTo(to) {
        let fullPath = path_1.default.relative(this.fullPath, to);
        return fullPath;
    }
    relativeFrom(from) {
        let fullPath = path_1.default.relative(from, this.fullPath);
        return fullPath;
    }
    join(path) {
        let fullPath = path_1.default.join(this.fullPath, path);
        return fullPath;
    }
    joinTo(path) {
        let fullPath = path_1.default.join(path, this.fullPath);
        return fullPath;
    }
    getChildren() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.type === "file")
                return [];
            let children = yield fs_extra_1.default.readdir(this.fullPath, { withFileTypes: true });
            return children;
        });
    }
    getChildDirs() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.type === "file")
                return [];
            let children = yield fs_extra_1.default.readdir(this.fullPath, { withFileTypes: true });
            let dirs = children.filter((item) => item.isDirectory());
            return dirs;
        });
    }
    getChildFiles() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.type === "file")
                return [];
            let children = yield fs_extra_1.default.readdir(this.fullPath, { withFileTypes: true });
            let files = children.filter((item) => item.isFile());
            return files;
        });
    }
    loadContent(parseJson = true) {
        return __awaiter(this, void 0, void 0, function* () {
            this.content = yield fs_extra_1.default.readFile(this.fullPath, { encoding: "utf8" });
            this.loaded = true;
            if (parseJson) {
                this.parseJsonContent();
            }
            return this;
        });
    }
    setContent(content, parseJson = true) {
        return __awaiter(this, void 0, void 0, function* () {
            this.content = content;
            this.loaded = true;
            if (parseJson) {
                this.parseJsonContent();
            }
            return this;
        });
    }
    ensurePath() {
        return __awaiter(this, void 0, void 0, function* () {
            yield fs_extra_1.default.ensureDir(this.dir);
        });
    }
    save(encoding = "utf8") {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.type !== "file")
                return undefined;
            yield this.ensurePath();
            yield fs_extra_1.default.writeFile(this.fullPath, this.content, { encoding });
            this.exists = true;
            return this;
        });
    }
    delete() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.type === "file" && this.exists) {
                yield fs_extra_1.default.remove(this.fullPath);
                this.exists = false;
            }
        });
    }
    replaceContent(regex, replacement) {
        this.content = this.content.replace(regex, replacement);
        return this;
    }
    replacePath(regex, replacement) {
        this.fullPath = this.fullPath.replace(regex, replacement);
        return this;
    }
    replaceLines(callback) {
        let lines = this.content
            .split("\n")
            .map((line, index) => {
            return callback(line, index);
        })
            .join("\n");
        this.content = lines;
        return this;
    }
    addIndent(indent = _indent) {
        this.content = indent + this.content.replace(/\n/g, "\n" + indent);
        return this;
    }
    lines() {
        return this.content.split("\n");
    }
    minIndent(max = "        ") {
        let baseIndent = max;
        let lines = this.lines();
        for (const line of lines) {
            if (exports.emptyLineRegex.test(line))
                continue; // exclude empty lines
            if (line[1].length < baseIndent.length) {
                let indent = line.match(exports.indentRegex);
                if (!indent)
                    continue;
                if (line[1].length === 0)
                    return "";
                baseIndent = line[1];
            }
        }
        return baseIndent;
    }
    parseJsonContent() {
        var _a;
        if (this.type !== "file")
            return undefined;
        if (!this.content)
            return undefined;
        try {
            this.json = JSON.parse(this.content);
        }
        catch (e) {
            if (e instanceof SyntaxError) {
                (_a = console.log) === null || _a === void 0 ? void 0 : _a.call(console, "NodeXPath - ParseJson SyntaxError:", e);
            }
        }
        return this;
    }
    parseJson() {
        var _a;
        if (this.type !== "file")
            return undefined;
        if (!this.content)
            return undefined;
        try {
            return JSON.parse(this.content);
        }
        catch (e) {
            if (e instanceof SyntaxError) {
                (_a = console.log) === null || _a === void 0 ? void 0 : _a.call(console, "NodeXPath - ParseJson SyntaxError:", e);
            }
        }
    }
}
exports.NodeXPath = NodeXPath;
NodeXPath.sep = path_1.default.sep;
// Factory
function fx(fullPath) {
    return NodeXPath.fromPath(fullPath);
}
exports.fx = fx;
exports.indentRegex = /^\s*/;
exports.emptyLineRegex = /^\s*$/;
let _indent = "    ";
const setIndent = (indent) => {
    _indent = indent;
};
exports.setIndent = setIndent;
exports.x = {
    fromPath: NodeXPath.fromPath,
    fromPathWithContent: NodeXPath.fromPathWithContent,
    fromRelPath: NodeXPath.fromRelPath,
    fromRelPathWithContent: NodeXPath.fromRelPathWithContent,
    sep: path_1.default.sep,
    join(...paths) {
        let fullPath = path_1.default.join(...paths);
        return fullPath;
    },
    lines(content) {
        return content.split("\n");
    },
    trimEmptyLines(content) {
        return content.replace(/^\s*\n/, "").replace(/\n\s*$/, ""); // remove empty lines from start and end
    },
    removeEmptyLines(content) {
        // remove each empty line
        return content.replace(/^\s*\n/gm, "");
    },
    addIndent: (content, indent = _indent) => {
        return indent + content.replace(/\n/g, "\n" + indent);
    },
    removeIndent: (content, indent = _indent) => {
        return content.replace(new RegExp(`(^|\n)${indent}`, "g"), "\n");
    },
    minIndent: (content, max = "        ") => {
        let baseIndent = max;
        let lines = content.split("\n");
        for (const line of lines) {
            if (line.length === 0 || exports.emptyLineRegex.test(line))
                continue; // exclude empty lines
            let indent = line.match(exports.indentRegex);
            if (!indent)
                continue;
            if (indent[0].length === 0)
                return "";
            if (indent[0].length < baseIndent.length) {
                baseIndent = indent[0];
            }
        }
        return baseIndent;
    },
    load: (fullPath, stripReturnFeed = true) => __awaiter(void 0, void 0, void 0, function* () {
        const content = yield fs_extra_1.default.readFile(fullPath, { encoding: "utf8" });
        if (stripReturnFeed) {
            return content.replace(/\r\n/g, "\n");
        }
        return content;
    }),
    loadJson: (fullPath, stripReturnFeed = true) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        let c = yield exports.x.load(fullPath, stripReturnFeed);
        try {
            return JSON.parse(c);
        }
        catch (e) {
            (_a = console.log) === null || _a === void 0 ? void 0 : _a.call(console, "NodeXPath - loadJson SyntaxError:", e);
        }
    }),
    save: (fullPath, content, encoding = "utf8") => __awaiter(void 0, void 0, void 0, function* () {
        yield fs_extra_1.default.ensureDir(path_1.default.dirname(fullPath));
        yield fs_extra_1.default.writeFile(fullPath, content, { encoding });
    }),
    delete: (fullPath) => __awaiter(void 0, void 0, void 0, function* () {
        if (yield fs_extra_1.default.pathExists(fullPath)) {
            yield fs_extra_1.default.remove(fullPath);
        }
    }),
    exists: (fullPath) => __awaiter(void 0, void 0, void 0, function* () {
        return yield fs_extra_1.default.pathExists(fullPath);
    }),
    ensureDir: (fullPath) => __awaiter(void 0, void 0, void 0, function* () {
        let exists = yield fs_extra_1.default.pathExists(fullPath);
        let dir = fullPath;
        if (exists) {
            let stat = yield fs_extra_1.default.stat(fullPath);
            let isFile = stat.isFile();
            if (isFile) {
                dir = path_1.default.dirname(fullPath);
            }
            yield fs_extra_1.default.ensureDir(dir);
            return;
        }
        let p = path_1.default.parse(fullPath);
        if (p.ext) {
            dir = path_1.default.dirname(fullPath);
        }
        yield fs_extra_1.default.ensureDir(dir);
    }),
    isFile: (fullPath) => __awaiter(void 0, void 0, void 0, function* () {
        let exists = yield fs_extra_1.default.pathExists(fullPath);
        if (!exists)
            return false;
        let stat = yield fs_extra_1.default.stat(fullPath);
        return stat.isFile();
    }),
    isDir: (fullPath) => __awaiter(void 0, void 0, void 0, function* () {
        let exists = yield fs_extra_1.default.pathExists(fullPath);
        if (!exists)
            return false;
        let stat = yield fs_extra_1.default.stat(fullPath);
        return stat.isDirectory();
    }),
    children: (fullPath) => __awaiter(void 0, void 0, void 0, function* () {
        let exists = yield fs_extra_1.default.pathExists(fullPath);
        if (!exists)
            return [];
        let children = yield fs_extra_1.default.readdir(fullPath, { withFileTypes: true });
        return children;
    }),
    childDirs: (fullPath) => __awaiter(void 0, void 0, void 0, function* () {
        let exists = yield fs_extra_1.default.pathExists(fullPath);
        if (!exists)
            return [];
        let children = yield fs_extra_1.default.readdir(fullPath, { withFileTypes: true });
        let dirs = children.filter((item) => item.isDirectory());
        return dirs;
    }),
    childFiles: (fullPath) => __awaiter(void 0, void 0, void 0, function* () {
        let exists = yield fs_extra_1.default.pathExists(fullPath);
        if (!exists)
            return [];
        let children = yield fs_extra_1.default.readdir(fullPath, { withFileTypes: true });
        let files = children.filter((item) => item.isFile());
        return files;
    }),
    relativeTo: (from, to) => {
        return path_1.default.relative(from, to);
    },
};
exports.default = Object.assign({}, exports.x);
