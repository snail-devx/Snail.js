import { ResolveIdResult, InputPluginOption } from "rollup"
import { hasOwnProperty, mustString, throwIfTrue, tidyString } from "snail.core"
//  导入rollup包，并对helper做解构
import { BuilderOptions, ComponentContext, ComponentOptions } from "snail.rollup"
// import { helper } from "snail.rollup"
// const { buildDist, buildNetPath, isChild } = helper;

/** 动态注册的模块：key为模块id：value为动态代码 */
const DYNAMIC_MODULES: Record<string, string> = Object.create(null);

/**
 * 动态脚本注入插件：
 * - 全局注入脚本module
 * - 内置脚本module管理
 * @param component 打包组件配置选项
 * @param context 组件打包上下文；用于一些资源共享
 * @param options 全局打包配置选项：约束siteRoot、srcRoot等
 * @returns rollup插件实例
 */
export default function injectPlugin(component: ComponentOptions, context: ComponentContext, options: BuilderOptions): InputPluginOption {
    return {
        name: "snail.rollup-inject",
        /**
         * 解析组件；判断是否是当前插件能处理的
         * @param source 解析的模块的名称
         * @param importer 导入这个模块的上级模块
         * @param options 一些参数，比如标记了是否为入口文件。如果是入口文件，则没有importer
         * @returns string | NullValue | false|{external?: boolean | 'absolute' | 'relative',id: string,resolvedBy?: string;}
         */
        resolveId(source, importer): ResolveIdResult {
            // 入口文件不用做注入判断，没有意义
            if (importer && hasOwnProperty(DYNAMIC_MODULES, source) == true) {
                return { id: source, external: false };
            }
        },
        /**
         * 模块加载：能分析出实际路径的数据，才会调用此方法；如import不存在的地址，则不会进入此方法
         * @param id 
         * @returns 
         */
        load(id) {
            if (hasOwnProperty(DYNAMIC_MODULES, id) === true) {
                return DYNAMIC_MODULES[id];
            }
        },
    }
}

/**
 * 动态模块是否已注册
 * @param id 模块id，区分大小写，确保唯一
 * @returns 已注册返回true；否则返回false
 */
export function hasDynamicModule(id: string): boolean {
    mustString(id = tidyString(id), "id");
    return hasOwnProperty(DYNAMIC_MODULES, id);
}
/**
 * 注册动态注入模块
 * - 解决某些插件需要动态注入一些代码的情况
 * - 重复引入时，抽取成模块，方便代码复用
 * @param id 模块id，区分大小写，确保唯一
 * @param code 动态模块代码
 */
export function registerDynamicModule(id: string, code: string): void {
    mustString(id = tidyString(id), "id");
    mustString(code = tidyString(code), "code");
    throwIfTrue(
        hasOwnProperty(DYNAMIC_MODULES, id),
        `module[${id}] has been registered.`
    )
    DYNAMIC_MODULES[id] = code;
}
/**
 * 移除动态注入的模块
 * @param id 模块id，区分大小写，确保唯一
 */
export function removeDynamicModule(id: string): void {
    mustString(id = tidyString(id), "id");
    delete DYNAMIC_MODULES[id];
}