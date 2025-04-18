import { BuilderOptions } from "../models/builder";
import { ComponentContext, ComponentOptions } from "../models/component";
import { ModuleOptions, ModuleType } from "../models/module";
import { checkExists, forceExt, isChild, isNetPath, trace } from "../utils/helper";
import { dirname, extname, isAbsolute, join, resolve, sep } from "path";
import pc from "picocolors";
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { isArrayNotEmpty, throwIfFalse, throwIfUndefined, url } from "snail.core";

/** 模块解析缓存：key为模块id，value为模块信息 */
const moduleResolveCache: Map<string, ModuleOptions> = new Map();
/** 扩展名：脚本文件 */
const EXTS_SCRIPT = Object.freeze([".ts", ".js", ".cjs", ".mjs"]);
/** 扩展名：资产文件 */
const EXTS_ASSET = Object.freeze([".png", ".jpg", ".jpeg", ".gif", ".svg", ".html"]);
/** 扩展名：样式文件 */
const EXTS_STYLES = Object.freeze([".css", ".less", ".scss", ".sass"]);
/**
 * 插件辅助类
 * - 提供rollup插件常用功能
 * - 集成一些基础的组件打包验证工作
 */
export class PluginAssistant {
    //#region ************************************** 属性、构造方法 *************************************
    /** 打包组件配置选项 */
    public readonly component: ComponentOptions;
    /** 组件打包上下文；用于一些资源共享 */
    public readonly context: ComponentContext;
    /** 全局打包配置选项：约束siteRoot、srcRoot等 */
    public readonly options: BuilderOptions;
    /** 是否生产环境 */
    public readonly isProduction: boolean;
    /** 是否watch模式 */
    public readonly isWatchMode: boolean;
    /**
     * 构造方法
     * @param component 打包组件配置选项
     * @param context 组件打包上下文；用于一些资源共享
     * @param options 全局打包配置选项：约束siteRoot、srcRoot等
     */
    public constructor(component: ComponentOptions, context: ComponentContext, options: BuilderOptions) {
        this.component = component;
        this.context = context;
        this.options = options;
        this.isProduction = options.isProduction;
        this.isWatchMode = process.env["ROLLUP_WATCH"] == 'true';
    }
    //#endregion

