import { dirname, extname, isAbsolute, relative, resolve } from "path";
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import pc from "picocolors";
import { isArrayNotEmpty, throwIfFalse, throwIfUndefined, url } from "snail.core";
import { BuilderOptions, CommonLibOptions } from "../models/builder-model";
import { AssetOptions, ComponentOptions, IComponentContext } from "../models/component-model";
import { ModuleOptions, ModuleType } from "../models/module-model";
import { buildDist, buildNetPath, checkExists, createDir, forceExt, isChild, isNetPath, trace } from "../utils/helper";

/** 模块解析缓存：key为模块id，value为模块信息 */
const moduleResolveCache: Map<string, ModuleOptions> = new Map();
/** 扩展名：脚本文件 */
const EXTS_SCRIPT = Object.freeze([".ts", ".js", ".cjs", ".mjs"]);
/** 扩展名：资产文件 */
const EXTS_ASSET = Object.freeze([".png", ".jpg", ".jpeg", ".gif", ".svg", ".html"]);
/** 扩展名：样式文件 */
const EXTS_STYLES = Object.freeze([".css", ".less", ".scss", ".sass"]);

/* v8 ignore next 260 在rollup-*中使用，内部先不做覆盖率测试*/
/**
 * 获取组件上下文
 * @param component 组件对象
 * @param options 打包全局配置选项
 * @returns 组件上下文对象
 */
