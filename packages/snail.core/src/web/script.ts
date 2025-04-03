import { isArray, isArrayNotEmpty, isNullOrUndefined, isObject, isStringNotEmpty, hasOwnProperty } from "../base/data";
import { drilling, ensureFunction, ensureString, tidyString, } from "../base/data";
import { throwError, throwIfNullOrUndefined, throwIfTrue } from "../base/error";
import { defer } from "../base/promise";
import { url } from "./url";
import { http } from "./http";
import { version } from "./version";
import { IScriptHandle, IScriptManager, ScriptFile, ScriptLoadOptions, ScriptOptions } from "./models/script";
import { IHttpClient } from "./models/http";

/**
 * 脚本模块：支持动态加载指定js模块，支持锚点
 * - 支持cmd、amd、umd和iife方式加载js模块
 */
export namespace script {
    /** 全局脚本配置 */
    const CONFIG: ScriptOptions = { origin: undefined, version: undefined };
    /** 脚本HTTP客户端：用于从网络下载js脚本做动态构建*/
    const HC: IHttpClient = http.create(undefined);

    /**
     * 新的脚本作用域：执行后返回一个全新的管理器对象
     * @param options 配置选项
     * @returns 脚本管理器对象
     */
    export function newScope(options?: Partial<ScriptOptions>): IScriptManager {
        /** 脚本配置选项 */
        options = isObject(options) ? Object.freeze(Object.assign({}, options)) : Object.create(null);
        /** 注册的脚本信息：key为脚本id,value为脚本信息 */
        const SCRIPTS: Record<string, ScriptFile> = Object.create(null);
        /** http加载脚本任务字典：key为脚本id，value为promise对象：避免同一个脚本重复加载 */
        const LOADTASKMAP: Record<string, Promise<any>> = Object.create(null);

        //#region *************************************实现接口：IScriptManager接口方法*************************************
        /**
         * 注册脚本
         * - 重复注册同一脚本，报错
         * @param files 脚本文件数组
         * @returns 脚本句柄，支持对注册的脚本做销毁等操作
         */
        function register(files: (string | ScriptFile)[]): IScriptHandle {
            const sfs: Record<string, ScriptFile> = Object.create(null);
            const defaultOrign: string = options.origin || CONFIG.origin;
            isArrayNotEmpty(files) && files.forEach(file => {
                //  格式化验证
                throwIfNullOrUndefined(file, "file is invalid in files:null or undefined");
                let sf: ScriptFile = undefined;
                if (typeof (file) == "string") {
                    sf = formScriptUrl(file, undefined, defaultOrign);
                }
                else {
                    //  exports有值时，不用格式化，后面load时直接返回exports
                    sf = file.exports !== undefined
                        ? Object.assign({}, file)
                        : formScriptUrl(file.url, undefined, defaultOrign);
                    sf.id = tidyString(file.id) || sf.id;
                }
                ensureString(sf.id, "sf.id");
                //  注册：判断存在性；注册前锁定对象
                throwIfTrue(hasOwnProperty(SCRIPTS, sf.id), `files[${sf.id}] has been registered`);
                sf = Object.freeze(sf);
                SCRIPTS[sf.id] = sf;
                sfs[sf.id] = sf;
            });
            return {
                destroy: () => destroyScript(sfs)
            }
        }
        /**
         * 指定脚本是否已注册
         * @param id 脚本id；传入模块名（如：vue），或者脚本url地址（如：/xx/xhs/test.js）
         * @param referUrl 参照url地址。当id为脚本url为相对路径时，基于referUrl分析具体的绝对路径
         * @returns 存在返回true；否则false
         */
        function has(id: string, referUrl?: string): boolean {
            return getScriptFile(id, referUrl).script !== undefined;
        }
        /**
         * 加载指定脚本：获取脚本内容并执行，返回export对象信息
         * @param id 脚本id；传入模块名（如：vue），或者脚本url地址（如：/xx/xhs/test.js）
         * - id 支持锚点模式，逐级钻取export下的key信息，如 #components.dialog
         * - id 锚点支持批量，使用#号分隔，如 #components.dialog#components.follow#components.isFunction
         * @param loadOptions 脚本加载的配置选项
         * @remarks 若脚本依赖其他脚本，依赖脚本在当前scope未注册，则会从global中查找
         * @returns 解析后的脚本对象
         */
        function load<T>(id: string, loadOptions?: ScriptLoadOptions): Promise<T> {
            /** 查找脚本：file
             *      1、是否已注册：当前manager是否已注册；未注册则从global全局查找是否注册，达到复用目的
             *      2、未注册：基于id在当manager中就地注册，方便下次复用
             *  加载脚本：构建loadTask
             *      1、为global注册，直接中转到global的load方法
             *      2、当前manager注册
             *          1、file是否存在exports值，存在直接返回
             *          2、file.id是否已经加载过了，加载过了直接返回，复用
             *          3、全新加载：使用http下载脚本并构建；若此时判断已经进入死循环加载了，则直接返回
             * 解析hash值：根据传入id解析出来的hash做钻取
             *      1、无则不用解析
             *      2、1个，则返回钻取对象
             *      3、>1，则构建json，将每个hash做key构建
             */
            isObject(loadOptions) || (loadOptions = { ids: [], refer: undefined });
            isArray(loadOptions.ids) || (loadOptions.ids = []);
            let trunToGlobal: boolean = false;
            let hash: string = undefined, file: ScriptFile = undefined;
            //  1、查找脚本
            ({ id, script: file, hash } = getScriptFile(id, loadOptions.refer));
            if (file === undefined) {
                trunToGlobal = manager !== global && global.has(id, loadOptions.refer);
                if (trunToGlobal == false) {
                    file = formScriptUrl(id, loadOptions.refer, options.origin || CONFIG.origin);
                    SCRIPTS[file.id] = file;
                }
            }
            //  2、加载脚本：全局、缓存都不存在时，使用http下载脚本做动态加载
            let loadTask: Promise<any> = trunToGlobal
                ? global.load(id, loadOptions)
                : file.exports !== undefined ? Promise.resolve(file.exports) : undefined;
            //      需要进行HTTP加载，加载前验证脚本是否死循环，是否有缓存
            if (loadTask == undefined) {
                loadTask = LOADTASKMAP[file.id];
                if (loadOptions.ids.indexOf(file.id) != -1) {
                    const message = `circular load script.path:${loadOptions.ids.concat(file.id)}`;
                    return Promise.reject(message);
                }
            }
            //      发送http请求加载脚本
            if (loadTask == undefined) {
                const requestUrl: string = (options.version || CONFIG.version || version).formart(file.url);
                loadTask = HC.get<string>(requestUrl)
                    .then(
                        text => {
                            loadOptions = { ids: [...loadOptions.ids, file.id], refer: file.url };
                            return buildScriptByText(manager, text, loadOptions);
                        },
                        Promise.reject
                    )
                    .then(
                        obj => {
                            console.log(`load script[${file.id}] success`, obj);
                            return Promise.resolve(obj);
                        },
                        reaon => {
                            console.error(`load script[${file.id}] failed`, reaon);
                            return Promise.reject(`load script[${file.id}] failed.${reaon.message}`);
                        }
                    );
                LOADTASKMAP[file.id] = loadTask;
            }
            //  3、解析hash值
            let hashes: string[] = (hash || "").split('#').map(item => item.trim()).filter(item => item !== "");
            return hashes.length == 0
                ? loadTask
                : loadTask.then(
                    data => {
                        const ret = Object.create(null);
                        hashes.forEach(item => ret[item] = drilling(data, item.split(".")));
                        return hashes.length == 1
                            ? ret[Object.keys(ret)[0]]
                            : ret;
                    },
                    Promise.reject
                );
        }
        /**
         * 批量加载脚本：获取脚本内容并执行，返回export对象信息
         * @param ids 脚本id集合：传入模块名（如：vue），或者脚本url地址（如：/xx/xhs/test.js）
         * - id 支持锚点模式，逐级钻取export下的key信息，如 #components.dialog
         * - id 锚点支持批量，使用#号分隔，如 #components.dialog#components.follow#components.isFunction
         * @param loadOptions 脚本加载的配置选项
         * @remarks 若脚本依赖其他脚本，依赖脚本在当前scope未注册，则会从global中查找
         * @returns 解析后的脚本对象，按照ids顺序返回
         */
        function loads(ids: string[], loadOptions?: ScriptLoadOptions): Promise<any[]> {
            /* promise.all能确保顺序*/
            return isArrayNotEmpty(ids)
                ? Promise.all(ids.map(id => load<any>(id, loadOptions)))
                : Promise.reject("ids must be an array and cannot ben empty");
        }
        /**
         * 销毁脚本
         */
        function destroy(): void {
            destroyScript(SCRIPTS);
        }
        //#endregion

        //#region *************************************辅助方法：IScriptManager方法使用*************************************
        /**
         * 基于Id获取信息
         * @param id  脚本id
         * @param referUrl 参照url地址。当url为相对路径时，基于referUrl分析具体的绝对路径
         * @returns 能找到则script有值，否则为undefined；id是去掉锚点的id值；hash为锚点值
         */
        function getScriptFile(id: string, referUrl: string): { script: ScriptFile | undefined, id: string, hash: string | undefined } {
            //  hash分析
            let hash: string = undefined;
            if (isStringNotEmpty(id) == true) {
                const index: number = id.indexOf('#');
                if (index != -1) {
                    hash = id.substring(index);
                    id = id.substring(0, index);
                }
            }
            ensureString(id = tidyString(id), "id");
            //  直接基于id查找
            let sf: ScriptFile = SCRIPTS[id];
            if (!sf) {
                const tmpId: string = formScriptUrl(id, referUrl, options.origin || CONFIG.origin).id;
                sf = SCRIPTS[tmpId];
                sf && (id = tmpId);
            }

            return { script: sf, id, hash };
        }
        /**
         * 销毁指定的脚本文件
         * @param files 
         */
        function destroyScript(files: Record<string, ScriptFile>): void {
            Object.keys(files).forEach(key => {
                delete SCRIPTS[key];
                delete LOADTASKMAP[key];
            });
        }
        //#endregion

        //  管理器对象构建
        const manager: IScriptManager = Object.freeze({ register, has, load, loads, destroy });
        return manager;
    }

