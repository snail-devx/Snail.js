/**
 * rollup插件相关方法；用于支撑 snail.rollup-*相关插件使用
 */

import { isArrayNotEmpty, isFunction, isStringNotEmpty, throwIfFalse, throwIfUndefined, url } from "snail.core";
import { dirname, extname, isAbsolute, resolve } from "path";
import { existsSync } from "fs";
import pc from "picocolors";
import { forceExt, isChild, isNetPath } from "./utils/helper";
import { BuilderOptions } from "./models/builder";
import { AssetOptions, ComponentContext, ComponentOptions } from "./models/component";
import { ModuleOptions, ModuleType } from "./models/module";

/** 把自己的类型共享出去 */
export * from "./models/builder"
export * from "./models/component"
export * from "./models/module"
export * from "./models/project"

/** 导出助手类方法和组件 */
export * from "./utils/helper";
export * from "./components/asset-manager";

//#region ************************************* 公共方法、属性 *************************************
/**
 * 是否是watch打包模式
 */
export const isWatchMode: boolean = process.env["ROLLUP_WATCH"] == 'true';
/**
 * 是否是指定后缀的模块
 * @param module 模块信息，分析启后缀名称，与exts比配
 * @param exts 后缀数组
 */
export function isExtFile(module: ModuleOptions | string, exts: string[]): boolean {
    if (module && isArrayNotEmpty(exts)) {
        const ext = typeof (module) == "string" ? extname(module).toLowerCase() : module.ext;
        return exts.indexOf(ext) !== -1;
    }
    return false;
}
/**
 * 是否是资源文件模块
 * @param module 
 * @param options
 * @returns 
 */
export function isAsset(module: ModuleOptions | string, options: BuilderOptions): boolean {
    /* 后期支持从这里扩充 文件后缀 */
    return isExtFile(module, [".png", ".jpg", ".jpeg", ".gif", ".svg", ".html"]);
}
/**
 * 是否是js脚本模块
 * @param module 
 * @param options
 * @returns true/false
 */
export function isScript(module: ModuleOptions | string, options: BuilderOptions): boolean {
    /* 后期支持从这里扩充 文件后缀 */
    return isExtFile(module, [".ts", ".js", ".cjs", ".mjs"]);;
}
/**
 * 是否是css样式模块
 * @param module 
 * @param options
 * @returns true/false
 */
export function isStyle(module: ModuleOptions | string, options: BuilderOptions): boolean {
    /* 后期支持从这里扩充 文件后缀 */
    return isExtFile(module, [".css", ".less", ".sass", ".scss"]);
}

/**
 * 强制文件的后缀
 * - 将一些预编译文件输出后的后缀做一下强制修改
 * - 如 .ts强制.js,.less强制.css
 * @param file 文件路径
 * @param options
 * @returns 整理后缀后的新文件路径
 */
export function forceFileExt(file: string, options: BuilderOptions): string {
    if (isScript(file, options) == true) {
        return forceExt(file, ".js");
    }
    if (isStyle(file, options) == true) {
        return forceExt(file, ".css");
    }

    return file;
}

/**
 * 解析处理模块Id信息，基于id分析模块类型；如模块的url地址、类型等，ext等
 * @param 模块来源，如通过import引入
 * @param importer  谁引入了source
 * @param context   组件构建上下文，用于构建缓存
 * @param options
 * @returns 引入的模块信息
 */
