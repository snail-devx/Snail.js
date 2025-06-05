import { extname, resolve } from "path"
import { OutputChunk, InputPluginOption, OutputBundle } from "rollup"
import { transformWithEsbuild } from "vite"
import { transformAsync } from "@babel/core"
import { hasOwnProperty, isArrayNotEmpty, isStringNotEmpty } from "snail.core"
//  导入rollup包，并对helper做解构
import { BuilderOptions, IComponentContext, ComponentOptions, CommonLibOptions, ModuleOptions, ModuleTransformResult } from "snail.rollup"

/** 插件名称 */
const PLUGINNAME = "snail.rollup-script";
/**
 * 脚本管理插件：
 * - 完成ts、js等脚本管理和编译
 * - 完成脚本依赖资源管理
 * @param component 打包组件配置选项
 * @param context 组件打包上下文；用于一些资源共享
 * @param options 全局打包配置选项：约束siteRoot、srcRoot等
 * @returns rollup插件实例
 */
export default function scriptPlugin(component: ComponentOptions, context: IComponentContext, options: BuilderOptions): InputPluginOption {
    /** 当前组件的公共js库，固化，避免外部再次修改 */
    const commonLib: CommonLibOptions[] = [];
    isArrayNotEmpty(component.commonLib) && commonLib.push(...component.commonLib);
    /** 组件Key：基于源路径小写做key，用于后续判断死循环引入的情况 */
    const srcKey: string = component.src.toLowerCase();
    /** 组件引入的模块字典：key为id小写（src时为文件绝对路径） */
    const transformMap: Map<string, ModuleOptions> = new Map();

    /**
     * 模块是否是CommonLib库
     * @param module 
     * @param ignoreCase 查找时，是否忽略大小写
     * @returns 公共库配置，不是则返回undefined
     */
    function isCommonLib(module: ModuleOptions, ignoreCase: boolean): CommonLibOptions | undefined {
        const idKey = ignoreCase ? module.id.toLowerCase() : module.id;
        const lib = commonLib.find(lib => ignoreCase ? lib.id.toLowerCase() === idKey : lib.id === idKey);
        return lib;
    }

    //  rollup插件
    return {
        name: PLUGINNAME,
        /**
         * 解析组件；判断是否是当前插件能处理的
         * @param source 解析的模块的名称
         * @param importer 导入这个模块的上级模块
         * @returns string | NullValue | false|{external?: boolean | 'absolute' | 'relative',id: string,resolvedBy?: string;}
         */
        resolveId(source, importer) {
            /** 分析加载模块，进行commonLib判断，非commonLib模块，进行引入规则判断，并加入 transformMap 中进行后续编译
             *      npm 时，无法分析出ext，无法直接基于isScript判断，做一下兼容，得先分析module
             *      src 时，死循环判断：引入 component 自身，则强制报错，避免死循环依赖；后期考虑做引用地图，完成更细粒度的死循环判断
             */
            const module: ModuleOptions = context.resolveModule(source, importer);
            //  基于type判断是否为commonLib，最后做错误规则触发
            let lib: CommonLibOptions = undefined;
            let errorrRule: string = undefined;
            switch (module.type) {
                //  src 时，必须在srcRoot下，组件根之外的必须配置为commonLib，否则报错
                case "src": {
                    //  判断是否是公共脚本：入口脚本，始终不查找commonLib；commonLib时，直接返回；不用管是否是脚本，用于支持.vue等直接作为入口文件
                    lib = importer ? isCommonLib(module, true) : undefined;
                    if (lib == undefined && context.isScript(module) == false) {
                        return;
                    }
                    context.traceModule(PLUGINNAME, "script", module);
                    //  非入口文件判断死循环、引用规则判断
                    const idKey: string = module.id.toLowerCase();
                    /* v8 ignore next 4   死循环，在rollup端已经结果了，这里先忽略，不会触发此规则*/
                    if (importer && srcKey == idKey) {
                        errorrRule = `dead loop import entry script: ${importer}`;
                        break;
                    }
                    //  非commonLib时，进行引入规则判断
                    if (lib == undefined) {
                        if (context.isChild(options.srcRoot, module.id) == true && context.isChild(component.root, module.id) == false) {
                            errorrRule = `import script must be child of componentRoot: it is child of srcRoot but not commonLib. `;
                            break;
                        }
                        //  需要进行脚本编译，并告知rollup 已经作为【非公共脚本】解析了：srcRoot外的脚本，或者componentRoot下的脚本；
                        transformMap.set(idKey, module);
                        return { id: module.id, external: false };
                    }
                }
                //  net 时，必须得是commonLib，无法加载net路径代码；后期可考虑如果是siteUrl，则下载文件，前期先忽略
                case "net": {
                    //  commonLib时，直接返回；不用管是否是脚本，用于支持.vue等直接作为入口文件
                    lib = isCommonLib(module, true);
                    //  不是CommonLib的脚本的非脚本，忽略不解析
                    if (lib == undefined && context.isScript(module) == false) {
                        return;
                    }
                    context.traceModule(PLUGINNAME, "script", module);
                    lib || (errorrRule = `import network script must be commonLib: cannot load code from network.`);
                    break;
                }
                //  npm 时，直接查找即可，不用做过多处理
                case "npm": {
                    // lib = commonLib.find(lib => lib.id == module.id);
                    lib = isCommonLib(module, false);
                    break;
                }
                //  兜底报错
                /* v8 ignore next 4 兜底目前不会出现，先忽略*/
                default: {
                    errorrRule = `resolve script failed: not support module.type value. type:${module.type}.`;
                    return;
                }
            }
            if (isStringNotEmpty(errorrRule)) {
                context.triggerRule(errorrRule, source, importer);
                return;
            }
            /** 分析commonLib，并告知rollup无需分析此脚本了
             *  1、若组件强制使用url作为公共脚本id，则需要特殊处理
             *      告知rollup此module使用绝对路径做url；否则rollup会将返回id和当前组件地址求相对路径
             *  2、普通情况，默认使用commonLib.id作为moduleid；如果是src下的数据，lib强制.js后缀
             *  
             */
            if (lib != undefined) {
                if (component.commonLibForceUrl === true) {
                    context.globals[lib.url] = lib;
                    return { id: lib.url, external: "absolute" };
                }
                else {
                    const libId = module.type === "src" ? context.forceExt(lib.id, ".js") : lib.id;
                    context.globals[libId] = lib;
                    return { id: libId, external: true };
                }
            }
        },
        /**
         * 加载模块数据
         * @param id 
         */
        load(id) {
            /** 是resolveid过来的脚本。自动读取文件返回；避免rollup调用其他插件挨个遍历做处理 */
            return transformMap.has(id.toLowerCase())
                ? context.readFileText(id)
                : undefined;
        },
        /**
         * 加载编译代码
         * @param code 文件内容
         * @param id 模块id，绝对路径
         */
        async transform(code, id) {
            return transformMap.has(id.toLowerCase())
                ? await transformScript(code, id, component, options)
                : undefined;
        },
        /**
         * 生成文件时：组装 @ sourceURL标记
         * @param output js组件输出选项
         * @param bundle 组件信息
         */
        async generateBundle(output, bundle: OutputBundle) {
            /** 遍历输出的bundle，然后增加@sourceURL，方便chrome浏览器识别“//@ sourceURL={component.url} ”
             *      1、多个bundle时输出一个SourceUrl会导致一些问题，不过builder一个组件默认仅一个输出，可先忽略
             *      2、仅处理自身组件 
             */
            for (const key in bundle) {
                if (hasOwnProperty(bundle, key)) {
                    const module: OutputChunk = bundle[key] as OutputChunk;
                    const bValue = module.type == "chunk" && module.isEntry == true
                        && transformMap.has(module.facadeModuleId.toLowerCase()) == true;
                    bValue && (module.code = `//@ sourceURL=${component.url}\r\n${module.code}`);
                }
            }
        }
    }
}

