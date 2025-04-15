import { InputPluginOption } from "rollup"
import { BuilderOptions, ComponentContext, getBuilder, getFileOptions } from "snail.rollup"
import { ComponentOptions } from "snail.rollup"

/**
 * 编译vue文件：
 * - 编译script脚本：支持js、ts等脚本
 * - 样式文件独立文件编译输出：依赖的静态资源自动管理
 * @param component 打包组件配置选项
 * @param context 组件打包上下文；用于一些资源共享
 * @param options 全局打包配置选项：约束siteRoot、srcRoot等
 * @returns rollup插件实例
 */
export function vuePlugin(component: ComponentOptions, context: ComponentContext, options: BuilderOptions): InputPluginOption {
    return {
        name: "snail.rollup-vue",
    }
}