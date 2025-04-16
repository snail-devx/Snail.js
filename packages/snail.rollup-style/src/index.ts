import { InputPluginOption } from "rollup"
import { BuilderOptions, ComponentContext, getBuilder, getFileOptions } from "snail.rollup"
import { ComponentOptions } from "snail.rollup"

/**
 * 样式管理插件：
 *  - 编译css、less等样式文件
 *  - 自动提取使用到的图片等静态资源，并做版本管理
 *  - 自动钻取依赖样式文件，并进行依赖校正
 * @param component 打包组件配置选项
 * @param context 组件打包上下文；用于一些资源共享
 * @param options 全局打包配置选项：约束siteRoot、srcRoot等
 * @returns rollup插件实例
 */
export default function stylePlugin(component: ComponentOptions, context: ComponentContext, options: BuilderOptions): InputPluginOption {
    return {
        name: "snail.rollup-style",
    }
}