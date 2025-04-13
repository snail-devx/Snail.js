/**
 * rollup构建器：实现多项目构建能力
 */

import { BuilderOptions, IRollupBuilder } from "./models/builder";
import { PluginBuilder } from "./models/component";
import { ensureString, isObject, throwError, throwIfFalse } from "snail.core"
import { resolve } from "path";
import { existsSync } from "fs";

//#region ************************************* 公共方法 *************************************
/**
 * 获取默认的构建器配置对象
 * @param root 项目根目录；用于构建siteRoot等参数
 * @returns 构建器配置对象；构建规则
 * - srcRoot 为 root+src
 * - siteRoot 为 root+dist
 * - distRoot 为 root+dist
 */
export function getDefaultOptions(root: string): BuilderOptions {
    ensureString(root, "root");
    return {
        srcRoot: resolve(root, "src"),
        siteRoot: resolve(root, "dist"),
        distRoot: resolve(root, "dist"),
    }
}

/**
 * 获取构建器对象
 * @param options   打包全局配置选项
 * @param plugin    插件构建器：组件打包时，执行此方法，构建组件打包所需插件
 * @returns 构建器对象
 */
export function getBuilder(options: BuilderOptions, plugin: PluginBuilder): IRollupBuilder {
    /** 构建器对象 */
    const builder: IRollupBuilder = Object.freeze({});

    //#region *************************************实现接口：IRollupBuilder接口方法***************
    //#endregion

    //#region ************************************* 私有方法 *************************************
    //#endregion

    //#region ************************************* 初始化代码 *************************************
    //  1、验证Builder配置选项：srcRoot必须存在，验证后将数据冻结，避免被修改
    {
        isObject(options) || throwError("options must be an object");
        ensureString(options.srcRoot, "options.srcRoot");
        ensureString(options.siteRoot, "options.siteRoot");
        ensureString(options.distRoot, "options.distRoot");
        throwIfFalse(
            existsSync(options.srcRoot),
            `${options.srcRoot}路径不存在:${options.srcRoot}`
        );
        options = Object.freeze(Object.assign(Object.create(null), options));
    }
    //#endregion

    return builder;
}
//#endregion

//#region ************************************* 私有方法 *************************************
//#endregion