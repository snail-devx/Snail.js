import { InputPluginOption } from "rollup"
import { buildUrlResolve } from "snail.rollup-url"
import { AssetOptions, BuilderOptions, IComponentContext, ComponentOptions } from "snail.rollup"
import { AssetManager } from "snail.rollup"
import pc from "picocolors";

/** 插件名称 */
const PLUGINNAME: string = "snail.rollup-asset";

/**
 * 资源管理插件
 * - 自动进行组件资源依赖管理、相同项目下资源copy
 * - 资源版本管理,import时返回带有版本的url地址，方便外部使用
 * @param component 打包组件配置选项
 * @param context 组件打包上下文；用于一些资源共享
 * @param options 全局打包配置选项：约束siteRoot、srcRoot等
 * @returns rollup插件实例
 */
export default function assetPlugin(component: ComponentOptions, context: IComponentContext, options: BuilderOptions): InputPluginOption {
    context.assets ??= [];
    const assetMgr: AssetManager<AssetOptions> = new AssetManager<AssetOptions>(component.assets as any);

    return {
        name: PLUGINNAME,
        /**
         * 准备构建，用于支持watch模式
         */
        buildStart() {
            assetMgr.forEach(file => this.addWatchFile(file.src));
            //  拦截context.assets的push方法，实现自动watch模式
            context.assets.push = (...items) => {
                items?.forEach(asset => assetMgr.add(asset) && this.addWatchFile(asset.src));
                return Array.prototype.push.apply(context.assets, items);
            }
        },
        /**
         * watch模式支持
         * @param id 
         * @param change 
         */
        /* v8 ignore next 4  开发模式在vitest下无法测试，先忽略*/
        watchChange(id, change) {
            /* 仅是当前组件依赖资源的变化，才重写，做性能优化使用 */
            assetMgr.find(id).forEach(file => file.writed = undefined);
        },
        /**
         * 解析组件；判断是否是当前插件能处理的
         * @param source 解析的模块的名称
         * @param importer 导入这个模块的上级模块
         * @param options 一些参数，比如标记了是否为入口文件。如果是入口文件，则没有importer
         * @returns string || false || null
         */
        resolveId(source, importer) {
            /** 基于文件类型做分发处理
             *      1、网络路径文件，构建 url 地址的注入逻辑；依赖“snail.rollup-inject”包完成
             *      2、src文件，验证合法性，然后做资源copy后，构建 url 地址注入逻辑
             *          1、srcRoot下文件才可分析Url；否则报错
             *          2、组件root目录下的资源，做同步copy操作
             *      3、其他情况，默认不做任何处理
             *  注意事项：
             *      1、构建url注入时，资源文件需要追加版本号
             */

            //  资源文件不会作为入口文件存在，直接忽略；importer为undefined，则说明是入口文件
            const module = importer ? context.resolveModule(source, importer) : undefined;
            if (module == undefined || context.isAsset(module) == false) {
                return;
            }
            context.traceModule(PLUGINNAME, "asset", module);
            switch (module.type) {
                case "net": {
                    return buildUrlResolve(module.id, true);
                }
                case "src": {
                    context.mustInSrcRoot(module, source, importer);
                    const { dist, url } = context.buildPath(module.id);
                    context.isChild(component.root, module.id) && context.assets.push({ src: module.id, dist });
                    return buildUrlResolve(url, true);
                }
                default: {
                    const rule = `resolve asset failed: not support module.type value. type:${module.type}`;
                    context.triggerRule(rule, source, importer);
                    break;
                };
            }
        },
        /**
         * 构建完成；未发生错误时，拷贝资源文件
         */
        buildEnd(error) {
            if (error || assetMgr.size() == 0) {
                return;
            }
            console.log(pc.green(`  --copy assets: ${assetMgr.size()}`));
            assetMgr.forEach(asset => {
                asset.writed || context.copyFile(asset.src, asset.dist);
                asset.writed = true;
            });
        }
    }
}