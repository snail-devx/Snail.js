/**
 * .d.ts 文件rollup配置：合并多个.d.ts文件
 *  1、读取dist/types/目录下的.d.ts为入口文件，将其import的合并过来输出
 */
import { resolve } from "path";
import { readdirSync, statSync } from "fs";
import dts from 'rollup-plugin-dts'
import {
    isStringNotEmpty,
    checkExists, error, log, trace,
    getPackage
} from "./scripts/util.js";

/** 需要构建的项目包信息 @type {import("./types/package").Package} */
const pkg = (() => {
    const packageDir = process.env.BUILD;
    isStringNotEmpty(packageDir) || error(`\tBUILD环境变量为空，无法进行dts打包构建`);
    const pkg = getPackage(packageDir, false);
    return pkg
        ? pkg
        : error(`无法取到打包项目信息：${packageDir}`);
})();

/**
 * dts文件数组
 * @type {import("rollup").RollupOptions[]}
 */
const dtsFiles = [];
{
    log(`--.d.ts root \t${pkg.typesRoot}`);
    checkExists(pkg.typesRoot) && readdirSync(pkg.typesRoot).forEach(item => {
        const dtsFile = resolve(pkg.typesRoot, item);
        if (statSync(dtsFile).isFile() && dtsFile.endsWith(".d.ts")) {
            const target = resolve(pkg.releaseRoot, "dist", item);
            trace(`--build file \t${dtsFile} \t➡️\t ${target}`);
            dtsFiles.push({
                input: dtsFile,
                output: { file: target, format: 'es' },
                plugins: [
                    dts()
                ],
                external: [
                    /node_modules/gi,
                ],
            });
        }
    });
    dtsFiles.length || error(`目录下无.d.ts文件，无法进行dt构建，目录：${typesRoot}`);
}

export default dtsFiles;