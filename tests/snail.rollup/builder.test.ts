import { assert, describe, expect, test } from 'vitest'

import { getBuilder, getDefaultOptions, getFileOptions } from "../../packages/snail.rollup/src/builder";
import { fileURLToPath } from 'url';
import { resolve } from 'path';
import { BuilderOptions, CommonLibOptions, IRollupBuilder } from '../../packages/snail.rollup/src/models/builder';
import { ComponentOptions } from '../../packages/snail.rollup/src/models/component';

/** 文件所处目录路径  */
const __dirname = fileURLToPath(new URL('.', import.meta.url));

describe("BuilderOptions", async () => {
    //  获取默认配置项
    test("getDefaultOptions", () => {
        expect(() => getDefaultOptions(undefined!)).toThrowError("root must be a string and cannot be empty");
        expect(() => getDefaultOptions('')).toThrowError("root must be a string and cannot be empty");
        expect(() => getDefaultOptions(null!)).toThrowError("root must be a string and cannot be empty");

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
        let options = await getFileOptions(resolve(__dirname, "snail.builder.js"));
        expect(options.root).toStrictEqual(__dirname);
        expect(options.srcRoot).toStrictEqual(resolve(__dirname, "src"));
        expect(options.siteRoot).toStrictEqual(resolve(__dirname, "dist"));
        expect(options.distRoot).toStrictEqual(resolve(__dirname, "dist"));
        expect(options.isProduction).toStrictEqual(true);

        options = await getFileOptions(resolve(__dirname, "snail.builder1.js"));
        expect(options.root).toStrictEqual(__dirname);
        expect(options.srcRoot).toStrictEqual(resolve(__dirname, ".."));
        expect(options.siteRoot).toStrictEqual(resolve(__dirname, "dist"));
        expect(options.distRoot).toStrictEqual(resolve(__dirname, "dist"));
        expect(options.cssChunkFolder).toStrictEqual("CSS");
        expect(options.isProduction).toStrictEqual(false);
    });
});

//  getBuilder错误覆盖测试
describe("getBuilder-Error", () => {
    //  测试commonLib校验
    test("commonLib", () => {
        const options = getDefaultOptions(__dirname);
        options.commonLib = [
            { id: "vue", name: "Vue", url: "/snail/test/vue.js" },
            undefined!,
            { id: "vue2", name: "Vue2", url: "/snail/test/vue2.js" },
        ];
        expect(() => getBuilder(options, undefined!)).toThrowError("options.commonLib[1] is invalid: must be an object.");

        options.commonLib[1] = { id: "", name: "snail", url: "/test/url.js" };
        expect(() => getBuilder(options, undefined!)).toThrowError("options.commonLib[1] is invalid: id must be a string and cannot be empty");
        options.commonLib[1] = { id: "snail", name: "", url: "/test/url.js" };
        expect(() => getBuilder(options, undefined!)).toThrowError("options.commonLib[1] is invalid: name must be a string and cannot be empty");
        options.commonLib[1] = { id: "snail", name: "snail2", url: "" };
        expect(() => getBuilder(options, undefined!)).toThrowError("options.commonLib[1] is invalid: url must be a string and cannot be empty");

        options.commonLib[1] = { id: "vue", name: "snail", url: "/test/url.js" };
        expect(() => getBuilder(options, undefined!)).toThrowError("options.commonLib[1] is invalid: id is duplicated. id:vue.");

        options.commonLib[1] = { id: "snail", name: "snail", url: "test/url.js" };
        expect(() => getBuilder(options, undefined!)).toThrowError("options.commonLib[1] is invalid: url must be a valid url. url:test/url.js.");

    });
    //  错误信息校正覆盖：借用getBuilder完成checkBuilder方法
    test("error-coverage", () => {
        expect(() => getBuilder(undefined!, undefined!)).toThrowError("options must be an object.");

        let options: BuilderOptions = { root: null! };
        expect(() => getBuilder(options, undefined!)).toThrowError("options.root must be a string and cannot be empty");
        options = { root: resolve(__dirname, "ddd") };
        expect(() => getBuilder(options, undefined!)).toThrowError(/^options\.root not exists/);
        options.root = __dirname;
        options.srcRoot = resolve(__dirname, "xxxx");
        expect(() => getBuilder(options, undefined!)).toThrowError(/^options\.srcRoot not exists/);

        options = { root: __dirname };
        options.distRoot = resolve(__dirname, "xxxx");
        expect(() => getBuilder(options, undefined!)).toThrowError(/^distRoot must be child of siteRoot/);

    });
    //  插件测试
    test("getBuilder-error", () => {
        const options: BuilderOptions = { root: __dirname, };
        expect(() => getBuilder(options, undefined!)).toThrowError("plugin must be a function");
    })
});

//  构建器测试：常规测试，主要测试build相关方法
describe("IRollupBuilder", async () => {
    console.clear();
    const options: BuilderOptions = { root: __dirname, };
    const builder: IRollupBuilder = getBuilder(options, (component, context, options) => {
        return [];
    });
    options.commonLib = [
        { id: "vue", name: "Vue", url: "http://www.baiodu.com/vue.js" }
    ];
    //  显示指定组件做构建
    test("build", () => {
        //  checkCommonLib 这个在 getBuilder-error 中已经测试的比较完整了，这里忽略
        const commonLib: CommonLibOptions[] = [];
        //  checkComponent 错误情况和正常情况测试
        expect(() => builder.build(undefined!)).toThrowError("components must be an array and cannot be empty");
        expect(() => builder.build([])).toThrowError("components must be an array and cannot be empty");
        expect(() => builder.build([undefined!])).toThrowError("components[0] is invalid: must be an object");
        const components: ComponentOptions[] = [
            { src: "index.ts", commonLib: [], isCommonLib: true, name: "snail" },
            { src: "index.ts", format: "amd" },
            { src: "index.ts", dist: "/test/index.js", url: "/test/url/index.js" },
        ];
        let rollupOptions = builder.build(components, undefined);
        rollupOptions = builder.build(components, commonLib);
        //  检测自身相关信息的合法性


        //  init 报错
        components[1] = {
            src: "./index.ts",
            init(component, options) {
                throw new Error("test init error");
            },
        }
        expect(() => builder.build(components, commonLib)).toThrowError("test init error");

        //  执行一下onwarn，进行默认覆盖率测试
        (rollupOptions[0].onwarn as Function)("test warn logging", console.warn);
    });
    //  指定项目文件做构建
    test("buildProject", async () => {
        await expect(builder.buildProject()).rejects
            .toThrowError("projects must be an array and cannot be empty");
        await expect(() => builder.buildProject(...[])).rejects
            .toThrowError("projects must be an array and cannot be empty");
        await expect(() => builder.buildProject("")).rejects
            .toThrowError("projects[0] is invalid: must be a string and cannot be empty");


        let rollupOptions = await builder.buildProject(resolve(__dirname, "./.projects/core.project.js"));
        rollupOptions = await builder.buildProject(resolve(__dirname, "./.projects/core.project2.js"));

    });
    //  基于命令行参数做构建
    test("buildFromCmd", async () => {

    });
});