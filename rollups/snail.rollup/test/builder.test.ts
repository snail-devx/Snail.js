import { describe, expect, test } from 'vitest'

import { Builder } from "../src/index";
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { BuilderOptions, CommonLibOptions, IRollupBuilder } from '../src/models/builder-model';
import { ComponentOptions } from '../src/models/component-model';

const { getBuilder, getDefaultOptions, getFileOptions } = Builder;

/** 不使用如下方式获取dirName，会在末尾存在 "/"；但resolve等不会存在 "/"；会导致断言出问题
 * const __dirname = fileURLToPath(new URL('.', import.meta.url)); 
 **/
const __filename = fileURLToPath(import.meta.url);
/** 文件所处目录路径  */
const __dirname = dirname(__filename);

//  获取builder时，触发commonLib校验
test("getBuilder-checkCommonLib", () => {
    const options: BuilderOptions = { root: __dirname, srcRoot: resolve(__dirname, "web") };
    options.commonLib = [
        { id: "vue", name: "Vue", url: "/snail/test/vue.js" },
        undefined!,
        { id: "vue2", name: "Vue2", url: "/snail/test/vue2.js" },
    ];
    expect(() => getBuilder(options, undefined!)).toThrowError("options.commonLib[1] invalid: must be an object.");

    options.commonLib[1] = { id: "", name: "snail", url: "/test/url.js" };
    expect(() => getBuilder(options, undefined!)).toThrowError("options.commonLib[1] invalid: id must be a non-empty string.");
    options.commonLib[1] = { id: "snail", name: "", url: "/test/url.js" };
    // expect(() => getBuilder(options, undefined!)).toThrowError("options.commonLib[1] invalid: name must be a non-empty string.");
    expect(() => getBuilder(options, undefined!));
    options.commonLib[1] = { id: "snail", name: "snail2", url: "" };
    // expect(() => getBuilder(options, undefined!)).toThrowError("options.commonLib[1] invalid: url must be a non-empty string.");
    expect(() => getBuilder(options, undefined!));
    options.commonLib[1] = { id: "vue", name: "snail", url: "/test/url.js" };
    expect(() => getBuilder(options, undefined!)).toThrowError("options.commonLib[1] invalid: id is duplicated. id:vue.");

    options.commonLib[1] = { id: "snail", name: "snail", url: "test/url.js" };
    expect(() => getBuilder(options, undefined!)).toThrowError("options.commonLib[1] invalid: url must be a valid url. url:test/url.js.");
});
//  获取builder时，其他错误条件测试
test("getBuilder-error", () => {
    expect(() => getBuilder(undefined!, undefined!)).toThrowError("options must be an object.");

    let options: BuilderOptions = { root: null! };
    expect(() => getBuilder(options, undefined!)).toThrowError("options.root must be a non-empty string.");
    options = { root: resolve(__dirname, "ddd") };
    expect(() => getBuilder(options, undefined!)).toThrowError(/^options\.root not exists/);
    options.root = __dirname;
    options.srcRoot = resolve(__dirname, "xxxx");
    expect(() => getBuilder(options, undefined!)).toThrowError(/^options\.srcRoot not exists/);
    options = { root: __dirname, srcRoot: resolve(__dirname, "web") };
    options.distRoot = resolve(__dirname, "xxxx");
    expect(() => getBuilder(options, undefined!)).toThrowError(/^distRoot must be child of siteRoot/);

    options = { root: __dirname, srcRoot: resolve(__dirname, "web") };
    expect(() => getBuilder(options, undefined!)).toThrowError("plugin must be a function");
});

//  构建器测试：常规测试，主要测试build相关方法
describe("IRollupBuilder", async () => {
    console.clear();
    const options: BuilderOptions = { root: __dirname, srcRoot: resolve(__dirname, "web") };
    const builder: IRollupBuilder = getBuilder(options, (component, context, options) => {
        return [];
    });
    options.commonLib = [
        { id: "vue", name: "Vue", url: "http://www.baiodu.com/vue.js" }
    ];

    //  构建测试，验证组件的构建结果
    test("build", () => {
        const commonLib: CommonLibOptions[] = [];

        const components: ComponentOptions[] = [
            { src: "index.ts", commonLib: [], isCommonLib: true, name: "snail" },
            { src: "index.ts", format: "amd" },
            { src: "index.ts", dist: "/test/index.js", url: "/test/url/index.js" },
        ];
        let rollupOptions = builder.build(components, undefined);
        rollupOptions = builder.build(components, commonLib);
        //  检测自身相关信息的合法性
        console.warn("--------------还没做自身合法性验证");

        //  init 报错
        components[1] = {
            src: "./index.ts",
            init(component, options) {
                throw new Error("test init error");
            },
        }
        expect(() => builder.build(components, commonLib)).toThrowError("test init error");
    });
    //  指定项目文件做构建：内部依赖build，这里主要测试项目文件合法性和依赖的有效性
    test("buildProject-error", async () => {
        await expect(builder.buildProject()).rejects
            .toThrowError("projects must be a non-empty array.");
        await expect(() => builder.buildProject(...[])).rejects
            .toThrowError("projects must be a non-empty array.");
        await expect(() => builder.buildProject("")).rejects
            .toThrowError("projects[0] is invalid: must be a non-empty string.");
        await expect(builder.buildProject(resolve(__dirname, "./.projects/empty.project.js"))).rejects
            .toThrowError("components must be a non-empty array.");

    });
    test("buildProject", async () => {

        // let rollupOptions = await builder.buildProject(resolve(__dirname, "./.projects/core.project.js"));
        // await builder.buildProject(resolve(__dirname, "./.projects/core.project2.js"));

        await builder.buildProject("./.projects/core.project.js", "./.projects/core.project2.js",);
    });

    //  基于命令行参数做构建：内部还是依赖 buildProject做构建，这里仅测试一下异常情况
    test("buildFromCmd", async () => {
        await expect(builder.buildFromCmd()).rejects
            .toThrowError("--project argument invalid. example: --project ./.projects/common.js ./.projects/service.js");
        const argLen = process.argv.length;
        process.argv.push("--project");
        await expect(builder.buildFromCmd()).rejects
            .toThrowError("--project argument invalid. example: --project ./.projects/common.js ./.projects/service.js");

        process.argv.splice(argLen, 1);
        process.argv.push("--project", "./.projects/common.js");
        await expect(builder.buildFromCmd()).rejects
            .toThrowError(/^project not exists\./);

        process.argv.push("--project", "./.projects/common.js");
        await expect(builder.buildFromCmd()).rejects
            .toThrowError(/^project not exists\./);
    });
});