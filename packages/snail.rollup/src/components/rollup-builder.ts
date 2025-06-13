import { dirname, resolve } from "path";
import pc from "picocolors";
import { InputPluginOption, RollupOptions } from "rollup";
import minimist from "minimist";
import { BuilderOptions, CommonLibOptions, IRollupBuilder } from "../models/builder-model";
import { AssetOptions, ComponentOptions, IComponentContext, PluginBuilder } from "../models/component-model";
import { ProjectOptions } from "../models/project-model";
import {
    mustString, mustFunction, mustArray, mustObject,
    throwError, throwIfFalse, throwIfTrue,
    isArrayNotEmpty, isStringNotEmpty, isArray, isBoolean, isFunction, hasOwnProperty,
    tidyString,
    url,
} from "snail.core"
import {
    buildDist, buildNetPath, checkExists, checkSrc, forceExt, getLen, importFile,
    isChild, isNetPath, log, logIfAny, step, trace, traceIfAny, warn
} from "../utils/helper";
import { getContext } from "./component-context";
import { startPointPlugin, endpointPlugin } from "./point-plugin";

/**
 * Rollup构建器
 */
export class Builder implements IRollupBuilder {
    //#region *************************************属性、构造方法***************************************
    /** 打包全局配置选项 */
    private readonly options: BuilderOptions;
    /** 插件构建器：组件打包时，执行此方法，构建组件打包所需插件 */
    private readonly plugin: PluginBuilder;

    /**
     * 构造方法
     * @param options   打包全局配置选项
     * @param plugin    插件构建器：组件打包时，执行此方法，构建组件打包所需插件
     */
    private constructor(options: BuilderOptions, plugin: PluginBuilder) {
        this.options = options;
        this.plugin = plugin
    }
    //#endregion

    //#region ************************************* 公共方法***************************************
    /**
         * 获取默认的构建器配置对象
         * @param root 项目根目录；用于构建siteRoot等参数
         * @returns 构建器配置对象；构建规则
         * - srcRoot 为 root+src
         * - siteRoot 为 root+dist
         * - distRoot 为 root+dist
         * - isProduction 为 process.env.NODE_ENV === "production"
         */
    public static getDefaultOptions(root: string): BuilderOptions {
        mustString(root, "root");
        return checkBuilder({ root });
    }
    /**
     * 获取基于文件的构建器配置对象
     * - root必填；若srcRoot、siteRoot、distRoot为空，则构建默认，规则和getDefaultOptions一致
     * @param file 文件路径，绝对路径，如 snail.rollup.js
     * @returns 构建器配置对象
     */
    public static async getFileOptions(file: string): Promise<BuilderOptions> {
        mustString(file, "file");
        log(`👉 load builder options from file:${file}`)
        const options = await importFile<BuilderOptions>(file, "file");
        return checkBuilder(hasOwnProperty(options, "default")
            ? options["default"]
            : options
        );
    }
    /**
     * 获取构建器对象
     * @param options   打包全局配置选项
     * @param plugin    插件构建器：组件打包时，执行此方法，构建组件打包所需插件
     * @returns 构建器对象
     */
    public static getBuilder(options: BuilderOptions, plugin: PluginBuilder): IRollupBuilder {
        //  1、验证Builder配置选项：srcRoot必须存在，验证后将数据冻结，避免被修改
        options = checkBuilder(options);
        options = Object.freeze(Object.assign(Object.create(null), options));
        console.log(pc.magentaBright(`👉 BuilderOptions`));
        trace(`\troot:         ${options.root}`);
        trace(`\tsrcRoot:      ${options.srcRoot}`);
        trace(`\tsitRoot:      ${options.siteRoot}`);
        trace(`\tdistRoot:     ${options.distRoot}`);
        log("");
        //  2、验证plugin是否有效
        mustFunction(plugin, "plugin");
        //  3、构建实例返回
        return new Builder(options, plugin);
    }
    //#endregion

