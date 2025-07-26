/**
 * .d.ts 文件rollup配置：合并多个.d.ts文件
 *      1、外部传入 --typeRoot 参数作为.d.ts文件的根目录
 *      2、合并输出文件，和【typesRoot】同级文件
 */

import { resolve } from "path";
import minimist from "minimist";
import { readdirSync, rmSync, statSync } from "fs";
import dts from 'rollup-plugin-dts'
import {
    isStringNotEmpty,
    checkExists, error, log, trace,
} from "./scripts/util.js";
import { dealRollupWarn } from "./scripts/rollup-util.js";

/** 类型文件根目录：检测存在和合法性 */
const typesRoot = minimist(process.argv.slice(2)).typesRoot;
{
    isStringNotEmpty(typesRoot) || error("确保传入“--typesRoot”参数作为要合并的.d.ts类型文件根目录");
    checkExists(typesRoot, ".d.ts类型文件根目录");
}
/**
 * dts文件数组
 * @type {import("rollup").RollupOptions[]}
 */
const dtsFiles = [];
{
    log(`--.d.ts root \t${typesRoot}`);
    readdirSync(typesRoot).forEach(item => {
        const dtsFile = resolve(typesRoot, item);
        if (statSync(dtsFile).isFile() && dtsFile.endsWith(".d.ts")) {
            //  忽略 exporter.d.ts，无需合并导出为模块的.d.ts
            if (item == "exporter.d.ts") {
                return;
            }
            //  合并输出文件，和【typesRoot】同级文件
            const target = resolve(typesRoot, "../", item);
            trace(`--build file \t${dtsFile} \t➡️\t ${target}`);
            dtsFiles.push({
                input: dtsFile,
                output: { file: target, format: 'es' },
                plugins: [
                    //  插件：合并.d.ts文件
                    dts(),
                    //  插件：合并完成后，清理掉types根目录
                    {
                        name: "clear.types-src",
                        buildEnd: () => rmSync(typesRoot, { recursive: true }),
                    }
                ],
                //  合并.d.ts文件时，忽略掉node_modules和.less文件；后续补充看配置只包含 .d.ts 行不行
                external: [
                    /node_modules/gi,
                    /\.less/gi
                ],
                //  忽略【依赖包加载失败】的警告，合并.d.ts文件在最外层目录下，packages下项目依赖的特定包会不存在
                onwarn(warning, warn) {
                    warning.code === "UNRESOLVED_IMPORT" || warn.call(this, warning);
                }
            });
        }
    });
    dtsFiles.length || error(`目录下无.d.ts文件，无法进行dt构建，目录：${typesRoot}`);
}

//  导出rollup配置：导出前处理构建时的警告信息
export default dealRollupWarn(dtsFiles);