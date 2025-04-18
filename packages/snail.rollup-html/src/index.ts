import { readFileSync } from "fs";
import { InputPluginOption } from "rollup"
import { isFunction, mustString } from "snail.core";
//  导入rollup包，并对helper做解构
import { ViewOptions, BuilderOptions, ComponentContext, ComponentOptions } from "snail.rollup"
import { helper, PluginAssistant, AssetManager } from "snail.rollup"
const { trace } = helper;

/**
 * 资源管理插件
 * - 自动管理组件视图文件，将js内容注入到html页面中
 * @param component 打包组件配置选项
 * @param context 组件打包上下文；用于一些资源共享
 * @param options 全局打包配置选项：约束siteRoot、srcRoot等
 * @param injectScript js注入到html页面的脚本片段
 * - 打包组件时自动分析html页面中的特定标记，将器替换成js代码
 * - 特定标记为“${InjectScript}”，不区分大小写
 * @returns rollup插件实例
 */
export default function htmlPlugin(component: ComponentOptions, context: ComponentContext, options: BuilderOptions, injectScript: string): InputPluginOption {
    const { writeFile } = new PluginAssistant(component, context, options);
    /** 视图管理器 */
    const viewMgr: AssetManager<ViewOptions> = new AssetManager<ViewOptions>(component.views as any);
    mustString(injectScript, "injectScript");

    return {
        name: "snail.rollup-html",
        /**
         * 构建开始，views视图文件支持watch模式
         */
        buildStart() {
            viewMgr.forEach(view => this.addWatchFile(view.src));
        },
        /**
         * watch模式支持
         * @param id 
         */
        watchChange(id) {
            viewMgr.find(id).forEach(view => view.writed = undefined);
        },
        /**
         * 准备生成js组件：每个组件输出只会调用一次
         */
        generateBundle() {
            viewMgr.forEach(view => {
                if (view.writed === true) {
                    return;
                }
                //  替换${InjectScript}标签；去掉多以的依赖注入标记
                let content = readFileSync(view.src).toString()
                    .replace(/\$\{InjectScript\}/i, injectScript)
                    .replace(/\$\{InjectScript\}/gi, "");
                //  交给外部句柄做自定义处理
                isFunction(view.handle) && (content = view.handle(options, view.src, content));
                //  直接使用writeFile写文件数据，不使用 emitFile。
                trace(`--copy \t${view.src} \t➡️\t ${view.dist}`);
                writeFile(view.dist, content);

                /** 利用 emitFile 告知rollup需要新增输出资源文件
                 * !!!!!!!!!! 屏蔽 emitFile 模式，和asset、style的写入保持一致，
                 * 但需要注意 fileName不能接收绝对路径，或者../开头路径
                 *      报错：The "fileName" or "name" properties of emitted files must be strings that are neither absolute nor relative paths
                 *  解决办法：利用 https://github.com/rollup/rollup/issues/3507 思路，先定位到组件dist路径下，然后../到上级，然后基于向对路径拼接
                
                const fileName = `tmp${path.sep}..${path.sep}${path.relative(path.dirname(component.dist), view.dist)}`;
                const asset: EmittedAsset = { type: 'asset', source:content, name: 'snail.rollup-html', fileName };
                this.emitFile(asset);*/

                view.writed = true;
            });
        }
    }
}