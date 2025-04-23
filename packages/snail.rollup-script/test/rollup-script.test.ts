import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test } from 'vitest'
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { OutputOptions, rollup, RollupOptions } from "rollup";
import { existsSync, readFileSync, rmSync } from 'fs';
//  snail.rollup 采用源码引用方式，方便错误调试；整体测试完成后，再换成包形式
// import { Builder, helper } from "snail.rollup";
import { BuilderOptions, CommonLibOptions, IRollupBuilder } from "../../snail.rollup/src/index"
import { ComponentOptions } from '../../snail.rollup/src/index';
import { Builder, helper } from "../../snail.rollup/src/index";

import scriptPlugin, { transformScript } from "../src/index"
import { buildDist, buildNetPath, forceExt } from '../../snail.rollup/src/utils/helper';
import { version } from 'snail.core';
import assetPlugin from "../../snail.rollup-asset/src/index";
import urlPlugin from "../../snail.rollup-url/src/index";

//#region 测试前的准备工作
const options: BuilderOptions = {
    root: __dirname,
    srcRoot: resolve(__dirname, 'web'),
    distRoot: resolve(__dirname, 'dist'),
    siteRoot: resolve(__dirname, 'dist')
};
const builder = Builder.getBuilder(options, (component, context, options) => [
    scriptPlugin(component, context, options),
    urlPlugin(component, context, options),
    assetPlugin(component, context, options),
]);
beforeEach(() => {
    existsSync(options.distRoot!) && rmSync(options.distRoot!, { recursive: true });
});
afterEach(() => {
    existsSync(options.distRoot!) && rmSync(options.distRoot!, { recursive: true });
});

let ruleMessage: string = undefined!;
const tmpFunc = console.log;
console.log = (...args) => {
    ruleMessage = args[0];
    tmpFunc(...args);
};
//#endregion

