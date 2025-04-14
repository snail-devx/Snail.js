import { resolve } from "path";
import { fileURLToPath } from "url";

/** 文件所处目录路径  */
const __dirname = fileURLToPath(new URL('.', import.meta.url));

export const root = __dirname;
export const srcRoot = resolve(root, "..");
export const cssChunkFolder = "CSS";
export const isProduction = false;
