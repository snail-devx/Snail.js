import pc from "picocolors";
import { readdirSync, statSync, existsSync, mkdirSync, rmSync } from "fs";
import { resolve, relative } from "path";
import { fileURLToPath } from "url";
/** 文件所处目录路径  */
const __dirname = fileURLToPath(new URL('.', import.meta.url))

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