export function resolveModule(source: string, importer: string, context: ComponentContext, options: BuilderOptions): ModuleOptions | undefined {
    /** 格式化source，并分析type值；基于source和importer分析实际物理路径赋值给source；
     *      1、网络路径，自动net；注意甄别 linux下的路径（/root/x/x.tx)
     *      2、否则基于importer分析判定为src源码引入
     *      2、最后 npm 兜底
     */
    let type: ModuleType = undefined;
    {
        if (isNetPath(source) === true) {
            source = url.format(source);
            type = "net";
        }
        else if (importer == undefined || source[0] == ".") {
            source = importer == undefined ? source : resolve(dirname(importer), source);
            throwIfFalse(
                isAbsolute(source),
                `analysis source's physical path failed in src mode. source:${source}, importer:${importer}.`
            );
            type = "src";
        }
        else {
            type = "npm";
        }
        throwIfUndefined(type, `analysis source's type failed. source:${source}, importer:${importer}.`);
    }
    /** 解析import模块信息；先走缓存处理
     *  实际分析时基于不同type分析ret值
     *      1、src环境下，进行文件存在性验证，并做后缀补偿
     *          1、解决这类ts引入import { XX } from "./utils/helper""; 
     *          2、在ts中，引入.js文件，可能需要被映射成.ts文件
     *          3、优化措施：后续基于source（小写}做一下缓存处理，内部做了不少的存在性判断等逻辑，直接返回结果
     *      2、其他情况，简化处理，不用处理太多
     */
    const cacheKey = `RESOLVE_MODULE:${source.toLowerCase()}`;
    if (context.caches.has(cacheKey)) {
        return context.caches.get(cacheKey);
    }
    let module: ModuleOptions = undefined;
    switch (type) {
        //  src项目源码文件：E:\Snail.js\packages\snail.rollup\src\plugin.ts
        case "src": {
            const [filename, rawQuery] = source.split(`?`, 2);
            const urlParams = new URLSearchParams(rawQuery);
            const query = urlParams.size > 0 ? Object.fromEntries(urlParams) : undefined;
            //  进行id存在性验证，基于ext做补偿；后续考虑补偿ext数组能够全局配置
            let id = url.format(filename);
            if (existsSync(id) === false) {
                /\.js$/i.test(id) && (id = id.substring(0, id.length - 3));
                const ext = [".ts", ".js", ".cjs", ".mjs"].find(ext => existsSync(id.concat(ext)));
                id = ext ? id.concat(ext) : undefined;
            }
            module = id
                ? { type, id, src: source, query, ext: extname(id).toLowerCase() }
                : undefined;
            break;
        }
        //  网络路径文件：/api/test/server.js?a=1&b=2 ；http://www.baidu.com/api/scripts/xx.js
        case "net": {
            const [filename] = source.split(`?`, 1);
            module = { type, id: source, src: source, ext: extname(filename) };
        }
        //  npm包：vue、snail.core
        case "npm": {
            module = { type, id: source, src: source };
        }
        //  兜底，避免以后再加类型时不好适配
        default: {
            const message = `invalid type:${type}. source:${source}, importer:${importer}.`;
            throw new Error(message);
        }
    }
    module && context.caches.set(cacheKey, module);
    return module;
}

/**
 * 触发指定规则输出错误信息，非watch模式下，直接退出
 * @param rule 规则信息
 * @param source 源文件
 * @param importer 由谁引入的source文件
 * @param component 打包的组件信息
 * @param options 打包器相关信息
 */
export function triggerRule(rule: string, source: string, importer: string, component: ComponentOptions, options: BuilderOptions): void {
    //  输出错误提示信息
    const msgs: string[] = [
        pc.bold(` * ${rule}`),
        `source         ${source}`,
        `组件src        ${component.src}`,
        `组件Root       ${component.root}`,
        `srcRoot        ${options.srcRoot}`
    ];
    importer && msgs.splice(1, 0, `importer       ${importer}`);
    console.log(pc.red(msgs.join('\r\n\t')), "\r\n")
    isWatchMode || process.exit(0);
}
/**
 * 必须在SrcRoot目录下，否则报错
 * @param module 模块信息
 * @param source 源文件
 * @param importer 由谁引入的source文件
 * @param component 打包的组件信息
 * @param options 打包器相关信息
 */
export function mustInSrcRoot(module: ModuleOptions, source: string, importer: string, component: ComponentOptions, options: BuilderOptions): void {
    if (isChild(options.srcRoot, module.id) == false) {
        const rule = "import file must be child or srcRoot: cannot analysis url of outside file.";
        triggerRule(rule, source, importer, component, options);
    }
}
//#endregion

//#region ************************************* 私有方法、变量 *************************************

//#endregion