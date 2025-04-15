/**
 * Packages包项目相关助手类方法
 */

import { createRequire } from "node:module";
import { existsSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { error } from "./io.js";
import { isArrayNotEmpty } from "./base.js"

/** 文件所处目录路径  */
const __dirname = fileURLToPath(new URL('.', import.meta.url));
/** 动态加载文件方法 */
const require = createRequire(import.meta.url)
/** 临时目录根路径 */
export const DIR_TEMPROOT = resolve(__dirname, "../temp");
/** 发布目录根路径 */
export const DIR_RELEASEROOT = resolve(__dirname, "../release");

/**
 * 所有可用的Packages项目包；从根目录的【packages】目录下自动分析
 * @type {import("../types/package").Package[]}
 * @remarks 忽略私有包，忽略无package.json、rollup.config.js的项目
 */
export const allPackages = readdirSync(resolve(__dirname, "../packages"))
    .map(dir => {
        const root = resolve(__dirname, "../packages", dir);
        if (statSync(root).isDirectory() != true) {
            return undefined;
        }
        const packageFile = resolve(root, "package.json");
        if (existsSync(packageFile) != true) {
            return undefined;
        }
        const pkgJson = require(resolve(root, "package.json"));
        if (pkgJson.private == true || pkgJson.private == "true") {
            return undefined;
        }
        const rollupFile = resolve(root, "rollup.config.js");
        if (existsSync(rollupFile) != true) {
            return undefined;
        }
        //  构建包信息返回
        /**     @type {import("../types/package").Package}*/
        const pkg = {
            name: pkgJson.name || name,
            dir,

            root,
            srcRoot: resolve(root, "src"),
            distRoot: resolve(DIR_TEMPROOT, dir),
            typesRoot: resolve(DIR_TEMPROOT, dir, "src"),
            releaseRoot: resolve(DIR_RELEASEROOT, dir),

            packageFile,
            rollupFile
        };
        return Object.freeze(pkg);

    })
    .filter(pkg => pkg != undefined);

/**
 * 获取符合条件的项目包集合
 * @param {string|string[]} names 项目包名，字符串或者字符串数组
 * @param {boolean} startFuzzy 是否启用模糊匹配，传true时，则names可传入正则匹配字符串，如“snail.*”
 * @returns {import("../types/package").Package[]}
 */
export function getPackages(names, startFuzzy = true) {
    names || error(`getPackages的names参数无效：${names}`);
    Array.isArray(names) || (names = [names]);
    isArrayNotEmpty(names) || error(`getPackages的names参数不能是空数组：${names}`);
    //  筛选，如果有
    return allPackages.filter(pkg =>
        !!names.find(name =>
            startFuzzy ? pkg.dir.match(name) != null : pkg.dir == name
        )
    );
}
/**
 * 获取符合条件的第一个项目包
 * @param {string|string[]} names 项目包名，字符串或者字符串数组
 * @param {boolean} startFuzzy 是否启用模糊匹配，传true时，则names可传入正则匹配字符串，如“snail.*”
 * @returns {import("../types/package").Package|undefined}
 */
export function getPackage(names, startFuzzy = true) {
    var pkgs = getPackages(names, startFuzzy);
    return isArrayNotEmpty(pkgs) ? pkgs[0] : undefined;
}