    //#region *************************************实现接口：IRollupBuilder接口方法***************
    /**
     * 批量构建组件Rollup打包配置选项
     * @param components 组件对象数组
     * @param commonLib 公共js库；和component.commonLib做合并
     * @returns rollup打包配置数组
     */
    public build(components: ComponentOptions[], commonLib?: CommonLibOptions[]): RollupOptions[] {
        logIfAny(components, `build components`);
        mustArray(components, "components");
        //  检测组件相关信息：检测完成后commonLib等数组强制数值，不会存在null、undefined情况
        traceIfAny(components, "--check components");
        components = checkComponent(components, this.options);
        traceIfAny(commonLib, "--check commonLib");
        checkCommonLib(commonLib, "commonLib");
        //  整理CommonLib：components 自身如果是commonLib，也需要整理一下
        traceIfAny(commonLib, "--merge commonLib");
        commonLib = components
            .map(component => convertToCommonLib(component, this.options))
            .filter(lib => lib != undefined)
            .concat(
                isArray(commonLib) ? commonLib : [],
                this.options.commonLib
            );
        //  构建rollup配置选项：为每个组件生成自己的上下文
        return components.map(component => {
            component.commonLib = [].concat(component.commonLib, commonLib);
            component = Object.freeze(component);
            const context: IComponentContext = getContext(component, this.options);
            const plugins: InputPluginOption[] = [
                startPointPlugin(component, context, this.options),
                ...this.plugin.call(component, component, context, this.options) || [],
                endpointPlugin(component, context, this.options),
            ];
            return {
                input: component.src,
                output: {
                    file: component.dist,
                    format: component.format,
                    sourcemap: component.sourceMap,
                    name: component.name,
                    extend: component.extend,
                    exports: component.exports,
                    /*  头部、底部例外插入代码 */
                    intro: component.intro,
                    outro: component.outro,
                    banner: component.banner,
                    footer: component.footer,
                    /*
                     *  全局公共js库映射
                     *      基于插件梳理出来全局使用到的公共js
                     *      做动态处理，而不是一开始指定
                     */
                    /* v8 ignore next 1  globals 不进行代码覆盖率测试*/
                    globals: (id) => context.globals[id]?.name,
                    /*  amd模式下的特殊控制：
                     *      本地脚本强制加上“.js”后缀作为模块名，避免出现：define(['vue', '../Core']);
                     */
                    amd: {
                        forceJsExtensionForImports: true,
                    },
                    /*  取消命名空间强绑定freeze
                     *      import * as core from "./Core.ts"; 
                     *      rollup会生成_interopNamespaceDefault方法，生成全新对象freezeLM中的key
                     */
                    freeze: false,
                    externalLiveBindings: false,
                },
                plugins,
                /*  拦截特定警告：后续会添加一些自定义参数，减少警告信息输出
                 */
                /* v8 ignore next 3  onwarn 不进行代码覆盖率测试*/
                onwarn: function (warning, warn) {
                    warning.code !== "UNKNOWN_OPTION"
                        && warn(pc.yellow(`  --build warn:       ${warning?.message}`));
                }
            }
        });
    }
    /**
     * 构建项目下的组件Rollup打包配置选项
     * - 自动分析项目下的打包组件信息
     * - 自动分析依赖的项目文件
     * @param projects 项目文件地址；绝对路径，或者向对BuilderOptions.root的向对路径
     * @returns rollup打包配置数组
     */
    public async buildProject(...projects: string[]): Promise<RollupOptions[]> {
        trace(`build projects: ${projects.join(" ")}`);
        mustArray(projects, "projects");
        //  遍历项目：按照顺序遍历，避免map返回promise时的异步导致的日志输出混乱，调试麻烦
        const rullupOptions: RollupOptions[] = [];
        for (let index = 0; index < projects.length; index++) {
            let project = projects[index];
            step(`👉 build projects[${index}]: ${project}`);
            project = tidyString(project);
            mustString(project, `projects[${index}] is invalid:`);
            project = resolve(this.options.root, project);
            //  加载项目自身，分析依赖项转换成commonLib，然后构建rollup配置
            const { components, projectDeps } = await importProject(project);
            logIfAny(projectDeps, "load dependency projects");
            const commonLib: CommonLibOptions[] = await loadProjectDeps(project, projectDeps, this.options);
            rullupOptions.push(...this.build(components, commonLib));
        }
        return rullupOptions;
    }
    /**
     * 从命令行参数构建项目下的组件Rollup打包配置选项
     * - 自动从 --project 参数中分析要构建的项目的项目文件地址
     * - 内部执行 buildProject方法，完成实际项目打包配置构建
     * - 多个项目用空格分开；如 rollup --project ./.projects/common.js ./.projects/service.js
     * @returns rollup打包配置数组
     */
    public async buildFromCmd(): Promise<RollupOptions[]> {
        trace(`build from cmd: ${process.argv.slice(2).join(" ")}`);
        const argMap = minimist(process.argv.slice(2));
        const projectFiles: string[] = isArray(argMap.project)
            ? argMap.project
            : isStringNotEmpty(argMap.project) ? [argMap.project] : undefined;
        throwIfFalse(
            isArrayNotEmpty(projectFiles),
            "--project argument invalid. example: --project ./.projects/common.js ./.projects/service.js"
        );
        return this.buildProject(...projectFiles);
    }
    //#endregion
}

