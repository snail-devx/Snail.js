/**
 * 编译构建，将指定package包编译生成js文件，并根据需要生成.d.ts文件
 */
import { execaSync } from "execa"
import { resolve } from "path";
import { fileURLToPath } from 'url';
import minimist from "minimist";
import {
    step, log, reMakeDir,
    allPackages, getPackages,
    isStringNotEmpty,
    error,
    trace,
    warn
} from "./util.js";

/** 文件所处目录路径  */
const __dirname = fileURLToPath(new URL('.', import.meta.url));

/**
 * 命令执行时的参数字典
 * @type {import("minimist").ParsedArgs}
 */
export const argMap = minimist(process.argv.slice(2));
/** 是否是生产环境，不能用   process.env.NODE_ENV === "production"; 取不到*/
const isProd = Array.isArray(argMap.environment)
    ? argMap.environment.indexOf("NODE_ENV:production") != -1
    : argMap.environment == "NODE_ENV:production";
/** 是否需要生成.d.ts文件 */
export const needTypings = argMap.typings == true;
/**
 * 构建指定项目包
 * @param {import("../typings/package").Package} pkg 
 * @param {boolean} clearBefore 是否在构建前清理目录，如构建输出目录dist等
 */
export function buildPackage(pkg, clearBefore = false) {
    step(`👉 构建项目：${pkg.dir}\t\t包名：${pkg.name}\t\t根路径：${pkg.root}`);
    log(`--releaseRoot \t${pkg.releaseRoot}`);
    log(`--distRoot \t${pkg.distRoot}`);
    log(`--typesRoot \t${pkg.typesRoot}`);
    // 清理输出目录
    clearBefore && reMakeDir(pkg.releaseRoot);
    // 执行build构建项目 
    warn("\r\n-- 执行 build 命令，构建项目");
    {
        if (isStringNotEmpty(pkg.pkgJson?.scripts?.build) == false) {
            error(`${pkg.root}\\package.json 文件中缺少构建脚本 build`);
            return;
        }
        execaSync("pnpm", [
            "run",
            "build",
            "--releaseRoot",
            pkg.releaseRoot,
            "--environment",
            [
                ...(Array.isArray(argMap.environment) ? argMap.environment : [argMap.environment])
            ].filter(Boolean).join(",")
        ], {
            cwd: pkg.root,
            stdio: "inherit"
        });
    }
    // 生成.d.ts文件
    if (needTypings == true) {
        warn("\r\n-- 执行 types 命令，生成.d.ts文件");
        if (isStringNotEmpty(pkg.pkgJson?.scripts?.types) == false) {
            error(`${pkg.root}\\package.json 文件中缺少构建脚本 types`);
            return;
        }
        execaSync("pnpm", [
            "run",
            "types",
            //  强制指定 types文件的输出路径
            "--declarationDir",
            pkg.typesRoot
        ], {
            cwd: pkg.root,
            stdio: "inherit"
        });
    }
    //  生产环境执行.d.ts文件合并操作
    if (needTypings == true && isProd == true) {
        warn("\r\n-- 生产环境下合并.d.ts文件；合并完成后删除typeRoot目录\r\n");
        execaSync(
            "rollup",
            [
                "-c",
                "rollup.dts.config.js",
                "--typesRoot",
                pkg.typesRoot
            ],
            {
                cwd: resolve(__dirname, "../"),
                stdio: "inherit"
            }
        )
    }
}

//  自执行，执行打包操作：直接运行此文件时才执行
if (fileURLToPath(import.meta.url) === process.argv[1]) {
    (argMap._.length > 0 ? getPackages(argMap._) : allPackages).forEach(pkg => {
        console.log();
        buildPackage(pkg, true)
    });
}