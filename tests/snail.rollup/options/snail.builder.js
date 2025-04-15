/**
 * 测试文件级别的 BuilderOptions 构建
 */


import { resolve } from "path";
import { fileURLToPath } from "url";

/** 文件所处目录路径  */
const __dirname = fileURLToPath(new URL('.', import.meta.url));

const root = resolve(__dirname, "../");

/**
 * 构建器文件配置
 * @type {import("../../../packages/snail.rollup/src/models/builder").BuilderOptions}
 */
export default {
    root: root,
    srcRoot: resolve(root, "src"),
    siteRoot: resolve(root, "dist"),
    distRoot: resolve(root, "dist"),
    cssChunkFolder: "./css",
    isProduction: true
}