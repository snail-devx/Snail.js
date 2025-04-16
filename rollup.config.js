//  构建rollup配置所需组件
import { relative, resolve } from "path";
import { fileURLToPath } from "url";
//      依赖npm包支持：add -D  @rollup/plugin-node-resolve
import nodeResolve from "@rollup/plugin-node-resolve";
//      typescript支撑：add -D  @rollup/plugin-typescript typescript tslib
import typescript from "@rollup/plugin-typescript";
//      babel支持： add -D @rollup/plugin-babel  
import babel from "@rollup/plugin-babel";
import { DEFAULT_EXTENSIONS } from "@babel/core";

import {
    isArrayNotEmpty, isStringNotEmpty,
    error, importFile, log, trace,
    getPackage
} from "./scripts/util.js";

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
/** 要打包的rollup配置
 * @type {import("./types/rollup-build").RollupBuildOptions;}
 */
const pkgRollup = await importFile(pkg.rollupFile, "加载rollup配置");

/**
 * 构建Rollup的打包配置信息
 * @returns {import("rollup").RollupOptions[]}
 */
function buildRollupConfig() {
    let defaultConfig = pkgRollup?.default;
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
    item.external ??= [];
    item.external = [].concat(
        pkgRollup.DISABLE_DefaultExternal == true
            ? []
            : [/node_modules/],
        Array.isArray(item.external)
            ? item.external
            : [item.external]
    );
    item.external.push();
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
            //  对输出路径进行处理，相对releaseRoot路径
            out.dir && (out.dir = resolve(pkg.releaseRoot, out.dir));
            out.file && (out.file = resolve(pkg.releaseRoot, out.file));
            !out.dir && !out.file && (out.file = resolve(pkg.releaseRoot, relative(pkg.srcRoot, item.input)));
            //  如果是ts文件，则强制.js
            out.file && (out.file = out.file.replace(/\.ts$/i, ".js"));
            //  输出结果
            trace(`--build file \t${item.input} \t➡️\t ${out.dir || out.file}`);
        }
    );
}
/**
 * 合并rollup的插件信息
 * @param {import("rollup").RollupOptions} item 
 */
function mergeRollupPlugins(item) {
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
    pkgRollup?.START_BabelPlugin === true && plugins.push(babel({
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