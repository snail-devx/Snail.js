import { execaSync } from "execa"
import { resolve } from "path";
import { fileURLToPath } from 'url';
import minimist from "minimist";
import { step, log, reMakeDir } from "../shared/io.js";
import { allPackages, getPackages } from '../shared/packages.js';

/** 文件所处目录路径  */
const __dirname = fileURLToPath(new URL('.', import.meta.url));

/**
 * 命令执行时的参数字典
 * @type {import("minimist").ParsedArgs}
 */
export const argMap = minimist(process.argv.slice(2));

/**
 * 构建指定项目包
 * @param {import("../types/package").Package} pkg 
 * @param {boolean} [clearDistBefore=true] 是否在构建前清除dist目录
 */
export function buildPackage(pkg, clearDistBefore = true) {
    step(`👉 构建项目：${pkg.dir}\t\t包名：${pkg.name}`);
    log(`  rollupfile : ${pkg.rollupFile}`);
    clearDistBefore === true && reMakeDir(pkg.distRoot);
    //  执行rollup构建
    execaSync(
        "rollup",
        [
            "-c",
            "--environment",
            [
                `BUILD:${pkg.dir}`,
                ...(Array.isArray(argMap.environment) ? argMap.environment : [argMap.environment])
            ].filter(Boolean).join(",")
        ],
        {
            cwd: resolve(__dirname, "../"),
            stdio: "inherit"
        }
    );
}

//  自执行，执行打包操作：直接运行此文件时才执行
if (fileURLToPath(import.meta.url) === process.argv[1]) {
    (argMap._.length > 0 ? getPackages(argMap._) : allPackages)
        .forEach(buildPackage);
}