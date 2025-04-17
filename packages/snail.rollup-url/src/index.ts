import { ResolveIdResult } from "rollup";
import { hasOwnProperty } from "snail.core";
import { BuilderOptions, ComponentContext, getBuilder, getFileOptions, ModuleOptions } from "snail.rollup"
import { ComponentOptions } from "snail.rollup"
import { buildDist, buildNetPath, forceFileExt, mustInSrcRoot, resolveModule } from "snail.rollup/dist/plugin";

/** URL前缀标记 */
const FLAG_URL = "URL:";
/**
 * url注入插件：
 * - 支持通过在 import 模块时，指定 url参数，然后返回url地址字符串
 * - url地址，基于siteRoot和srcRoot进行动态分析构建
 * - 如 import cssUrl from "./xxx/styles/x.css?url" ；最终生成代码 const cssUrl="/xxx/styles/x.css";
 * @param component 打包组件配置选项
 * @param context 组件打包上下文；用于一些资源共享
 * @param options 全局打包配置选项：约束siteRoot、srcRoot等
 * @returns rollup插件实例
 */
export default function urlPlugin(component: ComponentOptions, context: ComponentContext, options: BuilderOptions): any {
    return {
        name: "snail.rollup-plugin",
        /**
         * 解析组件；判断是否是当前插件能处理的
         * @param source 解析的模块的名称
         * @param importer 导入这个模块的上级模块
         * @param options 一些参数，比如标记了是否为入口文件。如果是入口文件，则没有importer
         * @returns string | NullValue | false|{external?: boolean | 'absolute' | 'relative',id: string,resolvedBy?: string;}
         */
        resolveId(source, importer): ResolveIdResult {
            if (!importer) {
                return;
            }
            const module: ModuleOptions = resolveModule(source, importer, context, options);
            if (!module || hasOwnProperty(module.query, "url") == false) {
                return;
            }
            switch (module.type) {
                case "net": {
                    return buildUrlResolve(module.id, false);
                }
                case "src": {
                    mustInSrcRoot(module, source, importer, component, options);
                    let url = buildDist(options, module.id);
                    url = buildNetPath(options, url);
                    url = forceFileExt(url, options);
                    return buildUrlResolve(url, false);
                }
                default: {
                    const message = `build url mode failed: not support module.type value. type:${module.type}.`;
                    throw new Error(message);
                }
            }
        },
        /**
         * 模块加载：能分析出实际路径的数据，才会调用此方法；如import不存在的地址，则不会进入此方法
         * @param id 
         * @returns 
         */
        load(id) {
            if (id.startsWith(FLAG_URL) === true) {
                id = id.substring(FLAG_URL.length);
                return `export default "${id}"`;
            }
        },
    }
}

/**
 * 构建URL注入解析结果
 * @param id 模块id
 * @param needVersion 是否需要追加版本号，针对资源文件时返回url时需要
 * @returns 
 */
export function buildUrlResolve(id: string, needVersion: boolean): { id: string, external: false } {
    return {
        id: `${FLAG_URL}${id}`,
        external: false,
    }
}