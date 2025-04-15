//  构建rollup配置所需组件
import { relative, resolve } from "path";
import { fileURLToPath } from "url";
import { isArrayNotEmpty, isStringNotEmpty } from "./shared/base.js";
import { error, importFile } from "./shared/io.js";
//      依赖npm包支持：add -D  @rollup/plugin-node-resolve
import nodeResolve from "@rollup/plugin-node-resolve";
//      typescript支撑：add -D  @rollup/plugin-typescript typescript tslib
import typescript from "@rollup/plugin-typescript";
//      babel支持： add -D @rollup/plugin-babel  
import babel from "@rollup/plugin-babel";
import { DEFAULT_EXTENSIONS } from "@babel/core";
import { getPackage } from "./shared/packages.js";

/** 文件所处目录路径  */
const __dirname = fileURLToPath(new URL('.', import.meta.url));
/** 是否是生产环境 */
const isProd = process.env.NODE_ENV === "production";
/** 需要构建的项目包信息 @type {import("./types/package").Package} */
const pkg = (() => {
    const packageDir = process.env.BUILD;
    isStringNotEmpty(packageDir) || error(`\tBUILD环境变量为空，无法进行dts打包构建`);
    const pkg = getPackage(packageDir, false);
    return pkg
        ? pkg
        : error(`无法取到打包项目信息：${packageDir}`);
})();
/** 默认的rollup配置 */
const defaultRollup = await importFile(pkg.rollupFile, "加载rollup配置");

/**
 * 构建Rollup的打包配置信息
 * @returns {import("rollup").RollupOptions[]}
 */
function buildRollupConfig() {
    let defaultConfig = defaultRollup?.default;
    if (!defaultConfig) {
        error(`\t无法从Rollup配置文件加载default配置：${pkg.rollupFile}`);
        return;
    }
    defaultConfig = Array.isArray(defaultConfig) ? defaultConfig : [defaultConfig];
    if (defaultConfig.length == 0) {
        error(`\t从Rollup配置文件加载default配置为空：${pkg.rollupFile}`);
        return;
    }
    return defaultConfig.map(mergeRollupOptions)
};
/**
 * 合并Rollu单个配置项，加上默认的一下配置
 * @param {import("rollup").RollupOptions} item 
 * @returns {import("rollup").RollupOptions}
 */
function mergeRollupOptions(item) {
    //   input 处理
    isStringNotEmpty(item.input) || error("\t存在input为空的RollupOptions");
    item.input = resolve(pkg.root, item.input);
    //  output 处理；为空则默认一个
    mergeRollupOutput(item);
    //  plugins 处理：先构建默认的，然后将item自身追加过来
    mergeRollupPlugins(item);
    //  external 处理；加上默认忽略项目
    // item.external = [
    //     /** 
    //      * 包含“node_modules”；这样编译出来的模块，才会把【node_modules】中的引用代码合并过来
    //      *  如snaile.core中使用await关键字等，如不带过来，则需要使用方做引入，不独立
    //      */
    //     // /node_modules/gi,
    //     ...(item.external || [])
    // ]
    //  返回自身
    return item;
}
/**
 * 合并rollup的输出信息
 * @param {import("rollup").RollupOptions} item 
 */
function mergeRollupOutput(item) {
    //  如果没有output，则基于input分析一个出来
    item.output = item.output || {};
    isArrayNotEmpty(item.output) || (item.output = [item.output || {}]);
    item.output.forEach(
        /**@param {import("rollup").OutputOptions} out*/
        function (out) {
            out.format = out.format || "es";
            //  对输出路径进行决定路径处理；都没指定是，基于input路径进行拼接
            out.dir && (out.dir = resolve(pkg.root, out.dir));
            out.file && (out.file = resolve(pkg.root, out.file));
            !out.dir && !out.file && (out.file = resolve(pkg.distRoot, relative(pkg.srcRoot, item.input)));
            //  如果是ts文件，则强制.js
            out.file && (out.file = out.file.replace(/\.ts$/i, ".js"));
        }
    );
}
/**
 * 合并rollup的插件信息
 * @param {import("rollup").RollupOptions} item 
 */
function mergeRollupPlugins(item) {
    //  项目rollup.config.js显示指定【禁用默认插件】，则不做处理
    if (defaultRollup?.DISABLE_DefaultPlugins === true) {
        return;
    }
    //  默认插件配置
    const plugins = [
        nodeResolve({ preferBuiltins: true }),
        //  编译ts文件：强制不生成.d.ts文件，有外部独立生成
        typescript({
            tsconfig: resolve(__dirname, "tsconfig.json"),
            removeComments: isProd,
            declaration: false,
            declarationDir: undefined,
        }),
    ];
    //  根据需要显式指定babel转码：执行babel编译，加入垫片等；强制支持ts
    defaultRollup?.START_BabelPlugin === true && plugins.push(babel({
        extensions: [".ts", ...DEFAULT_EXTENSIONS],
        configFile: resolve(__dirname, '.babelrc.json'),
        comments: false,
    }));
    //  合并插件
    item.plugins = [
        ...plugins,
        ...(item.plugins || [])
    ];
}

//  执行导出
export default await buildRollupConfig();