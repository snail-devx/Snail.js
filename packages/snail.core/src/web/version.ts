import { mustString, extract, hasOwnProperty, isObject, tidyString } from "../base/data";
import { throwIfUndefined } from "../base/error";
import { url } from "./url";
import { IVersionManager, VersionOptions } from "./models/version";
import { UrlParseResult } from "./models/url";

/** 把自己的类型共享出去 */
export * from "./models/version"

/**
 * 版本管理模块
 * - 支持全局配置版本号，特定文件自定义版本
 * - 支持新作用域 newScope ，和全局配置隔离
 */
export namespace version {
    /** 默认的版本值 */
    const DEFAULT_VERSION = String(new Date().getTime());
    /** 全局默认版本配置*/
    const CONFIG: VersionOptions = { query: undefined, version: undefined };
    /** 全局版本管理 */
    const global: IVersionManager = newScope();

    //#region ************************************* 公共方法、变量 *************************************
    /**
     * 新的版本作用域：执行后返回一个全新的管理器对象
     * @param options 配置选项
     * @returns 新的管理器对象
     */
    export function newScope(options?: Partial<VersionOptions>): IVersionManager {
        options = Object.freeze(checkVersionOptions(options));
        /** 版本文件：用于指定特定文件的版本信息；key为文件路径（不带查询参数和锚点），value为带有版本的url地址 */
        const versionFiles: { [key in string]: string } = Object.create(null);

        //#region *************************************实现接口：IVersionManager接口方法*************************************
        /**
         * 获取版本值
         * @param needQuery 是否需要版本查询参数
         * @returns 版本值，未设置则返回全局的
         * - false 则为 version
         * - true 则为 query=version
         */
        function getVersion(needQuery?: boolean): string {
            const vv = options.version || CONFIG.version || DEFAULT_VERSION;
            return needQuery
                ? `${options.query || CONFIG.query || "_snv"}=${vv}`
                : vv;
        }
        /**
         * 添加文本版本；满足特定文件走固定版本规则
         * @param file 文件路径：绝对路径，不区分大小写；忽略url的query和hash
         * @param fileUrl 带有版本的url地址
         * @returns 管理器自身
         */
        function addFile(file: string, fileUrl: string): IVersionManager {
            let upr: UrlParseResult = url.parse(file);
            throwIfUndefined(upr, "file must be a non-empty string.");
            mustString(fileUrl, "fileUrl");
            //  加入版本，不区分大小写
            versionFiles[upr.file.toLowerCase()] = fileUrl;
            return manager;
        }
        /**
         * 格式化url，自动加上版本查询参数
         * - 已配置文件版本（忽略file的query、hash）,将file的query和hash追加到fileUrl中返回
         * - 未配置文本版本，则将配置的version信息追加到url中
         * @param file 文件路径
         * @returns 格式化后带有版本的url地址
         */
        function formart(file: string): string {
            //  1、准备工作：如果url自带版本号了，则不用处理直接返回
            mustString(file, "file");
            let upr: UrlParseResult = url.parse(file);
            let vQuery = options.query || CONFIG.query || "_snv";
            if (upr.queryMap.get(vQuery) !== null) {
                return file;
            }
            //  2、取文件级别配置，若存在则合并query和hash信息；否则直接追加
            let target = versionFiles[upr.file.toLowerCase()];
            if (target === undefined) {
                upr.queryMap.append(vQuery, getVersion());
            }
            else {
                let tUpr: UrlParseResult = url.parse(target);
                upr.file = tUpr.file;
                upr.hash || (upr.hash = tUpr.hash);
                tUpr.queryMap.forEach((value, key) => {
                    upr.queryMap.get(key) === null && upr.queryMap.append(key, value);
                });
            }
            return upr.hash
                ? `${upr.file}?${upr.queryMap}#${upr.hash}`
                : `${upr.file}?${upr.queryMap}`;
        }
        //#endregion

        /** 管理器对象 */
        const manager: IVersionManager = Object.freeze({ config, getVersion, addFile, formart });
        return manager;
    }
    /**
     * 配置全局版本管理器
     * @param options 默认配置选项
     * @returns 管理器自身
     */
    export function config(options: Partial<VersionOptions>): IVersionManager {
        options = checkVersionOptions(options);
        Object.assign(CONFIG, options);

        return global;
    }
    /**
     * 获取全局版本值
     * @param needQuery 是否需要版本查询参数
     * @returns 版本值，未设置则返回全局的
     * - false 则为 version
     * - true 则为 query=version
     */
    export function getVersion(needQuery?: boolean): string {
        return global.getVersion(needQuery);
    }
    /**
     * 添加文本版本；满足特定文件走固定版本规则
     * @param file 文件路径：绝对路径，不区分大小写；忽略url的query和hash
     * @param url 带有版本的url地址
     * @returns 管理器自身
     */
    export function addFile(file: string, url: string): IVersionManager {
        return global.addFile(file, url);
    }
    /**
     * 格式化url，自动加上版本查询参数
     * - 已配置文件版本（忽略file的query、hash），则直接返回对应的fileUrl
     * - 未配置文本版本，则将配置的version信息追加到url中
     * @param url url地址
     * @returns 格式化后带有版本的url地址
     */
    export function formart(url: string): string {
        return global.formart(url);
    }
    //#endregion

    //#region ************************************* 私有方法 *************************************
    /**
     * 检测脚本配置选项
     * @param options 
     * @returns 
     */
    function checkVersionOptions(options: Partial<VersionOptions>): VersionOptions {
        //  仅提取指定key数据，避免外部传入object无效key影响
        options = extract<VersionOptions>(Object.keys(CONFIG), options);
        //  清理空数据
        options.query = tidyString(options.query);
        options.version = tidyString(options.version);

        return options as VersionOptions;
    }
    //#endregion
}