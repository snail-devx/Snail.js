/**
 * rollup构建器：实现多项目构建能力
 */

import { BuilderOptions, IRollupBuilder } from "./models/builder";
import { PluginBuilder } from "./models/component";
import { ensureString } from "snail.core"
import { resolve } from "path";

/**
 * 获取默认的构建器配置对象
 * @param root 项目根目录；用于构建siteRoot等参数
 * @returns 构建器配置对象；构建规则
 * - srcRoot为root+src
 * - siteRoot和distRoot为root+dist
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
    return null;
}