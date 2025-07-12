/**
 * 版本管理 助手类
 *  1、仅针对 version.ts 提供，不对外
 */
import { extract, hasOwnProperty, tidyString } from "../../base/data";
import { VersionOptions } from "../models/version-model";

//#region ************************************* 版本配置 *************************************
/** 默认的版本值 */
export const DEFAULT_VERSION = String(new Date().getTime());
/** 全局默认版本配置*/
export const VERSION_CONFIG: VersionOptions = { query: undefined, version: undefined };

/**
 * 检测脚本配置选项
 * @param options 
 * @returns 
 */
export function checkVersionOptions(options: Partial<VersionOptions>): VersionOptions {
    //  仅提取指定key数据，避免外部传入object无效key影响
    options = extract<VersionOptions>(Object.keys(VERSION_CONFIG), options);
    //  清理无效数据：仅传入时才生效
    hasOwnProperty(options, "query") && (options.query = tidyString(options.query));
    hasOwnProperty(options, "version") && (options.version = tidyString(options.version));
    return options as VersionOptions;
}
//#endregion