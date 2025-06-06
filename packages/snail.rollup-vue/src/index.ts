import { basename, dirname, extname, relative, resolve } from "path";
import { InputPluginOption, ResolveIdHook, TransformHook } from "rollup"
import vue from "@vitejs/plugin-vue"
import compiler, { SFCParseOptions, SFCParseResult } from "@vue/compiler-sfc"
import { buildAddLinkCode, getStyleProcessor, IStyleProcessor, StyleTransformResult } from "snail.rollup-style"
import { transformScript } from "snail.rollup-script"
import { hasAny, hasOwnProperty, isArrayNotEmpty, tidyString } from "snail.core";
import { BuilderOptions, IComponentContext, ComponentOptions, ModuleOptions } from "snail.rollup"
import { VueStyleTransformResult } from "./models/vue-style";
import { existsSync, rmSync } from "fs";

/** 插件名称 */
const PLUGINNAME = "snail.rollup-vue";
/**
 * 编译vue文件：
 * - 编译script脚本：支持js、ts等脚本
 * - 样式文件独立文件编译输出：依赖的静态资源自动管理
 * @param component 打包组件配置选项
 * @param context 组件打包上下文；用于一些资源共享
 * @param options 全局打包配置选项：约束siteRoot、srcRoot等
 * @returns rollup插件实例
 */