    //#region *************************************script 导出方法 *************************************
    /** 全局脚本管理器 */
    const global: IScriptManager = newScope(undefined);
    /** 备份的配置；在config时若传入undefined等值，做还原 */
    const BACKCONFIG: ScriptOptions = Object.freeze(Object.assign({}, CONFIG));
    /**
     * 配置脚本管理器
     * @param config 
     */
    export function config(config: Partial<ScriptOptions>): void {
        //  不能使用 CONFIG[key] = options[key] || BAKCONFIG[key]；内部有true、false值的的key
        if (isObject(config) == true) {
            for (const key in CONFIG) {
                hasOwnProperty(CONFIG, key) && (CONFIG[key] = config[key] == undefined
                    ? BACKCONFIG[key]
                    : config[key]
                );
            }
        }
    }
    /**
     * 注册脚本
     * - 重复注册同一脚本，报错
     * @param files 脚本文件数组
     * @returns 脚本句柄，支持对注册的脚本做销毁等操作
     */
    export function register(files: (string | ScriptFile)[]): IScriptHandle {
        return global.register(files);
    }
    /**
     * 指定脚本是否已注册
     * @param id 脚本id；传入模块名（如：vue），或者脚本url地址（如：/xx/xhs/test.js）
     * @returns 存在返回true；否则false
     */
    export function has(id: string): boolean {
        return global.has(id);
    }
    /**
     * 加载指定脚本：获取脚本内容并执行，返回export对象信息
     * @param id 脚本id；传入模块名（如：vue），或者脚本url地址（如：/xx/xhs/test.js）
     * - id 支持锚点模式，逐级钻取export下的key信息，如 #components.dialog
     * - id 锚点支持批量，使用#号分隔，如 #components.dialog#components.follow#components.isFunction
     * @remarks 若脚本依赖其他脚本，依赖脚本在当前scope未注册，则会从global中查找
     * @returns 解析后的脚本对象
     */
    export function load<T>(id: string): Promise<T> {
        return global.load<T>(id);
    }
    /**
     * 批量加载脚本：获取脚本内容并执行，返回export对象信息
     * @param ids 脚本id集合：传入模块名（如：vue），或者脚本url地址（如：/xx/xhs/test.js）
     * - id 支持锚点模式，逐级钻取export下的key信息，如 #components.dialog
     * - id 锚点支持批量，使用#号分隔，如 #components.dialog#components.follow#components.isFunction
     * @remarks 若脚本依赖其他脚本，依赖脚本在当前scope未注册，则会从global中查找
     * @returns 解析后的脚本对象，按照ids顺序返回
     */
    export function loads(ids: string[]): Promise<any[]> {
        return global.loads(ids);
    }
    //#region 


