import { InputPluginOption } from "rollup"
import { getBuilder, getFileOptions } from "snail.rollup"
import { ComponentOptions, BuilderOptions, ComponentContext, } from "snail.rollup"

/**
 * 资源管理插件
 * - 自动管理组件视图文件，将js内容注入到html页面中
 * @param component 打包组件配置选项
 * @param context 组件打包上下文；用于一些资源共享
 * @param options 全局打包配置选项：约束siteRoot、srcRoot等
 * @returns rollup插件实例
 */
export function htmlPlugin(component: ComponentOptions, context: ComponentContext, options: BuilderOptions): InputPluginOption {
    return {
        name: "snail.rollup-html",
    }
}