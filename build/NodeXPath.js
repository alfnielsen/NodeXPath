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
exports.NodeXPath = void 0;
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
    static fromPath(fullPath, loadContent = false, parseJson = true) {
        return __awaiter(this, void 0, void 0, function* () {
            let x = new NodeXPath().setPath(fullPath, loadContent, parseJson);
            return x;
        });
    }
    static fromPathWithContent(fullPath, content, parseJson = true) {
        return __awaiter(this, void 0, void 0, function* () {
            let x = new NodeXPath();
            yield x.setPath(fullPath, false, false);
            yield x.setContent(content, parseJson);
            return x;
        });
    }
    static fromRelPath(root, relPath, loadContent = false, parseJson = true) {
        return __awaiter(this, void 0, void 0, function* () {
            let x = new NodeXPath();
            x.setRelPath(root, relPath, loadContent, parseJson);
            return x;
        });
    }
    static fromRelPathWithContent(root, relPath, content, parseJson = true) {
        return __awaiter(this, void 0, void 0, function* () {
            let x = new NodeXPath();
            yield x.setRelPath(root, relPath, false, false);
            yield x.setContent(content, parseJson);
            return x;
        });
    }
    setPath(fullPath, loadContent = false, parseJson = true) {
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
    setRelPath(root, relPath, loadContent = false, parseJson = true) {
        return __awaiter(this, void 0, void 0, function* () {
            this.fullPath = path_1.default.join(root, relPath);
            this.setPath(this.fullPath, loadContent, parseJson);
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
function X(fullPath) {
    return NodeXPath.fromPath(fullPath);
}
X.fromPath = NodeXPath.fromPath;
X.fromPathWithContent = NodeXPath.fromPathWithContent;
X.fromRelPath = NodeXPath.fromRelPath;
X.fromRelPathWithContent = NodeXPath.fromRelPathWithContent;
X.sep = path_1.default.sep;
X.load = (fullPath) => __awaiter(void 0, void 0, void 0, function* () {
    return yield fs_extra_1.default.readFile(fullPath, { encoding: "utf8" });
});
X.loadJson = (fullPath) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let c = yield fs_extra_1.default.readFile(fullPath, { encoding: "utf8" });
    try {
        return JSON.parse(c);
    }
    catch (e) {
        (_a = console.log) === null || _a === void 0 ? void 0 : _a.call(console, "NodeXPath - loadJson SyntaxError:", e);
    }
});
X.save = (fullPath, content, encoding = "utf8") => __awaiter(void 0, void 0, void 0, function* () {
    yield fs_extra_1.default.ensureDir(path_1.default.dirname(fullPath));
    yield fs_extra_1.default.writeFile(fullPath, content, { encoding });
});
X.delete = (fullPath) => __awaiter(void 0, void 0, void 0, function* () {
    if (yield fs_extra_1.default.pathExists(fullPath)) {
        yield fs_extra_1.default.remove(fullPath);
    }
});
X.exists = (fullPath) => __awaiter(void 0, void 0, void 0, function* () {
    return yield fs_extra_1.default.pathExists(fullPath);
});
X.ensureDir = (fullPath) => __awaiter(void 0, void 0, void 0, function* () {
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
});
X.isFile = (fullPath) => __awaiter(void 0, void 0, void 0, function* () {
    let exists = yield fs_extra_1.default.pathExists(fullPath);
    if (!exists)
        return false;
    let stat = yield fs_extra_1.default.stat(fullPath);
    return stat.isFile();
});
X.isDir = (fullPath) => __awaiter(void 0, void 0, void 0, function* () {
    let exists = yield fs_extra_1.default.pathExists(fullPath);
    if (!exists)
        return false;
    let stat = yield fs_extra_1.default.stat(fullPath);
    return stat.isDirectory();
});
X.children = (fullPath) => __awaiter(void 0, void 0, void 0, function* () {
    let exists = yield fs_extra_1.default.pathExists(fullPath);
    if (!exists)
        return [];
    let children = yield fs_extra_1.default.readdir(fullPath, { withFileTypes: true });
    return children;
});
X.childDirs = (fullPath) => __awaiter(void 0, void 0, void 0, function* () {
    let exists = yield fs_extra_1.default.pathExists(fullPath);
    if (!exists)
        return [];
    let children = yield fs_extra_1.default.readdir(fullPath, { withFileTypes: true });
    let dirs = children.filter((item) => item.isDirectory());
    return dirs;
});
X.childFiles = (fullPath) => __awaiter(void 0, void 0, void 0, function* () {
    let exists = yield fs_extra_1.default.pathExists(fullPath);
    if (!exists)
        return [];
    let children = yield fs_extra_1.default.readdir(fullPath, { withFileTypes: true });
    let files = children.filter((item) => item.isFile());
    return files;
});
X.relativeTo = (from, to) => {
    return path_1.default.relative(from, to);
};
exports.default = X;
