/**
 * js脚本助手方法
 *  1、将 script.ts中部分逻辑提取到这里；内部逻辑方法，不可挂载给外部库使用
 *  3、这些都是静态方法，和IScriptManager实例级别无关
 */
import { extract, hasOwnProperty, isNullOrUndefined, isStringNotEmpty } from "../../base/data";
import { drill, mustFunction, mustString, tidyString, } from "../../base/data";
import { getMessage, throwIfTrue } from "../../base/error";
import { defer } from "../../base/promise";
import { url } from "../url";
import { useHttp } from "../http";
import { IScriptManager, ScriptFile, ScriptLoadOptions, ScriptOptions } from "../models/script-model";
import { IHttpClient } from "../models/http-model";

//#region ************************************* 脚本配置 *************************************
/** 全局脚本配置 */
export const SCRIPT_CONFIG: ScriptOptions = { origin: undefined, version: undefined };

/**
 * 检测脚本配置选项
 * @param options
 * @returns
 */
export function checkScriptOptions(options: Partial<ScriptOptions>): ScriptOptions {
    //  仅提取指定key数据，避免外部传入object无效key影响
    options = extract<ScriptOptions>(Object.keys(SCRIPT_CONFIG), options);
    //  清理无效数据：仅传入时才生效
    hasOwnProperty(options, "origin") && (options.origin = tidyString(options.origin));

    return options as ScriptOptions;
}
//#endregion

//#region ************************************* 脚本管理 *************************************
/**
 * 格式化脚本url
 * @param file 脚本文件路径
 * @param referUrl 参照url地址。当url为相对路径时，基于referUrl分析具体的绝对路径
 * - 加载脚本内部依赖模块时，可能存在向对路径的情况
 * @param defaultOrign 默认的服务器地址；外部不传入，则使用location.origin
 * @returns 脚本文件
 */
export function formScriptUrl(file: string, referUrl: string, defaultOrign: string) {
    /** 实现思路：推导出baseUrl地址；然后new Url(file,baseUrl)得到scriptUrl
     *  默认origin推导：scope->global->location；前两步骤需要外部处理
     *  baseUrl推导，需基于referUrl做处理，实现script内部依赖脚本向对路径时，能够正确得到路径信息
     *      - referUrl 未传入，基于默认origin
     *      - referUrl 为siteUrl时，以此为准
     *      - referUrl 为绝对路径时，基于默认origin构建完成siteUrl
     *      - referUrl 相对路径时，无效，spa应用下，相对谁？
     */
    //  推导构建脚本文件的baseUrl信息
    let scriptUrl: URL = undefined; {
        mustString(file, "file");
        referUrl = tidyString(referUrl);
        defaultOrign = tidyString(defaultOrign) || location.origin;
        const baseUrl: string = referUrl == undefined
            ? defaultOrign
            : url.isSite(referUrl)
                ? referUrl
                : url.isAbsolute(referUrl)
                    ? defaultOrign.concat(referUrl)
                    : undefined;
        scriptUrl = baseUrl ? new URL(file, baseUrl) : new URL(file);
    }
    //  若url和origin同源，则仅使用path；否则加上origin值
    const path: string = url.format(scriptUrl.pathname);
    throwIfTrue(path == "", `file[${path}]is invalid, it is empty after format`);
    return {
        id: scriptUrl.origin == defaultOrign
            ? scriptUrl.pathname.toLowerCase()
            : `${scriptUrl.origin}${scriptUrl.pathname}`.toLowerCase(),
        url: scriptUrl.href,
        exports: undefined
    }
}
/**
 * 基于hash钻取脚本
 * @param exports 脚本导出对象
 * @param hash hash锚点值
 * @returns
 */
export function drillScriptByHash<T>(exports: any, hash: string): T | undefined {
    const hashes: string[] = (hash || "").split('#').map(item => item.trim()).filter(item => item !== "");
    if (hashes.length > 0) {
        const ret = Object.create(null);
        hashes.forEach(item => ret[item] = drill(exports, item.split(".")));
        return hashes.length == 1
            ? ret[Object.keys(ret)[0]]
            : ret;
    }
    return exports;
}
//#endregion

//#region ************************************* 脚本加载 *************************************
/** 脚本HTTP客户端：用于从网络下载js脚本做动态构建*/
const HC: IHttpClient = useHttp(undefined);
/**
 * 基于脚本url地址构建脚本：下载然后动态构建
 * @param manager
 * @param fileUrl
 * @param loadOptions
 * @returns
 */
export async function buildScriptByUrl(manager: IScriptManager, fileUrl: string, loadOptions: ScriptLoadOptions): Promise<any> {
    const deferred = defer<any>();
    //  1、准备参数，做拦截处理
    /**     amd脚本加载任务：为null表示非amd模式，需要考虑iife等 */
    let amdTask: Promise<any> = undefined;
    /**     全局上下文对象，避免直接指向window */
    const globalThis = Object.create(null);
    /**     模块挂载的exports变量 */
    const exports = Object.create(null);
    /**     执行脚本时的全局参数：拦截各种模式的加载逻辑 */
    const globalArgs = Object.create(null); {
        globalArgs.globalThis = globalThis;
        globalArgs.global = globalThis;
        globalArgs.self = globalThis;
        //  window对象先不做拦截，不免vue等组件报错
        // globalArgs.window = globalThis;
        /*  拦截cmd模式js加载，它利用require，是同步加载方式
         *      typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('./Core.ts'))
         */
        globalArgs.exports = exports;
        globalArgs.module = undefined;
        globalArgs.require = function () {
            const message = getMessage(arguments, "require function is not supported,try to amd define.args:");
            deferred.reject(message);
        }
        /** 拦截es模式js加载 import 方法；这个得是同步的
         * import ('/x.js');
         * @remarks 暂时不支持es模式，后续看情况支持
         * 代码备份
        globalArgs.import = function () {
        const message = getMessage(arguments, "es import function is not supported,try to amd.args:");
        deferred.reject(message);
        }
         */
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
            id && console.warn(`define does not support id[${id}] argument,will ignore it`, {
                id,
                deps,
                factory
            });
            mustFunction(factory, "define arguments 'factory'");
            //  加载依赖脚本；exports依赖，直接返回amdExports对象，用于导出模块
            let hasExportsDep = false;
            const depTasks: Promise<any>[] = (typeof (deps) == "string" ? [deps] : (deps || []))
                .map(dep => dep === "exports"
                    ? (hasExportsDep = true, Promise.resolve(exports))
                    : manager.load<any>(dep, loadOptions));
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
                        return hasExportsDep ? exports : frt;
                    },
                    reason => Promise.reject(reason));
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
        const text = await HC.get<string>(fileUrl);
        const funcRet = new Function(...Object.keys(globalArgs), `'use strict';${text || ""}`)
            .apply(globalThis, Object.values(globalArgs));
        amdTask == undefined
            ? deferred.resolve(isNullOrUndefined(funcRet)
                ? globalThis[Object.keys(globalThis)[0]]
                : funcRet)
            : amdTask.then(deferred.resolve, deferred.reject);
    } catch (ex: any) {
        console.error("buildScriptByUrl build script error", ex);
        deferred.reject(getMessage(ex, "buildScriptByUrl build script error:"));
    }
    return deferred.promise;
}
//#endregion