/**
 * 转译js脚本：
 * - 使用esbuild进行ts编译
 * - 使用babel进行js编译
 * @param code 代码脚本
 * @param id 模块id
 * @param component 打包组件配置选项
 * @param options 全局打包配置选项：约束siteRoot、srcRoot等
 * @returns 转码编译结果
 */
export async function transformScript(code: string, id: string, component: ComponentOptions, options: BuilderOptions): Promise<ModuleTransformResult> {
    /** 编译生成的sourceMap */
    let map: any | void = undefined;
    /**
     * 编译ts脚本：
     *      1、借助vite封装的transformWithEsbuild方法进行es编译
     *      2、后期支持外部传入ts编译选项（如传入tsconfig.json)文件路径
     */
    if (extname(id).toLowerCase() == ".ts") {
        const ret = await transformWithEsbuild(code, id, {
            target: "esnext",
            loader: "ts",
            // minify: isProduction === true,
            sourcemap: component.sourceMap == true ? "external" : false,
            legalComments: "inline",
            //  避免把中文编译Unicode；如{imagSrc:"测试"}，非utf8时编译后编程 {imagSrc: "\u6D4B\u8BD5"}
            charset: "utf8",
            //  生产环境下，去掉debugger
            drop: options.isProduction ? ["debugger"] : [],
            //  不使用原始ts.config文件，但强制指定严格模式
            tsconfigRaw: {
                compilerOptions: {
                    strict: true,
                    alwaysStrict: true,
                }
            },
        });
        code = ret.code;
        map = ret.map;
    }
    /**
     * 执行babel编译，兼容新版本API
     *      1、默认使用options.root目录下的.babelrc.json文件配置
     *      2、强制不保留注意，esbuild编译时默认去掉了注释
     */
    {
        const ret = await transformAsync(code, {
            sourceMaps: component.sourceMap == true,
            configFile: resolve(options.root, ".babelrc.json"),
            inputSourceMap: map,
            comments: false,
        });
        code = ret.code;
        map = ret.map;
    }

    return { code, map: map };
}   