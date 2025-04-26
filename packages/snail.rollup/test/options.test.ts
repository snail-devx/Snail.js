/**
 * 构建器配置选项测试
 */
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

import { Builder } from "../src/index";
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { BuilderOptions, CommonLibOptions, IRollupBuilder } from '../src/models/builder';
import { ComponentOptions } from '../src/models/component';
import { existsSync, mkdirSync, rmSync } from 'fs';

const { getBuilder, getDefaultOptions, getFileOptions } = Builder;

/** 不使用如下方式获取dirName，会在末尾存在 "/"；但resolve等不会存在 "/"；会导致断言出问题
 * const __dirname = fileURLToPath(new URL('.', import.meta.url)); 
 **/
const __filename = fileURLToPath(import.meta.url);
/** 文件所处目录路径  */
const __dirname = dirname(__filename);

//  获取默认配置项
test("getDefaultOptions", () => {
    expect(() => getDefaultOptions(undefined!)).toThrowError("root must be a non-empty string.");
    expect(() => getDefaultOptions('')).toThrowError("root must be a non-empty string.");
    expect(() => getDefaultOptions(null!)).toThrowError("root must be a non-empty string.");

    const options = getDefaultOptions(__dirname);
    expect(options.root).toStrictEqual(__dirname);
    expect(options.srcRoot).toStrictEqual(resolve(__dirname, "src"));
    expect(options.siteRoot).toStrictEqual(resolve(__dirname, "dist"));
    expect(options.distRoot).toStrictEqual(resolve(__dirname, "dist"));
    expect(options.isProduction).toStrictEqual(false);

    process.env.NODE_ENV = "production";
    expect(getDefaultOptions(__dirname).isProduction).toStrictEqual(true);
    delete process.env.NODE_ENV;
});
//  基于文件配置选项
test("getFileOptions", async () => {
    delete process.env.FILE_MODE;
    //  常规测试
    let options = await getFileOptions(resolve(__dirname, "options/snail.builder.js"));
    expect(options.root).toStrictEqual(__dirname);
    expect(options.srcRoot).toStrictEqual(resolve(__dirname, "src"));
    expect(options.siteRoot).toStrictEqual(resolve(__dirname, "dist"));
    expect(options.distRoot).toStrictEqual(resolve(__dirname, "dist"));
    expect(options.isProduction).toStrictEqual(true);

    options = await getFileOptions(resolve(__dirname, "options/snail.builder1.js"));
    expect(options.root).toStrictEqual(__dirname);
    expect(options.srcRoot).toStrictEqual(resolve(__dirname, ".."));
    expect(options.siteRoot).toStrictEqual(resolve(__dirname, "dist"));
    expect(options.distRoot).toStrictEqual(resolve(__dirname, "dist"));
    expect(options.cssChunkFolder).toStrictEqual("CSS");
    expect(options.isProduction).toStrictEqual(false);
});

//  开始前和结束后，对src目录做一下初始化和清理
{
    beforeAll(() => {
        const srcRoot = resolve(__dirname, "src");
        existsSync(srcRoot) || mkdirSync(srcRoot, { recursive: true });
    });
    afterAll(() => {
        const srcRoot = resolve(__dirname, "src");
        existsSync(srcRoot) && rmSync(srcRoot, { recursive: true });
    });
}