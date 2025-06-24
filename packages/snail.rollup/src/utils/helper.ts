import { existsSync, mkdir, mkdirSync, statSync } from "fs";
import path, { dirname, extname, relative, resolve } from "path";
import { fileURLToPath } from "url";
import { mustString, hasOwnProperty, throwIfFalse, tidyString, url } from "snail.core"
import pc from "picocolors";
import { BuilderOptions } from "../models/builder-model";

/** 文件所处目录路径  
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
*/
const __dirname = fileURLToPath(new URL('.', import.meta.url));

/**
 * 常亮：一些基础的标记信息，作为固化规则对外提供
 */
export const FLAG = Object.freeze({
    /**
     * 动态模块标识
     */
    DYNAMIC_MODULE: "DMI:",
    /**
     * URL模块标识
     */
    URL_MODULE: "URL:",
    /**
     * 带有URL+版本号的模块标记
     */
    URLVERSION_MODULE: "URL_VERSION:"
});

//#region  *****************************************   👉 基础操作    *****************************************
/**
 * 获取数据长度
 * @param data 如array、string等有length属性的数据
 * @returns 数据长度，无则返回0
 */
export function getLen(data: any): number {
    return data && hasOwnProperty(data, "length")
        ? data.length
        : 0;
}
//#endregion

//#region  *****************************************   👉 文件相关操作    *****************************************
/**
 * 路径不存在报错
 * @param path 
 * @param paramName 
 */
export function checkExists(path: string, paramName: string) {
    if (existsSync(path) != true) {
        var msg = `${paramName} not exists. path:${path}`;
        throw new Error(msg);
    }
}
/**
 * 创建路径的所在目录
 * - 基于dirname（path）得到所在目录
 * - 所在目录不存在时自动递归创建
 * @param path 路径
 */
export function createDir(path: string): void {
    mustString(path, "path");
    const dir = dirname(path);
    existsSync(dir) || mkdirSync(dir, { recursive: true });
}
/**
 * 判断指定路径是否是文件
 * @param path 路径
 * @returns  是文件返回true；否则返回false
 */
export function isFile(path: string): boolean {
    return statSync(path).isFile() == true;
}
/**
 * 动态import文件
 * @param file 文件路径；绝对路径
 * @param title import发生错误时的的标题
 * @returns 文件内容
 */
export function importFile<T>(file: string, title: string): Promise<T> {
    //  取配置文件路径，进行相对路径格式化；避免import出错（参照rollup加载配置文件逻辑）
    checkExists(file, `${title}`);
    file = url.format(relative(__dirname, file));
    return import(file);
}
//#endregion

//#region  *****************************************   👉 路径处理    *****************************************
/**
 * 判断是否是物理文件
 * @param path 要判断的路径
 * @returns 
 */
function isPhysicalFile(path: string): boolean {
    /**
     * linux下，路径为和网络绝对路径一致，需要做一下兼容处理；判断文件是否存在，若存在则判定为物理文件
     *  实例1：/work/rollup/test/Index.ts
     *  实例2：/work/rollup/test/Components/Loading.vue?vue&type=script&lang.ts
     * 处置办法：
     *  1、判断是否是网络绝对路径，如果是，则判断文件是否存在
     *      1、基于 ? 截取一下；这里肯定有bug,linux文件系统，允许目录名带?，但在web开发时会出问题，这里直接忽略此类bug
     *      2、是否存在，若存在则判定为linux下的物理文件
     *  2、和node的进程目录比较，是否是此进程目录下的文件；若是则判定为物理文件
     *  3、后续加入缓存机制，把已经判定过的文件做一下缓存，避免vue等情况
     */

    path = tidyString(path);
    /* v8 ignore next 3  忽略覆盖率测试*/
    if (!path) {
        return false;
    }
    //  1、缓存查找：不区分大小写找；看是否是 ? #相关
    const _path = path.toLowerCase();
    //  2、看在磁盘中是否存在：做一下？和#号截取
    const [tmp] = path.split("?", 1);
    let ret = existsSync(tmp);
    if (ret != true) {
        const [tmp] = path.split("#", 1);
        ret = existsSync(tmp);
    }
    //  3、看看是否是在node进程目录下；不区分大小写
    if (ret != true) {
        const cwd = process.cwd().toLowerCase();
        ret = _path.startsWith(cwd);
    }

    return ret;
}

/**
 * 正则：网络路径
 */
const regexNetPath = /^(((http|https|ftp):\/\/)|(\/|\\)).*/i;
/**
 * 是否是网络路径
 * - 完整网址：如https://cdn.jsdelivr.net/npm/vue@2
 * - 网络绝对路径：如 /xxx/x/x/x/xss.js、/xxxtest.css
 * @param path 
 */
