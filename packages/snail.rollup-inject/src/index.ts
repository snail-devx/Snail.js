import { InputPluginOption } from "rollup"
import { BuilderOptions, ComponentContext, getBuilder, getFileOptions } from "snail.rollup"
import { ComponentOptions } from "snail.rollup"

/**
 * 动态脚本注入插件：
 * - 全局注入脚本module
 * - 内置脚本module管理
 * @param component 打包组件配置选项
 * @param context 组件打包上下文；用于一些资源共享
 * @param options 全局打包配置选项：约束siteRoot、srcRoot等
 * @returns rollup插件实例
 */
export function injectPlugin(component: ComponentOptions, context: ComponentContext, options: BuilderOptions): InputPluginOption {
    return {
        name: "snail.rollup-inject",
    }
}