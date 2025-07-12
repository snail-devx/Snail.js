/**
 * 脚本模块：支持动态加载指定js模块，支持锚点
 * - 支持amd、umd和iife方式加载js模块
 * - 不支持cmd中使用require方法，核心为异步方式加载js，require为同步方式，强制报错
 */

import { isArray, isArrayNotEmpty, isObject, isStringNotEmpty, hasOwnProperty, extract } from "../base/data";
import { mustString, tidyString, } from "../base/data";
import { getMessage, throwIfNullOrUndefined, throwIfTrue } from "../base/error";
import { version } from "./version";
import { IScriptManager, ScriptFile, ScriptLoadOptions, ScriptOptions } from "./models/script-model";
import { checkScope, IScope, mountScope, useScope } from "../base/scope";
import { SCRIPT_CONFIG, checkScriptOptions, formScriptUrl, buildScriptByUrl, drillScriptByHash } from "./utils/script-util";

// 把自己的类型共享出去
export * from "./models/script-model"

/**
 * 使用【脚本管理】
 * - 全新作用域，和其他【脚本管理】实例隔离
 * @param  options 配置选项
 * @returns 全新的【脚本管理器】+作用域 
 */
export function useScript(options?: Partial<ScriptOptions>): IScriptManager & IScope {
    /** 脚本配置选项 */
    options = Object.freeze(checkScriptOptions(options));
    /** 注册的脚本信息：key为脚本id,value为脚本信息 */
    const SCRIPTS: Record<string, ScriptFile> = Object.create(null);
    /** http加载脚本任务字典：key为脚本id，value为promise对象：避免同一个脚本重复加载 */
    const LOADTASKMAP: Record<string, Promise<any>> = Object.create(null);

    //#region *************************************实现接口：IScriptManager接口方法*************************************
    /**
     * 注册脚本
     * - 重复注册同一脚本，报错
     * @param files 脚本文件数组（为string时为脚本url，脚本id则转小写）
     * @returns 脚本句柄，支持对注册的脚本做销毁等操作
     */
    function register(...files: (string | ScriptFile)[]): IScope {
        checkScope(manager, "register: script manager destroyed.");
        const sfs: Record<string, ScriptFile> = Object.create(null);
        const defaultOrign: string = options.origin || SCRIPT_CONFIG.origin;
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
            mustString(sf.id, "sf.id");
            //  注册：判断存在性；注册前锁定对象
            throwIfTrue(hasOwnProperty(SCRIPTS, sf.id), `files[${sf.id}] has been registered`);
            sf = Object.freeze(sf);
            SCRIPTS[sf.id] = sf;
            sfs[sf.id] = sf;
        });
        //  构建作用域返回：销毁时移除脚本
        return useScope().onDestroy(() => destroyScript(sfs));
    }
    /**
     * 指定脚本是否已注册
     * @param id 脚本id；传入模块名（如：vue），或者脚本url地址（如：/xx/xhs/test.js）
     * @param referUrl 参照url地址。当id为脚本url为相对路径时，基于referUrl分析具体的绝对路径
     * @returns 存在返回true；否则false
     */
    function has(id: string, referUrl?: string): boolean {
        checkScope(manager, "has: script manager destroyed.");
        return !!getScriptFile(id, referUrl).script;
    }
    /**
     * 加载指定脚本：获取脚本内容并执行，返回export对象信息
     * - 若id（去除锚点）未注册，则id作为脚本url地址就地注册脚本（id为url转小写）
     * - 若当前scope未注册此脚本，则尝试从全局的scipt执行加载
     * @param id 脚本id；传入模块名（如：vue），或者脚本url地址（如：/xx/xhs/test.js）
     * - id 支持锚点模式，逐级钻取export下的key信息，如 #components.dialog
     * - id 锚点支持批量，使用#号分隔，如 #components.dialog#components.follow#components.isFunction
     * @param loadOptions 脚本加载的配置选项
     * @remarks 若脚本依赖其他脚本，依赖脚本在当前scope未注册，则会从全局中查找
     * @returns 解析后的脚本对象
     */
    async function load<T>(id: string, loadOptions?: Partial<ScriptLoadOptions>): Promise<T> {
        checkScope(manager, "load: script manager destroyed.");
        /** 查找脚本：file
         *      1、是否已注册：当前manager是否已注册；未注册则从全局查找是否注册，达到复用目的
         *      2、未注册：基于id在当manager中就地注册，方便下次复用
         *  加载脚本：构建loadTask
         *      1、为全局注册，直接中转到script.load方法
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
        //  1、查找脚本：若不存在，则尝试全局中加载，否则就地全新注册
        let { script: file, hash } = getScriptFile(id, loadOptions.refer);
        if (file === undefined) {
            if (manager !== script && script.has(id, loadOptions.refer) == true) {
                return script.load(id, loadOptions);
            }
            file = formScriptUrl(id, loadOptions.refer, options.origin || SCRIPT_CONFIG.origin);
            SCRIPTS[file.id] = file;
        }
        //  2、构建脚本加载任务：若存在exports值，则直接复用返回；否则构建http加载loadTask
        if (file.exports !== undefined) {
            return drillScriptByHash(file.exports, hash);
        }
        //      判断死循环
        if (loadOptions.ids.indexOf(file.id) != -1) {
            const message = getMessage(loadOptions.ids.concat(file.id), `dead loop load script[${file.id}].`);
            return Promise.reject(message);
        }
        //      构建脚本加载任务：复用已有加载任务
        try {
            let loadTask: Promise<T> = LOADTASKMAP[file.id];
            if (loadTask === undefined) {
                const fileUrl: string = (options.version || SCRIPT_CONFIG.version || version).formart(file.url);
                loadTask = buildScriptByUrl(manager, fileUrl, { ids: [...loadOptions.ids, file.id], refer: file.url });
                LOADTASKMAP[file.id] = loadTask;
            }
            const exports = await loadTask;
            return drillScriptByHash(exports, hash);
        }
        catch (ex) {
            console.error(`load script[${file.id}] failed:`, ex);
            return Promise.reject(getMessage(ex, `load script[${file.id}] failed.`));
        }
    }
    /**
     * 批量加载脚本：获取脚本内容并执行，返回export对象信息
     * - 若id（去除锚点）未注册，则id作为脚本url地址就地注册脚本（id为url转小写）
     * - 若当前scope未注册此脚本，则尝试从全局的scipt执行加载
     * @param ids 脚本id集合：传入模块名（如：vue），或者脚本url地址（如：/xx/xhs/test.js）
     * - id 支持锚点模式，逐级钻取export下的key信息，如 #components.dialog
     * - id 锚点支持批量，使用#号分隔，如 #components.dialog#components.follow#components.isFunction
     * @param loadOptions 脚本加载的配置选项
     * @remarks 若脚本依赖其他脚本，依赖脚本在当前scope未注册，则会从全局中查找
     * @returns 解析后的脚本对象，按照ids顺序返回
     */
    async function loads(ids: string[], loadOptions?: Partial<ScriptLoadOptions>): Promise<any[]> {
        checkScope(manager, "loads: script manager destroyed.");
        /* promise.all能确保顺序*/
        return isArrayNotEmpty(ids)
            ? Promise.all(ids.map(id => load<any>(id, loadOptions)))
            : Promise.reject("ids must be an array and cannot ben empty");
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
        mustString(id = tidyString(id), "id");
        //  直接基于id查找
        let sf: ScriptFile = SCRIPTS[id];
        if (!sf) {
            const tmpId: string = formScriptUrl(id, referUrl, options.origin || SCRIPT_CONFIG.origin).id;
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

    //  构建管理器实例，挂载scope作用域
    const manager = mountScope<IScriptManager>({ register, has, load, loads });
    manager.onDestroy(() => destroyScript(SCRIPTS));
    return Object.freeze(manager);
}
/**
 * 全局的【脚本管理器】
 */
export const script: IScriptManager = useScript();
/**
 * 脚本管理 全局配置
 * @param options 
 */
export function configScript(options: Partial<ScriptOptions>): IScriptManager {
    options = checkScriptOptions(options);
    Object.assign(SCRIPT_CONFIG, options);
    return script;
}