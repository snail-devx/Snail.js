import { fileURLToPath } from "url";
import { dealRollupDefault } from "../../scripts/rollup-util.js";

//  变量准备
/**     文件所处目录路径  */
const __dirname = fileURLToPath(new URL('.', import.meta.url));
/**
 * 打包的组件配置
 * @type {import("rollup").RollupOptions[]}
 */
export default dealRollupDefault(
    [
        {
            input: "src/index.ts",
            output: [//  Valid values are "amd", "cjs", "system", "es", "iife" or "umd".
                { file: "dist/index.js", format: "es" },
            ],
        },
    ],
    __dirname,
    { supportTS: true, needBabel: false, needExternal: true, ignoreWarning: true, }
);