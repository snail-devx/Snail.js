/**
 * .d.ts 文件rollup配置：合并多个.d.ts文件
 *  1、读取dist/types/目录下的.d.ts为入口文件，将其import的合并过来输出
 */
import { resolve } from "path";
import { readdirSync, statSync } from "fs";
import dts from 'rollup-plugin-dts'
import { isStringNotEmpty } from "./shared/base.js";
import { checkExists, error } from "./shared/io.js";
import { getPackage } from "./shared/packages.js";

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
    checkExists(pkg.typesRoot) && readdirSync(pkg.typesRoot).forEach(item => {
        const dtsFile = resolve(pkg.typesRoot, item);
        statSync(dtsFile).isFile() && dtsFile.endsWith(".d.ts") && dtsFiles.push({
            input: dtsFile,
            output: { file: resolve(pkg.releaseRoot, "dist", item), format: 'es' },
            plugins: [
                dts()
            ],
            external: [
                /node_modules/gi,
            ],
        });
    });
    dtsFiles.length || error(`目录下无.d.ts文件，无法进行dt构建，目录：${typesRoot}`);
}

export default dtsFiles;