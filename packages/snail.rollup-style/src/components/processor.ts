/**
 * 样式管理器：实现css样式编译
 *  1、默认支持css、less；后期根据配置支持scss等
 *  2、编译样式核心使用postcss完成，借助@vue/compiler-sfc包完成样式文件的相关处理
 *      对样式编译封装得很详细，在snail.rollup-vue中也会用到scope样式处理等逻辑；迁移过来借助其能力来做独立样式文件管理
 *      仅使用样式编译相关逻辑：后期看情况从【@vue/compiler-sfc】包中把相关代码代码迁移出来考虑迁移出来，
 *          https://github.com/vuejs/core/blob/main/packages/compiler-sfc/src/compileStyle.ts
 *  3、插件核心功能
 *      1、需要对样式 @import 文件做规则验证；包括js、vue中引入的脚本
 *      2、postcss自身不支持less相关语法，需要进行编译前处理
 */

import { dirname, extname } from "path";
import { existsSync } from "fs";
import pc from "picocolors";
import postcss, { AcceptedPlugin, ProcessOptions } from "postcss";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import url, { CustomTransformFunction } from "postcss-url";
import nested from "postcss-nested";
import { compileStyleAsync, SFCStyleCompileOptions } from "@vue/compiler-sfc"
import { hasOwnProperty, isBoolean, isObject, url as sUrl, version } from "snail.core";
import { processors, StylePreprocessorResults } from "./preprocessors";
//  导入rollup包，并对helper做解构
import { BuilderOptions, IComponentContext, ComponentOptions, ModuleTransformResult } from "snail.rollup"
import { IStyleProcessor } from "../models/style-model";

/**
 * style样式的扩展路径
 * - less进行 @import 文件解析时作为文件查找备选路径使用；如可从 node_modules 下的npm包查找相对路径文件引用
 */
export const STYLE_EXTEND_PATHS: string[] = [];

/**
 * 获取样式处理器
 * @param component         要打包的组件配置
 * @param context           组件上下文
 * @param options            全局配置 
 * @returns 样式处理器对象
 */
