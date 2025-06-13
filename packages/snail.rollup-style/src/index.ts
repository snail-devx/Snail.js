import { InputPluginOption } from "rollup"
import { IStyleProcessor, StyleTransformResult } from "./models/style-model";
import { getStyleProcessor } from "./components/processor";
import { buildUrlResolve } from "snail.rollup-url"
import { isObject, isString, isStringNotEmpty, version } from "snail.core";
import { hasDynamicModule, registerDynamicModule } from "snail.rollup-inject"
//  导入rollup包，并对helper做解构
import { BuilderOptions, IComponentContext, ComponentOptions, FLAG } from "snail.rollup"

//#region *************************************        导出接口        *************************************
/** 把自己的类型共享出去 */
export * from "./models/style-model";
/** 将样式处理器共享出去*/
export * from "./components/processor"

/** 插件名称 */
const PLUGINNAME = "snail.rollup-style";
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
export default function stylePlugin(component: ComponentOptions, context: IComponentContext, options: BuilderOptions): InputPluginOption {
    /** 要编译的样式文件 */
    const transformMap: Map<string, StyleTransformResult> = new Map();
    /** Style样式提供程序 */
    const styleProcessor: IStyleProcessor = getStyleProcessor(component, context, options);

    return {
        name: PLUGINNAME,
        /**
         * 解析组件；判断是否是当前插件能处理的
         * @param source 解析的模块的名称
         * @param importer 导入这个模块的上级模块
         * @returns string || false || null
         */
        resolveId(source: string, importer: string) {
            const module = importer ? context.resolveModule(source, importer) : undefined;
            if (context.isStyle(module) == false) {
                return;
            }
            context.traceModule(PLUGINNAME, "style", module);
            switch (module.type) {
                case "net": {
                    return buildUrlResolve(module.id, true);
                }
                case "src": {
                    context.mustInSrcRoot(module, source, importer);
                    let { dist, url } = context.buildPath(module.id);
                    dist = context.forceExt(dist, ".css");
                    url = context.forceExt(url, ".css");
                    const ret = buildUrlResolve(url, true);
                    if (context.isChild(component.root, module.id) === true) {
                        const key = ret.id.toLowerCase();
                        transformMap.set(key, { src: module.id, dist: dist });
                    }
                    return ret;
                }
                //  其他情况，不支持强制报错：如在脚本中引入npm下的样式，无法分析出样式url地址，强制报错
                default: {
                    const rule: string = `resolve style failed: not support module.type value. type:${module.type}.`;
                    context.triggerRule(rule, source, importer);
                    break;
                }
            }
        },
        /**
         * 监听模块内容变化
         * @param id 
         */
        /* v8 ignore next 13 vitest 模式下，覆盖进行dev模式测试，覆盖率先忽略掉*/
        watchChange(id: string) {
            /* 仅处理是当前js组件相关的样式文件，直接import的，或者css文件中@import的 */
            id = id.toLowerCase();
            transformMap.forEach(style => {
                const isChanged = style.src.toLowerCase() == id
                    || style.dependencies?.find(file => file.toLowerCase() == id) != undefined;
                if (isChanged === true) {
                    style.writed = undefined;
                    style.css = undefined;
                    style.map = undefined;
                }
            });
        },
        /**
         * 加载模块数据
         * @param id 
         */
        load(id) {
            //  后续在这里支持“外部在样式文件import时，加上 link 参数，自动添加link标签{” ；使用【buildAddLinkCode】方法，
        },
        /**
         * 加载编译代码
         * @param code 文件内容
         * @param id 模块id，绝对路径
         * @remarks Kind: async, sequential
         */
        async transform(code, id) {
            const style: StyleTransformResult = transformMap.get(id.toLowerCase());
            if (style == undefined) {
                return;
            }
            //  编译style文件；watch模式下，不需要全编译，做一些性能优化
            if (style.writed !== true) {
                const ret = await styleProcessor.transformFile(style.src);
                style.css = ret.code || "";
                style.map = isObject(ret.map) ? JSON.stringify(ret.map, null, 4) : "";
                style.dependencies = ret.dependencies;
            }
            //  支持watch模式
            this.addWatchFile(style.src);
            style.dependencies?.forEach(file => this.addWatchFile(file));
        },
        /**
         * 准备生成js组件
         */
        buildEnd(error) {
            /* 将编译好的样式文件写入目标目录；仅处理未写入的数据；写入完成后，清理缓存，节省内存 */
            !error && transformMap.forEach(style => {
                if (style.writed != true) {
                    isString(style.css) && context.writeFile(style.dist, style.css);
                    style.map && context.writeFile(`${style.dist}.map`, style.map);
                    style.writed = true;
                    style.css = undefined;
                    style.map = undefined;
                }
            });
        }
    }
}

/** 模块名：动态注入link标签 */
export const MODULE_INJECT_LINK = `${FLAG.DYNAMIC_MODULE}SNAIL_ADD_LINK`;
/**
 * 构建添加link标签的代码
 * - 内部使用 import addLink from "${MODULE_INJECT_LINK}"; addLink(url);
 * @param url 
 * @returns 
 */
export function buildAddLinkCode(url: string): string {
    return isStringNotEmpty(url)
        ? [
            `import addLink from "${MODULE_INJECT_LINK}";`,
            `addLink(${JSON.stringify(url)});`
        ].join('\r\n')
        : undefined;
}
//#endregion

//#region *************************************        私有逻辑        *************************************
//  注册默认的 添加样式 文件方法
hasDynamicModule(MODULE_INJECT_LINK) || registerDynamicModule(MODULE_INJECT_LINK, `
const linkMap = Object.create(null);
export default function (href) {
    if (!document || !document.head || typeof (href) != "string"){
        return;
    }
    var id = href.toLowerCase();
    if (Object.prototype.hasOwnProperty.call(linkMap, id) == false) {
        var element = document.createElement("link");
        element.href = href.indexOf('?') == -1
            ? href.concat("?${version.getVersion(true)}")
            : href.concat("&${version.getVersion(true)}");
        element.rel = "stylesheet";
        document.head.appendChild(element);
        linkMap[id] = element;
    }
}`);
//#endregion