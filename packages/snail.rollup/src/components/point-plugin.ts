import { InputPluginOption } from "rollup";
import { BuilderOptions } from "../models/builder";
import { AssetOptions, ComponentOptions, IComponentContext, ViewOptions } from "../models/component";
import { FLAG } from "../utils/helper";
import pc from "picocolors";
import { ModuleOptions } from "../models/module";
import { hasOwnProperty, isStringNotEmpty, url } from "snail.core";
import { existsSync, rmSync } from "fs";
import { relative } from "path";

/**
 * 起点插件：做一些构建前的初始化工作
 * @param component 
 * @param context 
 * @param options 
 * @returns 
 */
export function startPointPlugin(component: ComponentOptions, context: IComponentContext, options: BuilderOptions): InputPluginOption {
    return {
        name: "snaile.rollup-startpoint",
        buildStart() {
            console.log();
            console.log(pc.magentaBright(`👉 compile component: ${component.src}`));
            console.log(pc.gray(`\troot:         ${component.root}`));
            console.log(pc.gray(`\tdist:         ${component.dist}`));
            console.log(pc.gray(`\turl:          ${component.url}`));
        }
    }
}

/**
 * 终点插件：作为强制内置插件放到组件插件的最后，做保护措施，确保组件正确打包
 * - 如做了【动态注入】模块，但是没引入【snail.rollup-inject】插件，则提示用户引入此插件
 * - 使用了【?url】模块，但是没引入【snail.rollup-url】插件，则提示用户引入此插件
 * - 、、、
 * @param component 
 * @param context 
 * @param options 
 * @returns 
 */
export function endpointPlugin(component: ComponentOptions, context: IComponentContext, options: BuilderOptions): InputPluginOption {
    return {
        name: "snaile.rollup-endpoint",
        buildStart() {
            //  拦截assets.push方法
            const pushFunc = context.assets.push;
            context.assets.push = function (...items) {
                items.forEach(deleteAssetDist);
                return pushFunc.apply(this, items);
            }
            // @ts-ignore
            component.assets?.forEach(deleteAssetDist);
            // @ts-ignore
            component.views?.forEach(deleteAssetDist);
        },
        resolveId(source, importer) {
            //  1、避免外部直接使用 URL:和URL_VERSION:模块
            if (source.startsWith(FLAG.URLVERSION_MODULE) || source.startsWith(FLAG.URL_MODULE)) {
                return { id: source, external: false };
            }
            //  2、动态模块是否被正确解析了
            if (source.startsWith(FLAG.DYNAMIC_MODULE) == true) {
                let rule: string, remarks: string;
                rule = `please use "snail.rollup-inject" to resolve dynamic module.`;
                remarks = `use registerDynamicModule method to register before use it.`;
                context.triggerRule(rule, source, importer, pc.green(`suggestion:   ${remarks}`));
                return;
            }
            //  3、解析模块：url模式
            const module: ModuleOptions = context.resolveModule(source, importer);
            if (hasOwnProperty(module.query, "url") == true) {
                context.triggerRule(`please use "snail.rollup-url" to resolve url module.`, source, importer);
                return;
            }
            //  4、解析模块：net和src模块的资产、脚本(忽略入口脚本)、样式文件是否被正确解析了
            if (module.type == "net" || module.type == "src") {
                let rule: string;
                if (context.isAsset(module) == true) {
                    rule = `please use "snail.rollup-asset" to resolve asset file.`
                }
                else if (context.isScript(module) == true) {
                    rule = importer
                        ? `please use "snail.rollup-script" to resolve script file.`
                        : undefined;
                }
                else if (context.isStyle(module) == true) {
                    rule = `please use "snail.rollup-style" to resolve style file.`;
                }
                rule && context.triggerRule(rule, source, importer);
            }
        },
        load(id) {
            //  url 模块是否被正确加载了
            if (id.startsWith(FLAG.URLVERSION_MODULE) == true || id.startsWith(FLAG.URL_MODULE)) {
                const rule = `please use "snail.rollup-url" to load url module.`;
                context.triggerRule(rule, id, undefined);
                return;
            }
        },
        generateBundle() {
            //  检测使用到的资产文件是否都写入了：判断存在性
            const asset = [...context.assets, ...component.assets as AssetOptions[]].find(asset => existsSync(asset.dist) == false);
            if (asset != undefined) {
                let src = url.format(relative(options.srcRoot, asset.src));
                context.triggerRule(`please use "snail.rollup-asset" to write asset file.`, src, undefined)
            }
            //  检测views是否都写入了；判断存在性
            const view = component.views?.find(view => existsSync((view as ViewOptions).dist) == false);
            if (view != undefined) {
                let src = url.format(relative(options.srcRoot, (view as ViewOptions).src));
                context.triggerRule(`please use "snail.rollup-html" to write view file.`, src, undefined);
            }

            console.log(pc.green(`  ----  compile success.`));
        }
    }
}

/**
 * 删除资产文件的输出文件
 * @param asset 
 */
function deleteAssetDist(asset: AssetOptions) {
    isStringNotEmpty(asset?.dist) && existsSync(asset.dist)
        && rmSync(asset.dist);
}