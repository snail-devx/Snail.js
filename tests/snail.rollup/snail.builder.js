import { resolve } from "path";
import { fileURLToPath } from "url";

/** 文件所处目录路径  */
const __dirname = fileURLToPath(new URL('.', import.meta.url));

/**
 * 构建器文件配置
 * @type {import("../../packages/snail.rollup/src/models/builder").BuilderOptions}
 */
export default {
    root: __dirname,
    srcRoot: resolve(__dirname, "src"),
    siteRoot: resolve(__dirname, "dist"),
    distRoot: resolve(__dirname, "dist"),
    cssChunkFolder: "./css",
    isProduction: true
}