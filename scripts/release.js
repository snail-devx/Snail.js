/**
 * 生成发布NPM包的脚本
 *  1、生成打包文件
 *  2、生成npm包文件
 *  3、发布npm包：后续看情况实现
 */

import { fileURLToPath } from "url";
import { cpSync, existsSync, rmSync } from "fs";
import { resolve } from "path";
import { execaSync } from "execa";
import picocolors from "picocolors";
import {
    reMakeDir, log, step, trace,
    DIR_RELEASEROOT, DIR_TEMPROOT, allPackages, getPackages
} from "./util.js";
import { argMap, buildPackage } from "./build.js"

/** 文件所处目录路径  */
const __dirname = fileURLToPath(new URL('.', import.meta.url));
/** 默认copy的文件 */
const DEFAULT_FILES = ["index.js", "package.json", "LICENSE", "README.md"];
/** 默认共享的文件 */
const DEFAULT_SHARED = ["LICENSE"];

/**
 * 发布指定包；构建npm项目，自动版本号、自动publish
 * @param {import("../types/package").Package} pkg 
 */
function releasePackage(pkg) {
    reMakeDir(pkg.releaseRoot);
    //  1、编译构建，需要为生产环境
    buildPackage(pkg, false);
    //  2、生成npm包文件
    step(`\r\n👉 生成NPM包：${pkg.releaseRoot}`);
    //      递增版本号：后续看情况精确处理
    execaSync(
        "npm",
        ["version", "patch"],
        { cwd: pkg.root, stdio: "inherit" }
    );
    //      1、  默认文件：package.json，license，README、、、
    DEFAULT_FILES.forEach(file => {
        const src = resolve(pkg.root, file);
        const target = resolve(pkg.releaseRoot, file);
        trace(`--copy \t${src} \t➡️\t ${target}`);
        existsSync(src) && cpSync(src, target);
    });
    /**
     * distRoot目录废弃，直接发布删除到releaseRoot目录下
     //      2、copy dist目录；忽略src目录（此目录是生成.d.ts文件用的）
     checkExists(pkg.distRoot, "dist目录") && readdirSync(pkg.distRoot).forEach(item => {
         const src = resolve(pkg.distRoot, item);
         const target = resolve(pkg.releaseRoot, basename(dirname(src)), item);
         cpSync(src, target, { recursive: true });
     });
     */
    //      3、生成、合并.d.ts文件 
    step(`\r\n👉 生成并合并.d.ts文件：${pkg.typesRoot}`);
    {
        log(`--rollupfile \t${resolve(__dirname, "../rollup.dts.config.js")}`);
        /** 由于采用全局根目录编译模式，--rootDir指定到Packages的src下编译,tsc会报错：
         *      error TS6059: File 'xxx/types/package.ts' is not under 'rootDir' 'xxx/packages/snail.core/src'. 
         *          'rootDir' is expected to contain all source files.
         *  若按照单项项目编译，则其他项目的.ts文件也没再rootDir下，仍然会报错
         * 退而求其次，每次发布时都先全局编译所有Packages的.d.ts文件，再逐个项目合并
        execaSync(
            "./tsc",
            [
                //  指定专有的tsconfig配置文件
                "-p",
                resolve(__dirname, "../tsconfig.types.json"),
                //  明确编译的源和输出路径；方便后续执行rollup合并dts文件
                "--rootDir",
                pkg.srcRoot,
                "--declarationDir",
                pkg.typesRoot
            ],
            {
                cwd: resolve(__dirname, "../node_modules/.bin"),
                stdio: "inherit"
            }
        )
         */
        execaSync(
            "rollup",
            [
                "-c",
                "rollup.dts.config.js",
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
        )
    }
    //      4、补充共享文件：若已经存在则忽略
    step(`\r\n👉 补充共享文件`);
    DEFAULT_SHARED.forEach(file => {
        const src = resolve(__dirname, "../", file);
        const dest = resolve(pkg.releaseRoot, file);
        trace(`--copy \t${src} \t➡️\t ${dest}`);
        existsSync(src) && (existsSync(dest) || cpSync(src, dest));
    });
    //  3、发布npm包：后续看情况实现
    execaSync(
        "npm",
        ["publish"],
        { cwd: pkg.releaseRoot, stdio: "inherit" }
    );
}


//  自执行，执行打包操作：直接运行此文件时才执行
if (fileURLToPath(import.meta.url) === process.argv[1]) {
    //  1、新全局编译.d.ts文件：由于采用的是根目录统一编译模式，tsc不能指定rootDir到Packages目录下，否则会报错
    step(`👉 全局编译.d.ts文件：${DIR_TEMPROOT}`);
    log(`--tsconfig \t${resolve(__dirname, "../tsconfig.types.json")}`);
    log(`--rootDir \t${resolve(__dirname, "../packages")}`);
    log(`--outDir \t${DIR_TEMPROOT}`);
    reMakeDir(DIR_TEMPROOT);
    execaSync(
        "./tsc",
        [
            //  指定专有的tsconfig配置文件
            "-p",
            resolve(__dirname, "../tsconfig.types.json"),
            //  明确编译的源和输出路径；方便后续执行rollup合并dts文件
            "--rootDir",
            resolve(__dirname, "../packages"),
            "--declarationDir",
            DIR_TEMPROOT,
        ],
        {
            cwd: resolve(__dirname, "../node_modules/.bin"),
            stdio: "inherit"
        }
    );
    //  2、遍历需要发布的包：打包生成js、合并.d.ts文件，生成npm包文件
    (argMap._.length > 0 ? getPackages(argMap._) : allPackages)
        .forEach(releasePackage);
    //  3、生成完成后，输入release目录，删除临时目录
    existsSync(DIR_TEMPROOT) && rmSync(DIR_TEMPROOT, { recursive: true });
    console.log(picocolors.green(`\r\n👋 发布成功 \t${DIR_RELEASEROOT}`));
}