//  默认常规情况测试，验证引用代码+commonLib配置
test("default", async () => {
    let components = builder.build([
        { src: "./core/core.ts", format: "es" }
    ]);
    //  引用 ./components/com，验证结果是把代码合并到core.js中
    let ret = await rollup(components[0]);
    await ret.write(components[0].output as OutputOptions);
    let dist = resolve(options.distRoot!, "./core/core.js");
    expect(existsSync(dist)).toStrictEqual(true);
    let content = readFileSync(dist, "utf-8").split("\n");
    expect(content.length).toStrictEqual(5);
    expect(content[0].trim()).toStrictEqual('//@ sourceURL=/core/core.js');
    expect(content[1]).toStrictEqual('const dateNow = Date.now;');
    expect(content[2]).toStrictEqual('');
    expect(content[3]).toStrictEqual('console.log(dateNow);');
    expect(content[4]).toStrictEqual('');
    //      验证components不存在
    expect(existsSync(resolve(options.distRoot!, "./components/com.js"))).toStrictEqual(false);
});
//  验证引用 src 下的commonLib
test("import-src-commonLib", async () => {
    const commonLib: CommonLibOptions = {
        id: resolve(options.srcRoot!, "./core/components/com.ts").replace(/\\/g, "/"),
        name: "snail-com",
        url: buildNetPath(options, resolve(options.distRoot!, "./core/components/com.js"))
    };

    let components = builder.build([
        {
            src: "./core/core.ts", format: "es", commonLib: [commonLib]
        },
        {
            src: "./core/core.ts", format: "es", commonLib: [commonLib], commonLibForceUrl: true,

        }
    ]);
    const dist = resolve(options.distRoot!, "./core/core.js");
    const tmpFunc = (commonLibUrl) => {
        expect(existsSync(dist)).toStrictEqual(true);
        let content = readFileSync(dist, "utf-8").split("\n");
        expect(content.length).toStrictEqual(5);
        expect(content[0].trim()).toStrictEqual('//@ sourceURL=/core/core.js');
        expect(content[1]).toStrictEqual(`import { dateNow } from '${commonLibUrl}';`);
        expect(content[2]).toStrictEqual('');
        expect(content[3]).toStrictEqual('console.log(dateNow);');
        expect(content[4]).toStrictEqual('');
    }
    //  引用 ./components/com，作为commlib存在

    let ret = await rollup(components[0]);
    await ret.write(components[0].output as OutputOptions);
    tmpFunc("./components/com.js");
    //  引用 ./components/com，但强制了url路径，此时import路径为 /core/components/com.js
    ret = await rollup(components[1]);
    await ret.write(components[1].output as OutputOptions);
    tmpFunc("/core/components/com.js");
});
//  验证引入net、npm公共包
test("import-other-commonLib", async () => {
    const commonLibs: CommonLibOptions[] = [
        { id: "vue", name: "Vue", url: "http://www.cdn.com/vue.js?v=3" },
        { id: "http://www.baidu.com/cl.js", name: "c1", url: "/cl-site.js" },
        { id: "/cl.js", name: "c2", url: "/cl.js?v=x" },
    ];
    let components = builder.build([
        { src: "./service/service.ts", format: "es", commonLib: commonLibs },
        { src: "./service/service.ts", format: "es", commonLib: commonLibs, commonLibForceUrl: true },
    ]);

    function checkOutContent(url1, url2, url3) {
        const dist = resolve(options.distRoot!, "./service/service.js");
        const content = readFileSync(dist, "utf-8").split("\n");
        expect(content.length).toStrictEqual(11);
        expect(content[0].trim()).toStrictEqual("//@ sourceURL=/service/service.js");
        expect(content[1]).toStrictEqual(`import Vue from '${url1}';`);
        expect(content[2]).toStrictEqual(`import nc from '${url2}';`);
        expect(content[3]).toStrictEqual(`import nc2 from '${url3}';`);
        expect(content[4]).toStrictEqual("");
        expect(content[5]).toStrictEqual("const x = Vue;");
        expect(content[6]).toStrictEqual("const x2 = nc;");
        expect(content[7]).toStrictEqual("const x3 = nc2;");
        expect(content[8]).toStrictEqual("");
        expect(content[9]).toStrictEqual("export { x, x2, x3 };");
        expect(content[10]).toStrictEqual("");
    }

    let ret = await rollup(components[0]);
    await ret.write(components[0].output as OutputOptions);
    checkOutContent("vue", "http://www.baidu.com/cl.js", "/cl.js");

    ret = await rollup(components[1]);
    await ret.write(components[1].output as OutputOptions);
    checkOutContent("http://www.cdn.com/vue.js?v=3", "/cl-site.js", "/cl.js?v=x");
});
//  验证死循环引入：经过测试，死循环不会再加载，不会报错
test("import-deadloop", async () => {
    const components = builder.build([
        { src: "./core/deadloop.ts", format: "es" },
    ]);
    let ret = await rollup(components[0]);
    await ret.write(components[0].output as OutputOptions);
    let dist = resolve(options.distRoot!, "./core/deadloop.js");
    expect(existsSync(dist)).toStrictEqual(true);
    let content = readFileSync(dist, "utf-8").split("\n");
    expect(content.length).toStrictEqual(8);
    expect(content[0].trim()).toStrictEqual('//@ sourceURL=/core/deadloop.js');
    expect(content[1]).toStrictEqual('const x11 = "1000";');
    expect(content[2]).toStrictEqual('');
    expect(content[3]).toStrictEqual('var deadloop = 1e3;');
    expect(content[4]).toStrictEqual('const a = 20;');
    expect(content[5]).toStrictEqual('');
    expect(content[6]).toStrictEqual('export { a, deadloop as default, x11 };');
    expect(content[7]).toStrictEqual('');
});
//  验证引用规则错误
test("import-error", async () => {
    const components = builder.build([
        { src: "./error/import-net-error.ts", format: "es" },
        { src: "./error/import-net-site-error.ts", format: "es" },
        { src: "./error/import-src-error.ts", format: "es" },
    ]);
    await expect(rollup(components[0])).rejects
        .toThrowError('process.exit unexpectedly called with "0"');
    expect(ruleMessage).toContain("import network script must be commonLib: cannot load code from network.");
    expect(ruleMessage).toContain("source         /a.x/x.js ");

    await expect(rollup(components[1])).rejects
        .toThrowError('process.exit unexpectedly called with "0"');
    expect(ruleMessage).toContain("import network script must be commonLib: cannot load code from network.");
    expect(ruleMessage).toContain("source         http://www/baidu.com/a.x/x.js?X=1 ");

    await expect(rollup(components[2])).rejects
        .toThrowError('process.exit unexpectedly called with "0"');
    expect(ruleMessage).toContain("import script must be child of componentRoot: it is child of srcRoot but not commonLib.");
    expect(ruleMessage).toContain("source         ../core/core");

});
//  代码覆盖率补偿
test("coverage", async () => {
    const commonLib: CommonLibOptions = {
        id: resolve(options.srcRoot!, "./core/components/com.ts").replace(/\\/g, "/"),
        name: "snail-com",
        url: buildNetPath(options, resolve(options.distRoot!, "./core/components/com.js"))
    };
    let components = builder.build(
        [
            { src: "./coverage.ts", format: "es" },
        ]
    );

    let ret = await rollup(components[0]);
    await ret.write(components[0].output as OutputOptions);


    const tmpBuilder = Builder.getBuilder(Object.assign({}, options, { isProduction: true }), (component, context, options) => [
        scriptPlugin(component, context, options),
        urlPlugin(component, context, options),
        assetPlugin(component, context, options),
    ]);
    components = tmpBuilder.build(
        [
            { src: "./coverage.ts", format: "es", sourceMap: true },
        ]
    );
    ret = await rollup(components[0]);
    await ret.write(components[0].output as OutputOptions);
});