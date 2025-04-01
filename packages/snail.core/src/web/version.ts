/**
 * 版本模块：支持url地址版本管理、全局版本号+特定文件版本号
 */

import { ensureString, hasOwnProperty, isObject } from "../base/data";
import { throwIfUndefined } from "../base/error";
import { url } from "./url";
import { IVersionManager, VersionOptions } from "./models/version";
import { UrlParseResult } from "./models/url";

/**
 * 管理管理模块
 * - 支持全局配置版本号，特定文件自定义版本
 * - 支持新作用域 newScope ，和全局配置隔离
 */
export namespace version {
    /** 全局默认版本配置*/
    const CONFIG: VersionOptions = { query: "_snv", version: String(new Date().getTime()) };
    /**
     * 新的版本作用域：执行后返回一个全新的管理器对象
     * @param context 上下文对象；
     * @returns 新的管理器对象
     */
    export function newScope(context?: object): IVersionManager {
        /** 管理器对象 */
        const manager: IVersionManager = isObject(context) ? context : Object.create(null);
        /** 配置选项：作用域级别 */
        var scopeConfig: VersionOptions = Object.create(null);
        /** 版本文件：用于指定特定文件的版本信息；key为文件路径（不带查询参数和锚点），value为带有版本的url地址 */
        const versionFiles: { [key in string]: string } = Object.create(null);

        /**
          * 配置版本管理器
          * @param options 默认配置选项，将options中的key覆盖配置中
          * @returns 管理器自身
          */
        function config(options: Partial<VersionOptions>): IVersionManager {
            Object.assign(scopeConfig, options);
            return manager;
        }
        /**
         * 获取版本值
         * @returns 版本值，未设置则返回全局的
         */
        function getVersion(): string {
            return scopeConfig.version || CONFIG.version;
        }
        /**
         * 添加文本版本；满足特定文件走固定版本规则
         * @param file 文件路径：绝对路径，不区分大小写；忽略url的query和hash
         * @param fileUrl 带有版本的url地址
         * @returns 管理器自身
         */
        function addFile(file: string, fileUrl: string): IVersionManager {
            let upr: UrlParseResult = url.parse(file);
            throwIfUndefined(upr, "file must be a string and cannot be empty");
            ensureString(fileUrl, "fileUrl");
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
            let upr: UrlParseResult = url.parse(file);
            throwIfUndefined(upr, "file must be a string and cannot be empty");
            let vQuery = scopeConfig.query || CONFIG.query;
            if (upr.queryMap.get(vQuery) !== null) {
                return file;
            }
            //  2、取文件级别配置，若存在则合并query和hash信息；否则直接追加
            let target = versionFiles[upr.file.toLowerCase()];
            if (target === undefined) {
                upr.queryMap.append(vQuery, scopeConfig.version || CONFIG.version);
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

        //  构建对象属性返回：先定义变量，这样进行型接口约束
        {
            const mgr: IVersionManager = { config, getVersion, addFile, formart };
            return Object.assign(manager, mgr);
        }
    }

    /** 全局版本管理 */
    const global: IVersionManager = newScope(Object.create(null));
    /** 备份的配置；在config时若传入undefined等值，做还原 */
    const BAKCONFIG: VersionOptions = Object.freeze(Object.assign({}, CONFIG));
    /**
     * 配置全局版本管理器
     * @param options 默认配置选项
     * @returns 管理器自身
     */
    export function config(options: Partial<VersionOptions>): IVersionManager {
        //  更新给自己实例，然后再同步到全局；全局配置，只有有值时才更新
        if (isObject(options) == true) {
            global.config(options);
            for (var key in CONFIG) {
                hasOwnProperty(options, key)
                    && (CONFIG[key] = options[key] || BAKCONFIG[key]);
            }
        }
        return global;
    }
    /**
     * 获取全局版本值
     * @returns 版本值，未设置则返回全局的
     */
    export function getVersion(): string {
        return global.getVersion();
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
}