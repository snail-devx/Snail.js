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
    reMakeDir, step, trace,
    DIR_RELEASEROOT, DIR_TEMPROOT, allPackages, getPackages
} from "./util.js";
import { argMap, buildPackage } from "./build.js"

/** 文件所处目录路径  */
const __dirname = fileURLToPath(new URL('.', import.meta.url));
/** 默认copy的文件 */
const DEFAULT_FILES = ["index.js", "package.json", "LICENSE", "README.md", ".code-snippets"];
/** 默认共享的文件 */
const DEFAULT_SHARED = ["LICENSE"];
/** 是否需要发布 */
// const needPublish = existsSync(resolve(__dirname, "../.snail.publish"));
var needPublish = true;
needPublish = false;

/**
 * 发布指定包；构建npm项目，自动版本号、自动publish
 * @param {import("../typings/package").Package} pkg 
 */
function releasePackage(pkg) {
    reMakeDir(pkg.releaseRoot);
    //  1、编译构建，需要为生产环境
    buildPackage(pkg, true);
    //  2、生成npm包文件
    step(`\r\n👉 生成NPM包：${pkg.releaseRoot}`);
    //      递增版本号：后续看情况精确处理；不自动增加版本号，根据情况进行自增
    // needPublish && execaSync(
    //     "npm",
    //     ["version", "patch"],
    //     { cwd: pkg.root, stdio: "inherit" }
    // );
    //      1、  默认文件：package.json，license，README、、、
    DEFAULT_FILES.forEach(file => {
        const src = resolve(pkg.root, file);
        const target = resolve(pkg.releaseRoot, file);
        trace(`--copy \t${src} \t➡️\t ${target}`);
        existsSync(src) && cpSync(src, target);
    });
    //      2、补充共享文件：若已经存在则忽略
    step(`\r\n👉 补充共享文件`);
    DEFAULT_SHARED.forEach(file => {
        const src = resolve(__dirname, "../", file);
        const dest = resolve(pkg.releaseRoot, file);
        trace(`--copy \t${src} \t➡️\t ${dest}`);
        existsSync(src) && (existsSync(dest) || cpSync(src, dest));
    });
    //  3、发布npm包：后续看情况实现
    needPublish && execaSync(
        "npm",
        ["publish"],
        { cwd: pkg.releaseRoot, stdio: "inherit" }
    );
}


//  自执行，执行打包操作：直接运行此文件时才执行
if (fileURLToPath(import.meta.url) === process.argv[1]) {
    //  1、遍历需要发布的包：打包生成js、合并.d.ts文件，生成npm包文件
    (argMap._.length > 0 ? getPackages(argMap._) : allPackages)
        .forEach(releasePackage);
    //  2、生成完成后，输入release目录，删除临时目录
    existsSync(DIR_TEMPROOT) && rmSync(DIR_TEMPROOT, { recursive: true });
    console.log(picocolors.green(`\r\n👋 发布成功 \t${DIR_RELEASEROOT}\r\n`));
}