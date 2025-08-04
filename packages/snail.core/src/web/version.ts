import { mustString } from "../base/data";
import { throwIfUndefined } from "../base/error";
import { url } from "./url";
import { IVersionManager, VersionOptions } from "./models/version-model";
import { UrlParseResult } from "./models/url-model";
import { checkScope, IScope, mountScope } from "../base/scope";
import { checkVersionOptions, DEFAULT_VERSION, VERSION_CONFIG } from "./utils/version-util";

// 把自己的类型共享出去
export * from "./models/version-model"

/**
 * 使用【版本管理器】
 * @param options 配置选项
 * @returns 全新的【版本管理器】+作用域 
 */
export function useVersion(options?: Partial<VersionOptions>): IVersionManager & IScope {
    options = Object.freeze(checkVersionOptions(options));
    /** 版本文件：用于指定特定文件的版本信息；key为文件路径（不带查询参数和锚点），value为带有版本的url地址 */
    const versionFiles: Record<string, string> = Object.create(null);

    //#region *************************************实现接口：IVersionManager接口方法*************************************
    /**
     * 获取版本值
     * @param needQuery 是否需要版本查询参数
     * @returns 版本值，未设置则返回全局的
     * - false 则为 version
     * - true 则为 query=version
     */
    function getVersion(needQuery?: boolean): string {
        checkScope(manager, "getVersion: manager destroyed.");
        const vv = options.version || VERSION_CONFIG.version || DEFAULT_VERSION;
        return needQuery
            ? `${options.query || VERSION_CONFIG.query || "_snv"}=${vv}`
            : vv;
    }
    /**
     * 添加文本版本；满足特定文件走固定版本规则
     * @param file 文件路径：绝对路径，不区分大小写；忽略url的query和hash
     * @param fileUrl 带有版本的url地址
     * @returns 管理器自身
     */
    function addFile(file: string, fileUrl: string): IVersionManager {
        checkScope(manager, "addFile: manager destroyed.");
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
        checkScope(manager, "formart: manager destroyed.");
        //  1、准备工作：如果url自带版本号了，则不用处理直接返回
        mustString(file, "file");
        let upr: UrlParseResult = url.parse(file);
        let vQuery = options.query || VERSION_CONFIG.query || "_snv";
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

    //  构建管理器实例，挂载scope作用域
    const manager = mountScope<IVersionManager>({ getVersion, addFile, formart }, "IVersionManager");
    manager.onDestroy(() => Object.keys(versionFiles).forEach(key => delete versionFiles[key]));
    return Object.freeze(manager);
}
/**
 * 版本管理 全局配置
 * @param options 默认配置选项
 * @returns 管理器自身
 */
export function configVersion(options: Partial<VersionOptions>): IVersionManager {
    options = checkVersionOptions(options);
    Object.assign(VERSION_CONFIG, options);
    return version;
}
/** 
 * 全局【版本管理】
 */
export const version: IVersionManager = useVersion();