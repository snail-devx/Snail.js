import { fileURLToPath } from "url";
import { dealRollupDefault } from "../../scripts/rollup-util.js";
//  变量准备
/**     文件所处目录路径  */
const __dirname = fileURLToPath(new URL('.', import.meta.url));
//  构建打包配置
/**
 * @type {import("rollup").RollupOptions[]}
 */
export default dealRollupDefault(
    [
        {
            input: "src/snail.core.ts",
            output: [//  Valid values are "amd", "cjs", "system", "es", "iife" or "umd".
                { file: "dist/snail.core.js", format: "es", name: "snail", },
                { file: "dist/snail.core.umd.js", format: "umd", name: "snail", }
            ],
        }
    ],
    __dirname,
    { supportTS: true, needBabel: true, needExternal: false, ignoreWarning: true }
);