export function getStyleProcessor(component: ComponentOptions, context: IComponentContext, options: BuilderOptions): IStyleProcessor {
    /** postcss处理相关插件 */
    const postcssPlugins: AcceptedPlugin[] = [
        //  检测url资源引入
        buildUrlCheckerPlugin(),
        //  嵌套展开+浏览器兼容前缀
        nested(),
        autoprefixer(),
        //  生产环境，做压缩处理
        ...(options.isProduction ? [cssnano()] : [])
    ];

    //#region ************************************* IStyleProcessor *************************************
    /**
     * 转换编译文本样式
     * @param style 样式文本内容
     * @param from 样式内容来自哪里，用于分析内部的url文件地址、@import 等物理文件等
     * @param to 样式文件内容输出到哪里
     * @param map 已有的sourcemap；为false时不生成sourceMap值
     * @param scopeId 支持外部传入scopeId值，支持Vue的scope样式
     * @returns 
     */
    async function transform(style: string, from: string, to?: string, map?: any, scopeId?: string): Promise<ModuleTransformResult> {
        //  1、style样式预处理：进行路径拦截，依赖合法性验证
        let dependencies: string[];
        {
            const preRet = preprocessStyle(style, from, map);
            style = preRet.code;
            map = preRet.map || map;
            dependencies = preRet.dependencies;
        }
        //  2、构建postcss执行相关插件、配置选项
        /* v8 ignore next 1 vitest map在vue的时候才会存在，这里先忽略覆盖率，在vue编译时做验证*/
        map = isBoolean(map) ? map != false : map;
        map = component.sourceMap == true && map == undefined
            ? true
            : map;
        const postcssOptions: ProcessOptions<postcss.Document | postcss.Root> = {
            from,
            to,
            /* v8 ignore next 1 vitest map在vue的时候才会存在，这里先忽略覆盖率，在vue编译时做验证*/
            map: isBoolean(map) ? map === false ? false : { inline: false } : map
        };
        //  3、执行style编译：借助vue/compile-sfc完成；前面已经进行了预编译处理，这里忽略掉
        const sfcStyleOptions: SFCStyleCompileOptions = {
            source: style,
            map: isBoolean(map) ? undefined : map,
            filename: from,
            preprocessLang: undefined,
            preprocessOptions: undefined,
            scoped: !!scopeId,
            id: scopeId || "",
            postcssPlugins,
            postcssOptions
        };
        const ret = await compileStyleAsync(sfcStyleOptions);
        logErrors("use postcss compile style failed", from, ret.errors);
        //  4、返回：强制带上依赖style信息
        return { ...ret, dependencies }
    }
    /**
     * 转义编译样式文件
     * @param file 样式文件地址
     * @returns 
     */
    async function transformFile(file: string): Promise<ModuleTransformResult> {
        const css = context.readFileText(file);
        const { dist } = context.buildPath(file);
        return await transform(css, file, dist, undefined);
    }
    //#endregion

    //#region ************************************* 私有方法、变量 *************************************
    /**
    * 输出编译错误信息
    * @param title
    * @param from 
    * @param errors 
    */
    function logErrors(title: string, from: string, errors: string[] | Error[]): void {
        if (errors && errors.length > 0) {
            /* 将错误信息错一些分类整理；确保输出格式 */
            const reasons: string[] = errors.map(err => {
                const reasons: string[] = [];
                err.toString().split('\r\n').forEach((msg, index) => {
                    msg.split('\n').forEach((msg, index2) => {
                        /* v8 ignore next 1 vitest 不想凑命中率了，直接忽略掉*/
                        msg = index == 0 && index2 == 0 ? pc.bold(msg) : `\t${msg}`;
                        reasons.push(msg);
                    });
                });
                return reasons.join('\r\n\t');
            });
            context.triggerRule(title, from, undefined, ...reasons);
        }
    }

    /**
     * 构建css中url检测器插件：对url引入文件路径做格式化和检测处理
     * @returns 
     */
    function buildUrlCheckerPlugin(): AcceptedPlugin {
        /** 
         * 检测css中的url引入，如 background-image: url("../Images/topswitch.png");
         *  对文件路径做比对，和资产文件的规则一致，物理文件时需在srcRoot目录下
         *  注意事项：base64图片，直接返回；不能copy，后续考虑通过配置，把这类图片转存为文件
        */

        const urlFunc: CustomTransformFunction = (asset, dir): string => {
            if (/^data\:image\//i.test(asset.url) === true) {
                return asset.url;
            }
            if (context.isNetPath(asset.url) === true) {
                const url = sUrl.format(asset.url);
                return version.formart(url);
            }
            //  物理路径：走规则逻辑；不存在报错，必须在srcRoot目录下，同时在component.root目录下时copy资源
            if (existsSync(asset.absolutePath) == false) {
                const msg = "@import file in style file is not exists";
                context.triggerRule(msg, asset.url, undefined, `absolutePath: ${asset.absolutePath}`);
            }
            context.mustInSrcRoot({ id: asset.absolutePath } as any, asset.url, undefined);
            const { dist, url } = context.buildPath(asset.absolutePath);
            context.isChild(component.root, asset.absolutePath)
                && context.assets.push({ src: asset.absolutePath, dist });
            return version.formart(url);
        }

        return url({ url: urlFunc });
    }

    /**
     * 样式预处理
     * @param style 样式文本内容
     * @param from 样式内容来自哪里，用于分析内部的url文件地址、@import 等物理文件等
     * @param map 已有的sourcemap；为false时不生成sourceMap值
     */
    function preprocessStyle(style: string, from?: string, map?: any): ModuleTransformResult {
        /* v8 ignore next 1 查找是否存在预编译处理器；不存在直接返回*/
        const extName = (extname(from) || ".css").replace(/^\.*/, "").toLowerCase();
        if (hasOwnProperty(processors, extName) != true) {
            return { code: style, map };
        }
        //  执行预处理:不同extName的预处理配置选项不一样，做一下区分
        /* v8 ignore next 1 */
        const bpOptions = buildPreprocessOptions(extName) ?? {};
        const preResult: StylePreprocessorResults = processors[extName](style, map, {
            filename: from,
            map,
            ...bpOptions,
            //  less分析@import需要，否则会报错
            paths: [dirname(from), ...STYLE_EXTEND_PATHS],
        });
        //  判断是否有错误信息，存在则中断执行
        logErrors("preprocess style file failed", from, preResult.errors);
        //  处理完成后，分析dependence，查看是否引入了规则之外的less文件
        if (preResult.dependencies?.length > 0) {
            const outRuleFiles = preResult.dependencies.filter(
                file => context.isChild(options.srcRoot, file) == true
                    && context.isChild(component.root, file) == false
            );
            outRuleFiles.length > 0 && context.triggerRule(
                "import style file must be child of componentRoot when it is child of srcRoot.",
                from, undefined,
                //------ 附带补充信息
                'all @import:',
                ...preResult.dependencies.map(file => `\t      ${file}`),
                pc.yellow('error @import:'),
                ...outRuleFiles.map(file => `\t      ${file}`)
            );
        }
        //  
        /* v8 ignore next 2 预编译结果重写当前sytle和map值，方便返回*/
        style = preResult ? preResult.code : style;
        map = preResult ? preResult.map : style;
        return { code: style, map, dependencies: preResult.dependencies };
    }
    /**
     * 构建预编译处理的配置选项
     * @param lang style语言，less、css、、、
     * @returns 
     */
    function buildPreprocessOptions(lang: string): any {
        switch (lang) {
            case "less": {
                const lessOptions: Less.Options = {
                    syncImport: true,

                    /* 重写url地址，避免后续分析url地址不正确 */
                    //@ts-ignore 传递给less内部使用，在Less.Options不存在这些属性
                    rewriteUrls: true,
                    processImports: true,
                }
                return lessOptions;
            }
            /* v8 ignore next 3 vitest 其他的先返回空对象；后续用到了再完善*/
            default: {
                return {};
            }
        }
    }
    //#endregion

    //  构建实例返回
    return Object.freeze({ transform, transformFile });
}