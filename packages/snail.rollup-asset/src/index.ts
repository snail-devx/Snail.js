import { InputPluginOption } from "rollup"
import { getBuilder, getFileOptions } from "snail.rollup"
import { ComponentOptions, BuilderOptions, ComponentContext } from "snail.rollup"

/**
 * 资源管理插件
 * - 自动进行组件资源依赖管理、相同项目下资源copy
 * - 资源版本管理,import时返回带有版本的url地址，方便外部使用
 * @param component 打包组件配置选项
 * @param context 组件打包上下文；用于一些资源共享
 * @param options 全局打包配置选项：约束siteRoot、srcRoot等
 * @returns rollup插件实例
 */
export function assetPlugin(component: ComponentOptions, context: ComponentContext, options: BuilderOptions): InputPluginOption {
    return {
        name: "snail.rollup-asset",
    }
}