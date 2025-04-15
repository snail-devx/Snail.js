import { InputPluginOption } from "rollup"
import { BuilderOptions, ComponentContext, getBuilder, getFileOptions } from "snail.rollup"
import { ComponentOptions } from "snail.rollup"

/**
 * 脚本管理插件：
 * - 完成ts、js等脚本管理和编译
 * - 完成脚本依赖资源管理
 * @param component 打包组件配置选项
 * @param context 组件打包上下文；用于一些资源共享
 * @param options 全局打包配置选项：约束siteRoot、srcRoot等
 * @returns rollup插件实例
 */
export function scriptPlugin(component: ComponentOptions, context: ComponentContext, options: BuilderOptions): InputPluginOption {
    return {
        name: "snail.rollup-script",
    }
}