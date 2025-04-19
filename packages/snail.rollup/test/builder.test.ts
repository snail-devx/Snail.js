import { describe, expect, test } from 'vitest'

import { Builder, helper } from "../src/index";
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { BuilderOptions, CommonLibOptions, IRollupBuilder } from '../src/models/builder';
import { ComponentOptions } from '../src/models/component';

const { getBuilder, getDefaultOptions, getFileOptions } = Builder;

/** 不使用如下方式获取dirName，会在末尾存在 "/"；但resolve等不会存在 "/"；会导致断言出问题
 * const __dirname = fileURLToPath(new URL('.', import.meta.url)); 
 **/
const __filename = fileURLToPath(import.meta.url);
/** 文件所处目录路径  */
const __dirname = dirname(__filename);

describe("BuilderOptions", async () => {
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
        expect(() => getBuilder(options, undefined!)).toThrowError("options.commonLib[1] invalid: must be an object.");

        options.commonLib[1] = { id: "", name: "snail", url: "/test/url.js" };
        expect(() => getBuilder(options, undefined!)).toThrowError("options.commonLib[1] invalid: id must be a non-empty string.");
        options.commonLib[1] = { id: "snail", name: "", url: "/test/url.js" };
        expect(() => getBuilder(options, undefined!)).toThrowError("options.commonLib[1] invalid: name must be a non-empty string.");
        options.commonLib[1] = { id: "snail", name: "snail2", url: "" };
        expect(() => getBuilder(options, undefined!)).toThrowError("options.commonLib[1] invalid: url must be a non-empty string.");

        options.commonLib[1] = { id: "vue", name: "snail", url: "/test/url.js" };
        expect(() => getBuilder(options, undefined!)).toThrowError("options.commonLib[1] invalid: id is duplicated. id:vue.");

        options.commonLib[1] = { id: "snail", name: "snail", url: "test/url.js" };
        expect(() => getBuilder(options, undefined!)).toThrowError("options.commonLib[1] invalid: url must be a valid url. url:test/url.js.");
    });
    //  错误信息校正覆盖：借用getBuilder完成checkBuilder方法
    test("error-coverage", () => {
        expect(() => getBuilder(undefined!, undefined!)).toThrowError("options must be an object.");

        let options: BuilderOptions = { root: null! };
        expect(() => getBuilder(options, undefined!)).toThrowError("options.root must be a non-empty string.");
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
    test("getBuilder-plugin", () => {
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

    //  用一个Component测试checkComponent相关错误信息
    test("checkComponent", () => {
        expect(() => builder.build(undefined!)).toThrowError("components must be a non-empty array.");
        expect(() => builder.build([])).toThrowError("components must be a non-empty array.");
        expect(() => builder.build([undefined!])).toThrowError("components[0] invalid: must be an object.");
        //  src测试
        expect(() => builder.build([{ src: undefined! }])).toThrowError("components[0] invalid: src must be a non-empty string.");
        expect(() => builder.build([{ src: "" }])).toThrowError("components[0] invalid: src must be a non-empty string.");
        expect(() => builder.build([{ src: " " }])).toThrowError("components[0] invalid: src must be a non-empty string.");
        expect(() => builder.build([{ src: resolve(__dirname, "snail.builder.js") }])).toThrowError(/^components\[0\] invalid: src must be child of srcRoot/);
        expect(() => builder.build([{ src: resolve(__dirname, "src", "snail.builder.js") }])).toThrowError(/^components\[0\] invalid: src not exists\./);
        expect(() => builder.build([{ src: resolve(__dirname, "src") }])).toThrowError(/^components\[0\] invalid: src must be file\./);
        //  root
        const component: ComponentOptions = { src: resolve(__dirname, "src", "index.ts") };
        component.root = __dirname;
        expect(() => builder.build([component])).toThrowError(/components\[0\] invalid: root must be child of srcRoot\./);
        component.root = "";
        //  @ts-ignore 打包格式相关
        component.format = "amd1";
        expect(() => builder.build([component])).toThrowError("components[0] invalid: format must be one of amd,cjs,es,iife,system,umd.");
        component.format = undefined;
        builder.build([component]);
        component.format = null!;
        builder.build([component]);
        //  name验证
        component.isCommonLib = true;
        expect(() => builder.build([component])).toThrowError("components[0] invalid: name must be a non-empty string when component.isCommonLib is true.");
        component.name = "";
        expect(() => builder.build([component])).toThrowError("components[0] invalid: name must be a non-empty string when component.isCommonLib is true.");
        component.name = " ";
        expect(() => builder.build([component])).toThrowError("components[0] invalid: name must be a non-empty string when component.isCommonLib is true.");
        component.name = null!;
        expect(() => builder.build([component])).toThrowError("components[0] invalid: name must be a non-empty string when component.isCommonLib is true.");
        component.name = undefined!;
        expect(() => builder.build([component])).toThrowError("components[0] invalid: name must be a non-empty string when component.isCommonLib is true.");
        // @ts-ignore
        component.name = 1;
        expect(() => builder.build([component])).toThrowError("components[0] invalid: name must be a non-empty string when component.isCommonLib is true.");
        component.name = "snail";

        //  不报错就算检测成功了
        builder.build([component]);
    });
    test("checkAssets", () => {
        const component: ComponentOptions = { src: resolve(__dirname, "src", "index.ts") };

        component.assets = [undefined!];
        expect(() => builder.build([component])).toThrowError("components[0].assets[0] invalid: must be an object.");
        component.assets = [""];
        expect(() => builder.build([component])).toThrowError("components[0].assets[0] invalid: src must be a non-empty string.");
        component.assets = [" "];
        expect(() => builder.build([component])).toThrowError("components[0].assets[0] invalid: src must be a non-empty string.");

        component.assets = [resolve(__dirname, "snail.builder.js")];
        expect(() => builder.build([component])).toThrowError(/^components\[0]\.assets\[0] invalid: src must be child of srcRoot\./);
        component.assets = [resolve(__dirname, "src")];
        expect(() => builder.build([component])).toThrowError(/^components\[0]\.assets\[0] invalid: src must be file\./);
        component.assets = [resolve(__dirname, "src", "index.ts1")];
        expect(() => builder.build([component])).toThrowError(/^components\[0]\.assets\[0] invalid: src not exists\./);
        component.assets = [
            resolve(__dirname, "src", "index.ts"),
            { src: resolve(__dirname, "src", "index.ts"), dist: "_SITEROOT_/js.xx" },
            { src: resolve(__dirname, "src", "index.ts"), dist: "/js.xx" }
        ];
        expect(() => builder.build([component])).toThrowError(/^components\[0]\.assets\[2] invalid: dist must be child of siteRoot\./);

    });
    //  checkCommonLib 这个在 getBuilder-error 中已经测试的比较完整了，这里忽略

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
    })
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