    //#region *************************************script全局私有助手方法*************************************
    /**
     * 格式化脚本url
     * @param file 脚本文件路径
     * @param referUrl 参照url地址。当url为相对路径时，基于referUrl分析具体的绝对路径
     * - 加载脚本内部依赖模块时，可能存在向对路径的情况
     * @param defaultOrign 默认的服务器地址；外部不传入，则使用location.origin
     * @returns 脚本文件
     */
    function formScriptUrl(file: string, referUrl: string, defaultOrign: string) {
        /** 实现思路：推导出baseUrl地址；然后new Url(file,baseUrl)得到scriptUrl
         *  默认origin推导：scope->global->location；前两步骤需要外部处理
         *  baseUrl推导，需基于referUrl做处理，实现script内部依赖脚本向对路径时，能够正确得到路径信息
         *      - referUrl 未传入，基于默认origin
         *      - referUrl 为siteUrl时，以此为准
         *      - referUrl 为绝对路径时，基于默认origin构建完成siteUrl
         *      - referUrl 相对路径时，无效，spa应用下，相对谁？
         */
        //  推导构建脚本文件的baseUrl信息
        let scriptUrl: URL = undefined;
        {
            ensureString(file, "file");
            referUrl = tidyString(referUrl);
            defaultOrign = tidyString(defaultOrign) || location.origin;
            const baseUrl: string = referUrl == null
                ? defaultOrign
                : url.isSite(referUrl)
                    ? referUrl
                    : url.isAbsolute(referUrl)
                        ? defaultOrign.concat(referUrl)
                        : undefined;
            scriptUrl = baseUrl ? new URL(file, baseUrl) : new URL(file);
        }
        //  若url和location.origin同源，则仅使用path；否则加上origin值
        const path: string = url.format(scriptUrl.pathname);
        throwIfTrue(path == "", `file[${path}]is invalid, it is empty after format`);
        return {
            id: scriptUrl.origin == location.origin
                ? scriptUrl.pathname.toLowerCase()
                : `${scriptUrl.origin}${scriptUrl.pathname}`.toLowerCase(),
            url: scriptUrl.href,
            exports: undefined
        }
    }
    /**
    * 基于文本构建js脚本模块
    * @param manager 
    * @param text 
    * @param loadOptions 
    * @returns 下载后构建好的js脚本模块
    */
    function buildScriptByText(manager: IScriptManager, text: string, loadOptions: ScriptLoadOptions): Promise<any> {
        /** 支持amd/cmd、umd、iife模式的js脚本解析加载
         *      1、使用new Function构建方法做执行
         *      2、拦截define，进行defind方法调用，内部分析ids数据，然后做依赖分析
         *      3、cmd的require屏蔽掉，不支持；纯异步逻辑，require要求同步加载，这里不支持
         *      4、对this做拦截，避免指向全局；使用apply改变this指向
         *      5、全局使用严格模式，避免a=1；这类直接往window上写变量值
         *          目前效果：a=1；若window上未定义会报错，若定义了，则会直接改了window上的a值
         *          后续考虑遍历window下的所有变量，在Function之前定义一下，这样Function中就无法直接针对全局赋值了，或者改变变量值了
         *          但是需要把document等特定key对外开放，可以配置，放到ScriptOptions中配置
         *  umd模式示例代码：
                function (global, factory) {
                    typeof exports === 'object' && typeof module !== 'undefined' 
                        ? factory(exports, require('../../Core.js'), require('../../Common/UI.Core.js')) 
                        :typeof define === 'function' && define.amd 
                            ? define(['exports', '../../Common/Core.js', '../../Common/UI.Core.js'], factory)
                            :(global = typeof globalThis !== 'undefined' ? globalThis : global || self, 
                                factory(global.do = global.do || {}, global.core, global.ui));
                })(this, (function (exports, core, ui) {
         *   amd模式示例代码：
                define(['exports', '../../Common/UI.Core.js', '../../Common/Core.js'], (function (exports, ui, core) { 'use strict';
         */
        const deferred = defer<any>();
        //  1、准备参数，做拦截处理
        /**     amd脚本加载任务：为null表示非amd模式，需要考虑iife等 */
        let amdTask: Promise<any> = undefined;
        /**     全局上下文对象，避免直接指向window */
        const globalThis = Object.create(null);
        /**     执行脚本时的全局参数：拦截各种模式的加载逻辑 */
        const globalArgs = Object.create(null);
        {
            globalArgs.globalThis = globalThis;
            globalArgs.window = globalThis;
            /*  拦截cmd模式js加载，它利用require，是同步加载方式
             *      typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('./Core.ts'))
             */
            globalArgs.exports = undefined;
            globalArgs.module = undefined;
            globalArgs.require = function () {
                deferred.reject(`cmd require function is not support,try to amd.args:${JSON.stringify(arguments)}`);
            }
            /** 拦截es模式js加载 import 方法；这个得是同步的
             * import ('/x.js');
             */
            globalArgs.import = function () {
                deferred.reject(`es import function is not support,try to amd.args:${JSON.stringify(arguments)}`)
            }
            /** 拦截amd的define，完成内部依js脚本处理
             *  1、此方法各种用法都有
             *      define(id?,dependency?, factory)
             *      参数从后往前：factory,依赖模块（可空，字符串或者数组），当前模块id（可空）
             *  2、暂时不支持 factory中动态参数（require、exports、module等）,后续看情况支持
             *      define('hello', ['jquery'], function(require, exports, module)
             */
            globalArgs.define = function () {
                const id: string = tidyString(arguments[arguments.length - 3]);
                const deps: string[] | string = arguments[arguments.length - 2] || undefined;
                const factory: Function = arguments[arguments.length - 1] || undefined;
                id && console.warn(`define does not support id[${id}] argument,will ignore it`, { id, deps, factory });
                ensureFunction(factory, "factory must be a function");
                //  加载依赖脚本；exports依赖，直接返回amdExports对象，用于导出模块
                const amdExports = Object.create(null);
                let hasExportsDep = false;
                const depTasks: Promise<any>[] = (typeof (deps) == "string" ? [deps] : (deps || []))
                    .map(dep => dep === "exports"
                        ? (hasExportsDep = true, Promise.resolve(amdExports))
                        : manager.load<any>(dep, loadOptions)
                    );
                //  执行factory
                //      无依赖脚本，直接执行
                if (depTasks.length == 0) {
                    let frt = factory.apply(globalThis);
                    amdTask = Promise.resolve(frt);
                }
                //      有依赖脚本：需要剔除掉 exports
                else {
                    amdTask = Promise.all(depTasks).then(
                        (data: any[]) => {
                            let frt = factory.apply(globalThis, data);
                            return hasExportsDep == true ? amdExports : frt;
                        },
                        reason => Promise.reject(reason)
                    );
                }
            }
            globalArgs.define.amd = "snail.script";
        }
        //  2、使用Function解析脚本，屏蔽一些全局变量
        try {
            /** 构造Func执行：强制严格模式：Object.keys/values 在key都是字符串时，保持一致；不用担心熟悉怒
             *  梳理返回结果。amdTask为undefined时，表示iife等模式
             *      iife，从globalThis取第一个key作为返回值，无则直接ret。不是很好，需要再优化一下
             *      amd模式：等到结果
             */
            const funcRet = new Function(...Object.keys(globalArgs), `'use strict';${text || ""}`)
                .apply(globalThis, Object.values(globalArgs));
            amdTask == undefined
                ? deferred.resolve(isNullOrUndefined(funcRet) ? globalThis[Object.keys[0]] : funcRet)
                : amdTask.then(deferred.resolve, deferred.reject);
        }
        catch (ex: any) {
            console.error("buildScriptByText build script error", ex);
            deferred.reject(`buildScriptByText build script error:${ex.message}`);
        }

        return deferred.promise;
    }
    //#endregion
}