export function isNetPath(path: string): boolean {
    return regexNetPath.test(path) && isPhysicalFile(path) == false;
}

/**
 * 强制文件路径；若不是则替换掉
 * @param file 要换或追的文件
 * @param extName 期望的输出文件后缀名，如“.ts” ；不传则使用src中的后缀名
 */
export function forceExt(file: string, extName: string): string {
    extName = tidyString(extName);
    if (extName) {
        extName = `.${extName.replace(/^\.+/, "")}`;
        file = file.replace(new RegExp(`\\${extname(file)}`, "i"), extName);
    }
    return file;
}

/**
 * 构建输出路径
 * - 基于options的srcRoot和src路径比对构建
 * @param options 构建器配置选项；约束了srcRoot和distRoot
 * @param src 要构建输出路径的文件；绝对路径，或者相对srcRoot路径
 * @returns 输出路径
 */
export function buildDist(options: BuilderOptions, src: string): string {
    path.isAbsolute(src) || (src = resolve(options.srcRoot, src));
    src = relative(options.srcRoot, src);
    return resolve(options.distRoot, src);
}
/**
 * 构建文件的网络地址
 * - 基于options.siteRoot做路径构建
 * - 用于生成网络路径，方便组件动态加载
 * @param options 构建器配置选项；约束了siteRoot
 * @param dist 要构建网络路径的文件；绝对路径，或者相对distRoot路径；确保在siteRoot路径下
 * @returns 格式化好的网络路径
 */
export function buildNetPath(options: BuilderOptions, dist: string): string {
    dist = resolve(options.distRoot, dist);
    throwIfFalse(
        isChild(options.siteRoot, dist),
        `dist must be child of siteRoot. siteRoot:${options.siteRoot}, dist:${dist}.`
    )
    dist = relative(options.siteRoot, dist);
    return `/${url.format(dist)}`;
}
/**
 * child是否是指定parent的子，或者子的子
 * @param parent 父级目录路径
 * @param child  文件/目录路径
 * @returns  子返回true；否则返回false
 */
export function isChild(parent: string, child: string): boolean {
    //  格式化两路径，消息后，做indexOf判断
    parent = resolve(parent).toLowerCase();
    child = resolve(child).toLowerCase();
    return child.startsWith(parent);
}
/**
 * 检测src路径是否正确
 * - 是否为空
 * - 是否在srcRoot目录下
 * - 是否是存在的文件
 * @param options 构建器配置选项
 * @param src src文件路径：
 * @param title 报错标题
 * @returns 验证好的src路径：自动去除前后空格，自动转换为绝对路径（srcRoot）
 */
export function checkSrc(options: BuilderOptions, src: string, title: string): string {
    title = title + ": src";
    src = tidyString(src);
    mustString(src, title);
    src = resolve(options.srcRoot, src);
    throwIfFalse(
        isChild(options.srcRoot, src),
        `${title} must be child of srcRoot. srcRoot:${options.srcRoot}, src:${src}.`
    );
    checkExists(src, title);
    throwIfFalse(isFile(src), `${title} must be file. path:${src}.`);
    return src;
}
//#endregion

//#region  *****************************************   👉 日志输出    *****************************************
/**
 * 输出步骤信息
 * @param  message 
 */
export function step(message: string) {
    console.log(pc.cyan(message));
}
/**
 * 输出日志信息
 * @param  message 
 */
export function log(message: string) {
    console.log(pc.green(message));
}
/**
 * 输出日志信息，在data为非空
 * - 输出结果：message+": data.length"
 * @param data 
 * @param message 
 */
export function logIfAny(data: any, message: string): void {
    let len = getLen(data);
    len > 0 && log(`${message} \t|\tlength:${len}`);
}
/**
 * 输出跟踪日志
 * @param message 
 */
export function trace(message: string) {
    console.log(pc.gray(message));
}
/**
 * 输出跟踪日志，在data为非空
 * - 输出结果：message+": data.length"
 * @param data 
 * @param message 
 */
export function traceIfAny(data: any, message: string): void {
    let len = getLen(data);
    len > 0 && trace(`${message} \t|\tlength:${len}`);
}
/**
 * 输出警告信息
 * @param message 
 */
export function warn(message: string) {
    console.log(pc.yellow(message));
}
// /**
//  * 抛错，输出错误信息
//  * @param {string} message
//  */
// export function error(message) {
//     throw new Error(pc.red(message));
// }
//#endregion