export function getContext(component: ComponentOptions, options: BuilderOptions): IComponentContext {
    /** 组件打包过程中分析出来的依赖资源；如图片，这些自动copy到输出目录 */
    const assets: AssetOptions[] = [];
    /** 组件打包过程中依赖的commonLib字典 */
    const globals: Map<string, CommonLibOptions> = new Map();
    /** 是否生产环境 */
    const isProduction = options.isProduction;
    /** 是否watch模式 */
    const isWatchMode = process.env["ROLLUP_WATCH"] == 'true';

    //#region ************************************** 组件分析 *************************************
    /**
     * 解析处理模块Id信息，基于id分析模块类型；如模块的url地址、类型等，ext等
     * @param 模块来源，如通过import引入
     * @param importer  谁引入了source
     * @returns 引入的模块信息
     */
    function resolveModule(source: string, importer: string): ModuleOptions | undefined {
        /** 格式化source，并分析type值；基于source和importer分析实际物理路径赋值给source；
         *      1、网络路径，自动net；注意甄别 linux下的路径（/root/x/x.tx)
         *      2、否则基于importer分析判定为src源码引入
         *      2、最后 npm 兜底
         */
        const fixedError: string = `source:${source}, importer:${importer}`;
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
                    `analysis source's physical path failed in src mode. ${fixedError}.`
                );
                type = "src";
            }
            else {
                type = "npm";
            }
            throwIfUndefined(type, `analysis source's type failed. ${fixedError}.`);
        }
        /** 解析import模块信息；先走缓存处理
         *  实际分析时基于不同type分析ret值
         *      1、src环境下，进行文件存在性验证，并做后缀补偿
         *          1、解决这类ts引入import { XX } from "./utils/helper""; 
         *          2、在ts中，引入.js文件，可能需要被映射成.ts文件
         *          3、优化措施：后续基于source（小写}做一下缓存处理，内部做了不少的存在性判断等逻辑，直接返回结果
         *      2、其他情况，简化处理，不用处理太多
         */
        const cacheKey = source.toLowerCase();
        let module = moduleResolveCache.get(cacheKey);
        if (module != undefined) {
            return module;
        }
        //  分析query参数，并做url参数处理
        let filename, query;
        {
            let rawQuery;
            [filename, rawQuery] = source.split(`?`, 2);
            const urlParams = new URLSearchParams(rawQuery);
            query = urlParams.size > 0 ? Object.fromEntries(urlParams) : undefined;
        }
        //  根据类型细化module信息
        switch (type) {
            //  src项目源码文件：E:\Snail.js\packages\snail.rollup\src\plugin.ts
            case "src": {
                //  进行id存在性验证，基于ext做补偿；后续考虑补偿ext数组能够全局配置
                let id = url.format(filename);
                if (existsSync(id) === false) {
                    /\.js$/i.test(id) && (id = id.substring(0, id.length - 3));
                    const ext = EXTS_SCRIPT.find(ext => existsSync(id.concat(ext)));
                    id = ext ? id.concat(ext) : undefined;
                }
                module = id
                    ? { type, id, src: source, query, ext: extname(id).toLowerCase() }
                    : undefined;
                throwIfUndefined(module, `resolve module failed: src module not exists. ${fixedError}.`);
                break;
            }
            //  网络路径文件：/api/test/server.js?a=1&b=2 ；http://www.baidu.com/api/scripts/xx.js
            case "net": {
                module = { type, id: source, src: source, query, ext: extname(filename) };
                break;
            }
            //  npm包：vue、snail.core
            case "npm": {
                module = { type, id: source, src: source, query, ext: extname(filename) };
                break;
            }
            //  兜底，避免以后再加类型时不好适配
            default: {
                const message = `resolve module failed: not support module.type value. type:${module.type}, ${fixedError}.`;
                throw new Error(message);
            }
        }
        module && moduleResolveCache.set(cacheKey, module);
        return module;
    }
    /**
     * 输出模块跟踪信息
     * @param who 谁要跟踪模块信息，一般传入插件名称
     * @param type 跟踪类型，如 asset、html、script、dynamic、、、
     * @param module resolve的模块对象
     */
    function traceModule(who: string, type: string, module: ModuleOptions) {
        const id = module.type == "src" ? relative(options.srcRoot, module.id) : module.id;
        console.log(pc.cyan(`  ----  ${who}`), pc.gray(`resolve ${type} module: ${id}`));
    }
    /**
    * 是否是指定后缀的模块
    * @param module 模块信息，分析启后缀名称，与exts比配
    * @param exts 后缀数组
    */
    function isExtFile(module: ModuleOptions | string, exts: string[] | readonly string[]): boolean {
        if (module && isArrayNotEmpty(exts)) {
            const ext = typeof (module) == "string" ? extname(module).toLowerCase() : module.ext;
            return exts.indexOf(ext) !== -1;
        }
        return false;
    }
    /**
     * 是否是资源文件模块
     * @param module 
     * @returns 
     */
    function isAsset(module: ModuleOptions | string): boolean {
        /* 后期支持从这里扩充 文件后缀 */
        return isExtFile(module, EXTS_ASSET);
    }
    /**
     * 是否是js脚本模块
     * @param module 
     * @returns true/false
     */
    function isScript(module: ModuleOptions | string): boolean {
        /* 后期支持从这里扩充 文件后缀 */
        return isExtFile(module, EXTS_SCRIPT);
    }
    /**
     * 是否是css样式模块
     * @param module 
     * @returns true/false
     */
    function isStyle(module: ModuleOptions | string): boolean {
        /* 后期支持从这里扩充 文件后缀 */
        return isExtFile(module, EXTS_STYLES);
    }
    //#endregion

    //#region ************************************** 文件处理 *************************************
    /**
     * 强制文件的后缀
     * - 将一些预编译文件输出后的后缀做一下强制修改
     * - 如 .ts强制.js,.less强制.css
     * @param file 文件路径
     * @returns 整理后缀后的新文件路径
     */
    function forceFileExt(file: string): string {
        if (isScript(file) == true) {
            return forceExt(file, ".js");
        }
        if (isStyle(file) == true) {
            return forceExt(file, ".css");
        }
        return file;
    }
    /**
     * 读取文件文本数据；默认utf-8模式读取
     * @param file 
     */
    function readFileText(file: string): string {
        //  后续在这里加上异常等处理逻辑，进一步完善功能
        return readFileSync(file, "utf-8");
    }
    /**
     * 复制文件
     * @param src 源文件
     * @param dist 目标输出路径
     */
    function copyFile(src: string, dist: string): void {
        // 输出文件信息后期分析输出路径必须在 distRoot下
        trace(`\t${relative(options.srcRoot, src)}    \t---->    ${relative(options.distRoot, dist)}`);
        checkExists(src, `src`);
        createDir(dist);
        cpSync(src, dist, { recursive: true });
    }
    /**
     * 写文件
     * @param dist 文件路径
     * @param data 文件内容
     */
    function writeFile(dist: string, data: string | NodeJS.ArrayBufferView) {
        // 输出文件信息后期分析输出路径必须在 distRoot下
        createDir(dist);
        writeFileSync(dist, data)
    }

    /**
     * 构建src的输出路径
     * @param src 
     * @returns dist为输出路径，url为网络路径
     */
    function buildPath(src: string): { dist: string, url: string } {
        //  后期验证src必须在srcRoot目录下
        const dist = buildDist(options, src);
        const url = buildNetPath(options, dist);
        return { dist, url };
    }
    //#endregion

    //#region ************************************** 规则验证 *************************************
    /**
     * 触发指定规则输出错误信息，非watch模式下，直接退出
     * @param rule 规则信息
     * @param source 源文件
     * @param importer 由谁引入的source文件
     * @param reasons 补充一些原因说明
     */
    function triggerRule(rule: string, source: string, importer: string, ...reasons: string[]): void {
        console.log(pc.redBright(`  ----  error rule:   ${rule}`));
        source && console.log(pc.gray(`\tsource:       ${source}`));
        importer && console.log(pc.gray(`\timporter:     ${importer}`));
        isArrayNotEmpty(reasons) && reasons.forEach(reason => console.log(pc.gray(`\t${reason}`)));
        isWatchMode || process.exit(0);
    }

    /**
     * 必须在SrcRoot目录下，否则报错
     * @param module 模块信息
     * @param source 源文件
     * @param importer 由谁引入的source文件
     */
    function mustInSrcRoot(module: ModuleOptions, source: string, importer: string): void {
        if (isChild(options.srcRoot, module.id) == false) {
            const rule = "import file must be child of srcRoot: cannot analysis url of outside file.";
            triggerRule(rule, source, importer);
        }
    }
    //#endregion

    return {
        assets, globals, isProduction, isWatchMode,
        isDynamicModule: id => id.startsWith("DMI:"),
        isUrlModule: id => id.startsWith("url:"),
        resolveModule, traceModule, isAsset, isScript, isStyle, isChild, isNetPath,
        forceExt, forceFileExt, readFileText, copyFile, writeFile, buildPath,
        mustInSrcRoot, triggerRule
    };
}