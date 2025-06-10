/**
 * rollup相关助手类；用于帮助项目包快速构建 rollup 打包配置
 */

//  依赖的插件
//      依赖npm包支持：add -D  @rollup/plugin-node-resolve
import nodeResolve from "@rollup/plugin-node-resolve";
//      typescript支撑：add -D  @rollup/plugin-typescript typescript tslib
import typescript from "@rollup/plugin-typescript";
//      babel支持： add -D @rollup/plugin-babel  
import babel from "@rollup/plugin-babel";
import { DEFAULT_EXTENSIONS } from "@babel/core";
//  依赖的npm包
import minimist from "minimist";
import { resolve } from "path";
import { existsSync } from "fs";
import { fileURLToPath } from "url";
import { trace } from "./util.js";

/**     文件所处目录路径  */
const __dirname = fileURLToPath(new URL('.', import.meta.url));

/** 是否是生产环境 */
export const isProd = process.env.NODE_ENV === "production";
/**
 * 处理rollup配置的默认值
 * @param { import("rollup").RollupOptions[] } options 
 * @param {string} rootDir 打包项目的根目录
 * @param { import("../typings/rollup-util").RollupOptionsDefault } config
 * @returns { import("rollup").RollupOptions[] }
 */
export function dealRollupDefault(options, rootDir, config) {
    config = config || Object.create(null);
    const argMap = minimist(process.argv.slice(2));
    /** 输出根目录，未传入则使用rootDir */
    const outRoot = argMap.releaseRoot || rootDir;
    //  遍历做配置
    Array.isArray(options) && options.forEach(function (item) {
        //  输出文件整理：根outRoot求绝对文件路径
        if (item.output) {
            Array.isArray(item.output) || (item.output = [item.output]);
            item.output.forEach(out => {
                out.file && (out.file = resolve(outRoot, out.file));
                out.dir && (out.dir = resolve(outRoot, out.dir));
                //  如果是ts文件，则强制.js
                out.file && (out.file = out.file.replace(/\.ts$/i, ".js"));
                trace(`--build file \t${item.input} \t➡️\t ${out.dir || out.file}`);
            });
        }
        //  插件支持
        {
            const { tsconfig, babelrc } = getRollupExtendOptions(rootDir);
            const plugins = [
                nodeResolve({ preferBuiltins: true })
            ];
            //      添加ts支持
            config.supportTS && plugins.push(typescript({
                tsconfig: tsconfig,
                removeComments: isProd,
                declaration: false,
                declarationDir: undefined,
                include: ["src/**"]
            }));
            //      添加babenl转移
            config.needBabel && plugins.push(babel({
                extensions: [".ts", ...DEFAULT_EXTENSIONS],
                configFile: babelrc,
                comments: false,
            }));
            //      合并插件
            if (item.plugins) {
                // @ts-ignore
                Array.isArray(item.plugins) ? plugins.push(...item.plugins) : plugins.push(item.plugins);
            }
            item.plugins = plugins;
        }
        //  启用外部依赖
        {
            const external = [];
            config.needExternal && external.push(/node_modules/gi);
            if (item.external) {
                Array.isArray(item.external)
                    ? external.push(...item.external)
                    : external.push(item.external);
            }
            // @ts-ignore
            item.external = external;
        }
        //  警告处理
        config.ignoreWarning && ignoreWarning(item);
    });

    return options;
}

/**
 * 处理rollup的警告信息
 * @param { import("rollup").RollupOptions[] } options 
 * @returns { import("rollup").RollupOptions[] }
 */
export function dealRollupWarn(options) {
    //  拦截特定警告：后续会添加一些自定义参数，减少警告信息输出
    Array.isArray(options) && options.forEach(ignoreWarning);
    return options;
}

/**
 * 忽略警告
 * @param { import("rollup").RollupOptions} options 
 */
function ignoreWarning(options) {
    const original = options.onwarn;
    options.onwarn = function (warning, warn) {
        switch (warning.code) {
            case "UNKNOWN_OPTION":
                break;
            //  默认情况，输出警告信息
            default: {
                original
                    ? original.call(this, warning, warn)
                    : warn.call(this, warning);
                break;
            }
        }
    }
}
/**
 * 获取Rollup的扩展配置选项
 * @param {string} root 包根目录
 * @returns 包的tsconfig、babel等相关配置文件路径；若包目录下不存在，则走根目录下的默认配置
 */
function getRollupExtendOptions(root) {
    /** tsconmfig文件配置路径 */
    const tsconfigFile = resolve(root, "tsconfig.json");
    /** babel配置文件路径 */
    const babelrcFile = resolve(root, '.babelrc.json');


    return {
        /** tsconfig配置文件路径 */
        tsconfig: existsSync(tsconfigFile) ? tsconfigFile : resolve(__dirname, "../tsconfig.base.json"),
        /** babel配置文件路径 */
        babelrc: existsSync(babelrcFile) ? babelrcFile : resolve(__dirname, "../.babelrc.json"),
    }
}