    //#region ************************************** 组件分析 *************************************
    /**
     * 解析处理模块Id信息，基于id分析模块类型；如模块的url地址、类型等，ext等
     * @param 模块来源，如通过import引入
     * @param importer  谁引入了source
     * @returns 引入的模块信息
     */
    public resolveModule(source: string, importer: string): ModuleOptions | undefined {
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
        const cacheKey = source.toLowerCase();
        let module = moduleResolveCache.get(cacheKey);
        if (module != undefined) {
            return module;
        }
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
                    const ext = EXTS_SCRIPT.find(ext => existsSync(id.concat(ext)));
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
                const message = `resolve module failed: not support module.type value. type:${module.type}.`;
                throw new Error(message);
            }
        }
        module && moduleResolveCache.set(cacheKey, module);
        return module;
    }

    /**
     * 是否是指定后缀的模块
     * @param module 模块信息，分析启后缀名称，与exts比配
     * @param exts 后缀数组
     */
    public isExtFile(module: ModuleOptions | string, exts: string[] | readonly string[]): boolean {
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
    public isAsset(module: ModuleOptions | string): boolean {
        /* 后期支持从这里扩充 文件后缀 */
        return this.isExtFile(module, EXTS_ASSET);
    }
    /**
     * 是否是js脚本模块
     * @param module 
     * @returns true/false
     */
    public isScript(module: ModuleOptions | string): boolean {
        /* 后期支持从这里扩充 文件后缀 */
        return this.isExtFile(module, EXTS_SCRIPT);
    }
    /**
     * 是否是css样式模块
     * @param module 
     * @returns true/false
     */
    public isStyle(module: ModuleOptions | string): boolean {
        /* 后期支持从这里扩充 文件后缀 */
        return this.isExtFile(module, EXTS_STYLES);
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
    public forceFileExt(file: string): string {
        if (this.isScript(file) == true) {
            return forceExt(file, ".js");
        }
        if (this.isStyle(file) == true) {
            return forceExt(file, ".css");
        }
        return file;
    }
    /**
     * 读取文件文本数据；默认utf-8模式读取
     * @param file 
     */
    public readFileText(file: string): string {
        //  后续在这里加上异常等处理逻辑，进一步完善功能
        return readFileSync(file, "utf-8");
    }
    /**
     * 复制文件
     * @param src 源文件
     * @param dist 目标输出路径
     */
    public copyFile(src: string, dist: string): void {
        // 输出文件信息后期分析输出路径必须在 distRoot下
        trace(`--copy \t${src} \t➡️\t ${dist} `);
        checkExists(src, `src`);
        try {
            buildDir(dirname(dist));
            cpSync(src, dist, { recursive: true });
        }
        catch (ex: any) {
            console.log(pc.red(`----error:${ex.message} `));
        }
    }
    /**
     * 写文件
     * @param dist 文件路径
     * @param data 文件内容
     */
    public writeFile(dist: string, data: string | NodeJS.ArrayBufferView) {
        // 输出文件信息后期分析输出路径必须在 distRoot下
        buildDir(dirname(dist));
        writeFileSync(dist, data)
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
    public triggerRule(rule: string, source: string, importer: string, ...reasons: string[]): void {
        //  输出错误提示信息
        const msgs: string[] = [
            pc.bold(` * ${rule} `),
            `source         ${source} `,
            `componentSrc        ${this.component.src} `,
            `componentRoot       ${this.component.root} `,
            `srcRoot        ${this.options.srcRoot} `
        ];
        importer && msgs.splice(1, 0, `importer       ${importer} `);
        console.log(pc.red(msgs.join('\r\n\t')), "\r\n")
        this.isWatchMode || process.exit(0);

        // console.log(pc.red("import style file must be child of componentRoot when it is child of srcRoot."));
        // trace(`----component \t${ this.component.src } `);
        // trace(`----source \t${ from } `);
        // console.log(pc.bold('invalid @import files:'));
        // outRuleFiles.forEach(file => trace(`----${ file } `));
        // console.log(pc.bold('all @import files:'));
        // preResult.dependencies.forEach(file => trace(`----${ file } `))
        // isWatchMode || process.exit(1);
    }

    /**
     * 必须在SrcRoot目录下，否则报错
     * @param module 模块信息
     * @param source 源文件
     * @param importer 由谁引入的source文件
     */
    public mustInSrcRoot(module: ModuleOptions, source: string, importer: string): void {
        if (isChild(this.options.srcRoot, module.id) == false) {
            const rule = "import file must be child of srcRoot: cannot analysis url of outside file.";
            this.triggerRule(rule, source, importer);
        }
    }
    //#endregion
}

//#region ************************************** 私有方法 *************************************

/**
 * 构建目录，若不存在则自动构建
 * @param dir 要构建的目录；绝对路径，否则会先resolve
 */
function buildDir(dir: string): void {
    //  先resolve，确保格式统一；存在了则不创建
    dir = resolve(dir);
    if (existsSync(dir) === true) {
        return;
    }
    //  针对linux做一下兼容：linux文件路径绝对路径以"/"开头，截取后会导致开头的“丢失”。
    const dirNames = dir.split(sep);
    dir.startsWith(sep) && dirNames[0] == "" && (dirNames[0] = sep);
    let allPath: string = null;
    for (let index = 0; index < dirNames.length; index++) {
        if (allPath === null) {
            allPath = dirNames[index];
        }
        else {
            allPath = join(allPath, dirNames[index]);
            existsSync(allPath) || mkdirSync(allPath);
        }
    }
}
//#endregion