//#region ************************************* 私有方法 *************************************
/* 常规做法是和Builder一起，做成私有静态方法；但这样里面调用的时候，还需要做一层Builder.XXX，不方便，先保留在外面*/
/**
 * 检测构建器配置选项
 * @param options 
 * @returns 
 */
function checkBuilder(options: BuilderOptions): BuilderOptions {
    typeof (options) == "object" || throwError(`options must be an object.`);
    options = Object.assign(Object.create(null), options);
    options.root = tidyString(options.root);
    mustString(options.root, "options.root");
    checkExists(options.root, "options.root");

    options.srcRoot = tidyString(options.srcRoot) || resolve(options.root, "src");
    checkExists(options.srcRoot, "options.srcRoot");
    options.siteRoot = tidyString(options.siteRoot) || resolve(options.root, "dist");
    options.distRoot = tidyString(options.distRoot) || resolve(options.root, "dist");
    throwIfFalse(
        isChild(options.siteRoot, options.distRoot),
        `distRoot must be child of siteRoot. siteRoot:${options.siteRoot}, distRoot:${options.distRoot}.`
    );
    options.commonLib = checkCommonLib(options.commonLib, "options.commonLib");
    options.cssChunkFolder = tidyString(options.cssChunkFolder);

    //  检测是否是生产环境：外部没传入，则基于上下文环境参数分析
    options.isProduction ??= process.env.NODE_ENV === "production";

    return options;
}
/**
 * 检测公共库配置
 * @param libs 公共库配置
 * @param title 报错的标题 
 * @returns 检测完成后的有效公共js库
 */
function checkCommonLib(libs: CommonLibOptions[], title: string): CommonLibOptions[] {
    libs = isArray(libs) ? libs : [];
    /* 遍历验证；id的唯一性 */
    const idMap: Map<string, boolean> = new Map();
    libs.forEach((lib, index) => {
        trace(`------check commonLib[${index}]: ${JSON.stringify(lib)}`);
        const errorMessage = `${title}[${index}] invalid`;
        mustObject(lib, `${errorMessage}:`);
        //  id必填，不能重复
        lib.id = tidyString(lib.id);
        mustString(lib.id, `${errorMessage}: id`);
        idMap.has(lib.id) && throwError(`${errorMessage}: id is duplicated. id:${lib.id}.`);
        idMap.set(lib.id, true);
        //  name必填
        lib.name = tidyString(lib.name);
        mustString(lib.name, `${errorMessage}: name`);
        //  url必填，优先考虑验证必须是网络绝对路径，或者http等协议路径
        lib.url = tidyString(lib.url);
        mustString(lib.url, `${errorMessage}: url`);
        lib.url = url.format(lib.url);
        isNetPath(lib.url) || throwError(`${errorMessage}: url must be a valid url. url:${lib.url}.`);
    });
    return libs;
}

/**
 * 导入项目
 * @param project 项目文件地址
 * @returns 项目配置信息
 */
async function importProject(project: string): Promise<ProjectOptions> {
    //  读取项目文件内容；若存在Default，则使用Default作为项目配置；否则全局
    const projectOptions = await importFile<any>(project, "project");
    return hasOwnProperty(projectOptions, "default")
        ? projectOptions.default
        : projectOptions;
}
/**
 * 加载项目依赖；转换成CommonLib返回
 * @param project 项目文件地址：绝对路径
 * @param deps 依赖文件地址；绝对路径，或者相对project的路径
 * @param options 
 * @returns 依赖的CommonLib数组
 */
async function loadProjectDeps(project: string, deps: string[], options: BuilderOptions): Promise<CommonLibOptions[]> {
    /* 先仅加载自身项目依赖；不钻取依赖项目的依赖配置文件 */
    const commonLib: CommonLibOptions[] = [];
    for (let index = 0; index < getLen(deps); index++) {
        let depFile: string = deps[index];
        depFile = resolve(project, "..", depFile);
        trace(`--load dependency projects[${index}]: ${depFile}`);
        const depsProj: ProjectOptions = await importProject(depFile);
        depsProj.components = isArrayNotEmpty(depsProj.components)
            ? checkComponent(depsProj.components, options)
            : [];
        depsProj.components.forEach(component => {
            const lib = convertToCommonLib(component, options);
            lib && commonLib.push(lib);
        });
    }
    return commonLib;
}
/**
 * 将组件转换成CommonLib
 * @param component 
 * @param options 
 * @returns CommonLib；组件不是公共js库返回undefined
 */
