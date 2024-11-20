"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNextRoutes = void 0;
const node_fs_1 = __importDefault(require("node:fs"));
const list_paths_1 = __importDefault(require("list-paths"));
function getNextRoutes(src = "./", extensions = ["tsx", "ts", "js", "jsx", "mdx"]) {
    // next app routes
    // if app exists
    let appPaths = [];
    if (node_fs_1.default.existsSync(`${src}app`)) {
        appPaths = (0, list_paths_1.default)(`${src}app`, { includeFiles: true }).filter((path) => {
            const file = path.split("/").at(-1);
            const filename = file === null || file === void 0 ? void 0 : file.split(".").at(-2);
            const extension = file === null || file === void 0 ? void 0 : file.split(".").at(-1);
            return extension && extensions.includes(extension) && filename === "page";
        });
    }
    // next pages routes
    let pagePaths = [];
    if (node_fs_1.default.existsSync(`${src}pages`)) {
        pagePaths = (0, list_paths_1.default)(`${src}pages`, { includeFiles: true }).filter((path) => {
            // if (path?.includes("/pages/api/")) return false;
            const file = path.split("/").at(-1);
            const extension = file === null || file === void 0 ? void 0 : file.split(".").at(-1);
            return extension && extensions.includes(extension);
        });
    }
    /**
    appRoutes = [
      '/app/(group)/blog/page.tsx', => route should be '/blog'
      '/app/(group)/blog/[...slug]/page.tsx', => route should be '/blog/[...slug]'
      '/app/@component/blog/page.tsx', // should remove, because it's not a page
      '/app/blog/(..)list/page.tsx', // should remove, because it's not a page
          '/app/_private/page.tsx', // should remove, because it's a private folder
          '/app/%5Flog%5F/page.tsx', // should be '/_log_'
    ]
    */
    const appRoutes = appPaths
        .map((path) => {
        var _a, _b;
        const parts = (_b = (_a = path.split(src)[1]) === null || _a === void 0 ? void 0 : _a.split("/").filter(Boolean)) !== null && _b !== void 0 ? _b : [];
        const url = [];
        for (let i = 0; i < parts.length; i++) {
            let part = parts[i];
            if (!part)
                continue;
            if (i === 0 && part === "app")
                continue;
            const isPrivateRoute = part.startsWith("_");
            if (isPrivateRoute)
                return null;
            const isGroupRoute = part.startsWith("(") && part.endsWith(")");
            if (isGroupRoute)
                continue;
            const isInterceptingRoute = part.startsWith("(") && !part.endsWith(")");
            if (isInterceptingRoute)
                return null;
            const isParallelRoute = part.startsWith("@");
            if (isParallelRoute)
                return null;
            // ignore 'page.tsx' on url path
            if (i === parts.length - 1)
                continue;
            // replace %5F to _
            part = part.replace(/%5F/g, "_");
            url.push(part);
        }
        return `/${url.join("/")}`;
    })
        .filter(Boolean);
    /**
    pageRoutes = [
      '/pages/blog.js', => route should be '/blog'
      '/pages/[slug].js', => route should be '/[...slug]'
    ]
    */
    const pagesRoutes = pagePaths
        .map((path) => {
        var _a, _b, _c;
        const parts = (_b = (_a = path.split(src)[1]) === null || _a === void 0 ? void 0 : _a.split("/").filter(Boolean)) !== null && _b !== void 0 ? _b : [];
        const url = [];
        for (let i = 0; i < parts.length; i++) {
            let part = parts[i];
            if (!part)
                continue;
            if (i === 0 && part === "pages")
                continue;
            if (i === parts.length - 1) {
                part = (_c = part.split(".").at(-2)) !== null && _c !== void 0 ? _c : "";
                if (part === "index") {
                    continue;
                }
            }
            url.push(part);
        }
        return `/${url.join("/")}`;
    })
        .filter(Boolean);
    const unDuplicatedRoutes = Array.from(new Set([...appRoutes, ...pagesRoutes]));
    return unDuplicatedRoutes;
}
exports.getNextRoutes = getNextRoutes;
