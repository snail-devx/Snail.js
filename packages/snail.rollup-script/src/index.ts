import { SourceMap } from "rollup"
import { InputPluginOption } from "rollup"
import { BuilderOptions, ComponentContext, getBuilder, getFileOptions } from "snail.rollup"
import { ComponentOptions } from "snail.rollup"
import { ModuleTransformResult } from "snail.rollup/dist/plugin"

/**
 * 脚本管理插件：
 * - 完成ts、js等脚本管理和编译
 * - 完成脚本依赖资源管理
 * @param component 打包组件配置选项
 * @param context 组件打包上下文；用于一些资源共享
 * @param options 全局打包配置选项：约束siteRoot、srcRoot等
 * @returns rollup插件实例
 */
export default function scriptPlugin(component: ComponentOptions, context: ComponentContext, options: BuilderOptions): InputPluginOption {
    return {
        name: "snail.rollup-script",
    }
}

/**
 * 转译js脚本：
 * - 使用esbuild进行ts编译
 * - 使用babel进行js编译
 * @param code 
 * @param id 
 * @param component 
 * @param options 
 * @returns 转码编译结果
 */
export async function transformScript(code: string, id: string, component: ComponentOptions, options: BuilderOptions): Promise<ModuleTransformResult> {
    throw new Error("scriptPlugin.transformScript is not implemented")
}   