function convertToCommonLib(component: ComponentOptions, options: BuilderOptions): CommonLibOptions | undefined {
    /** 构建CommonLib：针对component.dist做补偿; 避免dependencies组件构建url失败
     *      确保component已经做了checkComponent逻辑
     *      component.src需要进行路径格式化，强制分隔符为“/”；和resolveModule配合，否则会出问题
     */
    return component.isCommonLib
        ? { id: component.src.replace(/\\/g, "/"), name: component.name, url: component.url }
        : undefined;
}
/**
 * 检测组件
 * @param component 组件
 * @param options 
 * @returns 检测好的js组件自身；经过assign处理
 */
function checkComponent(components: ComponentOptions[], options: BuilderOptions): ComponentOptions[] {
    return components.map((component, index) => {
        trace(`----check components[${index}]: ${component?.src}`);
        const errorMessage = `components[${index}] invalid`;
        mustObject(component, `${errorMessage}:`);
        component = Object.assign({ format: "umd", exports: "named" }, component);
        //  src+root
        component.src = checkSrc(options, component.src, `${errorMessage}`);
        component.root = tidyString(component.root);
        component.root = component.root
            ? resolve(options.srcRoot, component.root)
            : dirname(component.src);
        throwIfFalse(
            isChild(options.srcRoot, component.root),
            `${errorMessage}: root must be child of srcRoot. srcRoot:${options.srcRoot}, root:${component.root}.`
        );
        //  dist+url
        if (component.dist) {
            debugger;
            warn(`------components[${index}].url no need assign. url:${component.url}`);
        }
        component.dist = buildDist(options, component.src);
        component.dist = forceExt(component.dist, ".js");
        component.url = buildNetPath(options, component.dist);
        //  打包相关验证
        component.isCommonLib = component.isCommonLib === true;
        component.sourceMap = component.sourceMap === true;
        //      @ts-ignore format验证
        component.format = tidyString(component.format) || "amd";
        const formats = ["amd", "cjs", "es", "iife", "system", "umd"];
        throwIfTrue(
            formats.indexOf(component.format) == -1,
            `${errorMessage}: format must be one of ${formats.join(",")}.`
        );
        //      name、extend、exports验证：name有值时，若extend无效，则强制默认true
        component.name = tidyString(component.name);
        throwIfTrue(
            component.isCommonLib == true && component.name == undefined,
            `${errorMessage}: name must be a non-empty string when component.isCommonLib is true.`
        );
        component.extend = component.name != undefined && isBoolean(component.extend) == false
            ? true
            : component.extend;
        //      打包头部、尾部代码追加
        component.intro = tidyString(component.intro);
        component.outro = tidyString(component.outro);
        component.banner = tidyString(component.banner);
        component.footer = tidyString(component.footer);
        //  组件views、asserts、commonLib处理
        traceIfAny(component.commonLib, `------check component.commonLib`);
        component.commonLib = checkCommonLib(component.commonLib, `components[${index}].commonLib`);
        traceIfAny(component.assets, `------check component.assets`);
        component.assets = checkAssets(component.assets, `components[${index}].assets`, options);
        traceIfAny(component.views, `------check component.views`);
        component.views = checkAssets(component.views, `components[${index}].views`, options);
        //  执行初始化方法
        isFunction(component.init) && component.init.call(component, component, options);

        return component;
    });
}
/**
 * 检测资源配置
 * @param assets 资源文件配置
 * @param title 报错的标题
 * @param options 
 * @returns 检测完的资源文件配置
 */
function checkAssets(assets: Array<AssetOptions | string>, title: string, options: BuilderOptions): AssetOptions[] {
    assets = isArray(assets) ? assets : [];
    return assets.map((at, index) => {
        const errorMessage = `${title}[${index}] invalid`;
        let asset: AssetOptions = typeof (at) == "string"
            ? { src: at } as AssetOptions
            : (mustObject(at, `${errorMessage}:`), at);
        //  src 文件在srcRoot下存在性验证；dist在siteRoot目录下
        asset.src = checkSrc(options, asset.src, errorMessage);
        asset.dist = tidyString(asset.dist);
        asset.dist = asset.dist
            ? asset.dist.indexOf("_SITEROOT_") == -1
                ? resolve(options.distRoot, asset.dist)
                : asset.dist.replace("_SITEROOT_", options.siteRoot)
            : buildDist(options, asset.src);
        throwIfFalse(
            isChild(options.siteRoot, asset.dist),
            `${errorMessage}: dist must be child of siteRoot. siteRoot: ${options.siteRoot}, dist: ${asset.dist}`
        );
        //  返回校正后的资源信息
        return asset;
    });
}
//#endregion