export default function vuePlugin(component: ComponentOptions, context: IComponentContext, options: BuilderOptions): InputPluginOption {
    /** style样式处理器 */
    const styleProcessor: IStyleProcessor = getStyleProcessor(component, context, options);
    /** vue组件注入的css文件源路径，虚拟的 */
    const cssChunksSrc = resolve(
        dirname(component.src), options.cssChunkFolder || "./css",
        context.forceExt(basename(component.src), ".vue.css")
    );
    /** vue组件注入的css文件输出路径 */
    const { dist: cssChunkDist, url: cssChunkUrl } = context.buildPath(cssChunksSrc);
    /** 是否已经css样式文件 */
    let hasInjectStyle: boolean;
    /** vue中使用到的css片段代码字段；key为vue文件路径（小写，物理绝对路径），value为此vue文件下的css片段 */
    const cssChunkMap: Map<string, VueStyleTransformResult[]> = new Map();
    /** 记录需要进行编译的脚本字典；key为模块id小写（src绝对物理路径）*/
    const transformMap: { [key: string]: 1 } = Object.create(null);

    /**
     * 借助vue官方插件，完成.vue文件编译；强制指定生产环境，精简胆码
     */
    const originPlugin: InputPluginOption = vue({
        isProduction: true/* options.isProduction*/,
        compiler: {
            ...compiler,
            /**
            * 转换vue组件，拦截做一些逻辑规则验证
            * @param vpOptions 
            * @returns 
            */
            parse(source: string, vpOptions: SFCParseOptions): SFCParseResult {
                const parseResult = compiler.parse(source, vpOptions);
                //  style标签处理
                //      style标签若未显式指定lang属性值，强制报错
                if (parseResult.descriptor.styles.length > 0) {
                    const inValidStyle = parseResult.descriptor.styles
                        .filter(st => tidyString(st.attrs?.lang) == undefined);
                    if (inValidStyle.length > 0) {
                        const rule = `.vue file must set lang attribute value in style tag.`;
                        context.triggerRule(rule, vpOptions.filename, undefined);
                    }
                }
                //      整理构建css片段类型信息；方便在watch模式时，将已有无变化css片段合并过来
                const id = vpOptions.filename.toLowerCase();
                const oldChunks: VueStyleTransformResult[] = cssChunkMap.get(id) || [];
                cssChunkMap.set(id, parseResult.descriptor.styles.map((style, index) => {
                    const scoped = hasOwnProperty(style.attrs, "scoped");
                    const oldChunk = oldChunks[index];
                    return oldChunk && oldChunk.scoped === scoped
                        ? oldChunk
                        : { src: vpOptions.filename, dist: cssChunkDist, scoped };
                }));
                //  script标签处理
                //      script标签若未显式指定lang属性值，强制报错
                if (parseResult.descriptor.script && tidyString(parseResult.descriptor.script.attrs?.lang) == undefined) {
                    const rule = `.vue file must set lang attribute value in script tag.`;
                    context.triggerRule(rule, vpOptions.filename, undefined);
                }

                return parseResult;
            }
        },
    });
    /**
     * 自定义的vue插件，干涉逻辑vue官方插件逻辑，实现自定义规则验证
     */
    const rullupPlugin: InputPluginOption = {
        name: PLUGINNAME,
        /**
         * 解析组件；判断是否是当前插件能处理的
         * @param source 解析的模块的名称
         * @param importer 导入这个模块的上级模块
         * @returns string || false || null
         */
        async resolveId(source, importer, rOptions) {
            /* plugin的原始代码；做一下优化改动：如果是.vue文件，则直接返回物理文件路径，避免再调用其他插件的resolveId方法   */
            //  1、检测.vue文件的引入规则：仅针对无query查询参数的模块id；避免干扰插件?vue&type=style等加载处理
            const module = context.resolveModule(source, importer);
            if (module && module.query === undefined && module.ext === ".vue") {
                context.traceModule(PLUGINNAME, "vue", module);
                switch (module.type) {
                    case "net": {
                        const rule = `import vue component failed: cannot load from network path.`;
                        context.triggerRule(rule, source, importer);
                    }
                    //  src下文件，需要进行规则处理；并直接返回文件物理路径，避免再调用其他插件的resolveId方法
                    case "src": {
                        if (context.isChild(options.srcRoot, module.id) == true && context.isChild(component.root, module.id) == false) {
                            const rule: string = `import vue component failed: file must be child of componentRoot.`;
                            context.triggerRule(rule, source, importer);
                        }
                        transformMap[module.id.toLowerCase()] = 1;
                        return { id: module.id, external: false };
                    }
                    /* v8 ignore next 1 其他情况，暂时不支持；走vue原始插件逻辑 */
                    default: break;
                }
            }
            //  2、其他情况走插件原始方法 
            const ret = await (originPlugin.resolveId as ResolveIdHook).call(this, source, importer, rOptions);
            ret && (transformMap[source.toLowerCase()] = 1);
            return ret;
        },
        /**
         * 加载编译代码
         * @param code 文件内容
         * @param id 模块id，绝对路径
         */
        async transform(code, id) {
            /** 基本处理逻辑：
             *      1、拦截掉style样式的处理：直接调用StyleProcessor进行style编译处理
             *          1、实现vue中style和其他地方使用style时规则一致
             *          2、解决@vitejs/plugin-vue2调用compileStyleAsync时未传入style lang属性的问题
             *              参照其源码，内部仅中转调用了@vue/compile-sfc插件的style编译，外部做同样处理，避免原生功能收到影响
             *      2、其他情况，先交给vue插件自己处理
             *      3、不是当前插件的，直接忽略，避免来回判断
             */
            if (hasOwnProperty(transformMap, id.toLowerCase()) === false) {
                return;
            }
            const { filename, query } = parseVueRequest(id);
            //  拦截style编译；将vue中的style样式提取合并到js组件特有.css文件中
            if (query.vue && query.type === "style") {
                //  执行样式编译；源码参照 @vitejs/plugin-vue
                /* v8 ignore next 1 借助上层逻辑，这里不会出现为空的情况；这里为了保险，冗余一下 */
                const from = filename.concat("?.", query.lang || "css");
                const { dist: to } = context.buildPath(from);
                /*  scopeId从query.scope取值，即为vue插件内部的id值`data-v-${descriptor.id}`   const scopedQuery = hasScoped ? `&scoped=${descriptor.id}` : ``; */
                const scopeId = query.scoped ? `data-v-${query.scopeId}` : undefined;
                const ret = await styleProcessor.transform(code, from, to, undefined, scopeId);
                //  提取到csschunk中，方便后续使用；并支持watch模式
                const cssChunks = cssChunkMap.get(filename.toLowerCase());
                if (isArrayNotEmpty(cssChunks) == true && cssChunks.length > query.index) {
                    const tsResult: Partial<StyleTransformResult> = { css: ret.code, map: ret.map, dependencies: ret.dependencies };
                    Object.assign(cssChunks[query.index], tsResult);
                }
                //  支持watch模式，监听依赖的style样式改变
                ret.dependencies?.forEach(file => this.addWatchFile(file));
                //  动态注入样式文件；确保只注入一次；
                /**
                 * watch模式下，始终注入脚本，避免标记量导致某些情况下无法注入脚本
                 *      js组件引入了多个vue组件，此时修改第一个组件，因为hasInjectStyle为true，不会再注册，其他vue组件也不会注册css
                 */
                const href = hasInjectStyle == true ? undefined : cssChunkUrl;
                /* v8 ignore next 1 vitest 下无法测试watch模式*/
                hasInjectStyle = context.isWatchMode === true ? false : true;
                code = buildAddLinkCode(href) || "";
                //      始终给出map属性值；避免rollup给出警告提示
                /** 
                 * (!) Broken sourcemap
                 * https://rollupjs.org/troubleshooting/#warning-sourcemap-is-likely-to-be-incorrect
                 * Plugins that transform code (such as "rollup.plugin.manage-vue") should generate accompanying sourcemaps.
                 */
                return { code, map: { mappings: "" } };
            }
            //  拦截script编译；由于vue插件未执行此编译，会导致部分ts代码无法正常编译出出去
            else if (query.vue && query.type === "script") {
                /* v8 ignore next 1 这里为了保险，冗余一下 */
                id = filename.concat("?.", query.lang || "js");
                return await transformScript(code, id, component, options);
            }
            //  其他情况，走原生插件逻辑
            else {
                /* 针对vue文件编译结果，做再次编码处理；避免vue的template中写一些es新语法不被支持
                 *  这样做对sourceMap不友好；后续看情况优化；最兜底的方式是在【Rollup.ManageScript】插件中生成js文件时做
                 *      但这样不精准，可能会做更多的无效转换；后续看看有没有更好的方式，如esbuild打包编译时支持低版本、、、
                 */
                // const ret = await (originPlugin.transform as TransformHook).call(this, code, id);
                let ret = await (originPlugin.transform as TransformHook).call(this, code, id);
                ret = !!ret && extname(id).toLowerCase() == ".vue"
                    ? await transformScript((ret as any).code, id, component, options)
                    : ret;
                return ret;
            }
        },
        /**
         * 构建完成；合并css文件
         */
        buildEnd(error) {
            /** 合并sourcemap；还没实现，输出个警告提示；考虑参照compile-sfc中的source-map包做合并操作
             *      this.warn("o(╥﹏╥)o css的sourceMap合并还没实现...");
             */
            if (error) {
                return;
            }
            //  先删除，再生成，后续考虑逐行写入
            const codes: string[] = [];
            /* v8 ignore next 1 vitest模式下，每次都会删除dist目录，不会存在 cssChunkDist文件 */
            existsSync(cssChunkDist) && rmSync(cssChunkDist);
            cssChunkMap.forEach((chunks, key) => {
                chunks.forEach((style, index) => {
                    codes.push(`/* src:${relative(options.srcRoot, key)} \t index:${index} */`);
                    codes.push(style.css);
                });
            });
            hasAny(codes) && context.writeFile(cssChunkDist, codes.join("\r\n"))
        }
    }

    //  合并插件返回
    return { ...originPlugin, ...rullupPlugin };
}

//#region ************************************* 私有方法 *************************************
/**
 * 转换vue的module情况；但仅返回自身需要的属性样式
 * @param id 
 */
function parseVueRequest(id: string) {
    /* 解决vue自身parseVueRequest时，lang未正确识别的问题 
        参照自：@vitejs/plugin-vue的parseVueRequest方法
        {"vue":true,"type":"style","index":0,"scoped":true,"lang.less":""}
    */
    const [filename, rawQuery] = id.split(`?`, 2);
    const query = Object.fromEntries(new URLSearchParams(rawQuery));
    const { vue, type, index, scoped } = query;
    //  分析lang值
    let lang: string;
    for (const key in query) {
        if (key.startsWith('lang.') === true) {
            lang = key.replace('lang.', '').toLowerCase();
            break;
        }
    }
    //  返回
    return {
        filename: filename as string,
        query: {
            vue: vue != null,
            type,
            index: index == null ? null : Number(index),
            scoped: scoped != null,
            scopeId: scoped || '',
            lang: lang || ''
        }
    }
}
//#endregion
