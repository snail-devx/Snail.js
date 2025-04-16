/**
 * 助手类js
 */

import pc from "picocolors";
import { readdirSync, statSync, existsSync, mkdirSync, rmSync } from "fs";
import { resolve, relative } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
/** 文件所处目录路径  */
const __dirname = fileURLToPath(new URL('.', import.meta.url));
/** 动态加载文件方法 */
const require = createRequire(import.meta.url)
/** 临时目录根路径 */
export const DIR_TEMPROOT = resolve(__dirname, "../temp");
/** 发布目录根路径 */
export const DIR_RELEASEROOT = resolve(__dirname, "../release");

//#region  *****************************************   👉 基础的类型判断    *****************************************
/**
 * 是否是非空数组：array+.length>0
 * @param {any} data 
 * @returns {boolean}
 */
export function isArrayNotEmpty(data) {
    return Array.isArray(data) ? data.length > 0 : false;
}
/**
 * 是非空的字符串：string+.length>0
 * @param {any} data 
 * @returns {boolean}
 */
export function isStringNotEmpty(data) {
    return typeof (data) == "string" && data.length > 0;
}
//#endregion

//#region  *****************************************   👉 日志输出    *****************************************
/**
 * 输出步骤信息
 * @param {string} message 
 */
export function step(message) {
    console.log(pc.cyan(message));
}
/**
 * 输出日志信息
 * @param {string} message 
 */
export function log(message) {
    console.log(pc.green(message));
}
/**
 * 输出跟踪信息
 * @param {string} message 
 */
export function trace(message) {
    console.log(pc.gray(message));
}
/**
 * 输出警告信息
 * @param {string} message 
 */
export function warn(message) {
    console.warn(pc.yellow(message));
}
/**
 * 抛错，输出错误信息
 * @param {string} message 
 */
export function error(message) {
    throw new Error(pc.red(message));
}
//#endregion

//#region  *****************************************   👉 文件相关操作    *****************************************
/**
 * 使用import加载文件
 * @param {string} file 文件路径；绝对路径
 * @param {string} title import发生错误时的的标题
 * @returns { Promise<any> }
 */
export function importFile(file, title) {
    file = resolve(__dirname, file);
    checkExists(file, `${title}:${file}`);
    file = formatNetPath(relative(__dirname, file));
    return import(file);
}
/**
 * 格式化网络地址；将\替换为/
 * @param {string}  url url地址
 * @returns {string} 替换后的网络地址
 */
export function formatNetPath(url) {
    return url?.replace(/\\/g, '/')?.replace(/\/+$/, '');
}

/**
 * 重新创建目录：若存在先删除
 * @param {string} path 
 */
export function reMakeDir(path) {
    existsSync(path) && rmSync(path, { recursive: true });
    mkdirSync(path, { recursive: true });
}

/**
 * 路径不存在报错
 * @param {string} path 文件路径
 * @param {string} paramName 检测路径的参数名称
 * @returns 存在返回true；否则报错
 */
export function checkExists(path, paramName) {
    if (existsSync(path) == false) {
        var msg = `${paramName}不存在。路径值:${path}`;
        throw new Error(msg);
    }
    return true;
}
//#endregion

//#region  *****************************************   👉 打包配置    *****************************************
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
 * @returns {import("../types/package").Package[]}
 */
export function getPackages(names) {
    names || error(`getPackages的names参数无效：${names}`);
    Array.isArray(names) || (names = [names]);
    isArrayNotEmpty(names) || error(`getPackages的names参数不能是空数组：${names}`);
    //  筛选，如果有
    return allPackages.filter(pkg => names.find(name => {
        return name.indexOf("*") == -1
            ? pkg.dir == name
            : pkg.dir.match(name) != null
    }) != undefined);
}
/**
 * 获取符合条件的第一个项目包
 * @param {string|string[]} names 项目包名，字符串或者字符串数组
 * @param {boolean} startFuzzy 是否启用模糊匹配，传true时，则names可传入正则匹配字符串，如“snail.*”
 * @returns {import("../types/package").Package|undefined}
 */
export function getPackage(names) {
    var pkgs = getPackages(names);
    return isArrayNotEmpty(pkgs) ? pkgs[0] : undefined;
}
//#endregion