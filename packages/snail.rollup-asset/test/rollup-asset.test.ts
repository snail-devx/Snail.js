import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test } from 'vitest'
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { OutputOptions, rollup, RollupOptions } from "rollup";
import { existsSync, readFileSync, rmSync } from 'fs';
//  snail.rollup 采用源码引用方式，方便错误调试；整体测试完成后，再换成包形式
// import { Builder, helper } from "snail.rollup";
import { BuilderOptions, CommonLibOptions, IRollupBuilder } from "../../snail.rollup/src/index"
import { ComponentOptions } from '../../snail.rollup/src/index';
import { Builder } from "../../snail.rollup/src/index";

import assetPlugin from "../src/index"
import { buildDist } from '../../snail.rollup/src/utils/helper';
import { version } from 'snail.core';
import urlPlugin from "snail.rollup-url"

//#region 测试前的准备工作
const options: BuilderOptions = { root: __dirname, srcRoot: resolve(__dirname, 'web'), distRoot: resolve(__dirname, 'dist') };
const builder = Builder.getBuilder(options, (component, context, options) => [
    urlPlugin(component, context, options),
    assetPlugin(component, context, options)
]);
let ruleMessage: string;
{
    const tmpFunc = console.log;
    console.log = (...args) => {
        ruleMessage = ruleMessage
            ? ruleMessage.concat("\r\n", args.join("\r\n"))
            : args.join("\r\n");
        tmpFunc(...args);
    };
}
beforeEach(() => {
    ruleMessage = "";
    existsSync(options.distRoot!) && rmSync(options.distRoot!, { recursive: true });
});
afterEach(() => {
    existsSync(options.distRoot!) && rmSync(options.distRoot!, { recursive: true });
});
//#endregion

//  符合所有规则的引入，正常验证存在性；测试import和显式指定的资源文件
test("default", async () => {
    //  显式指定版本号，方便后续做等值判断
    version.config({ version: "xxxxxxxxxxxxxxxx1235" });
    //  编译代码输出
    const components: RollupOptions[] = builder.build([
        {
            src: "index.ts",
            format: "es",
            assets: [
                "core/images/asset.png",
                "service/images/asset.png"
            ]
        },
    ]);
    let ret = await rollup(components[0]);
    await ret.write(components[0].output as OutputOptions);
    //  编译结果验证
    //      html验证
    let dist = resolve(options.distRoot!, "./core/views/core.html");
    expect(existsSync(dist)).toStrictEqual(true);
    let content: any = readFileSync(dist, "utf-8");
    expect(content).toStrictEqual("1");
    dist = resolve(options.distRoot!, "./service/views/service.html");
    expect(existsSync(dist)).toStrictEqual(true);
    content = readFileSync(dist, "utf-8");
    expect(content).toStrictEqual("2");
    //      png验证
    dist = resolve(options.distRoot!, "./core/images/asset.png");
    expect(existsSync(dist)).toStrictEqual(true);
    dist = resolve(options.distRoot!, "./core/images/favicon.png");
    expect(existsSync(dist)).toStrictEqual(true);
    dist = resolve(options.distRoot!, "./service/images/asset.png");
    expect(existsSync(dist)).toStrictEqual(true);
    dist = resolve(options.distRoot!, "./service/images/favicon.png");
    expect(existsSync(dist)).toStrictEqual(true);
    //      打包js验证
    dist = resolve(options.distRoot!, "./index.js");
    expect(existsSync(dist)).toStrictEqual(true);
    content = readFileSync(dist, "utf-8").split("\n");
    expect(content.length).toStrictEqual(21);
    expect(content[0]).toStrictEqual('var coreHtml = "/core/views/core.html?_snv=xxxxxxxxxxxxxxxx1235";');
    expect(content[1]).toStrictEqual('');
    expect(content[2]).toStrictEqual('var coreImages = "/core/images/favicon.png?_snv=xxxxxxxxxxxxxxxx1235";');
    expect(content[3]).toStrictEqual('');
    expect(content[4]).toStrictEqual('var serviceHtml = "/service/views/service.html?_snv=xxxxxxxxxxxxxxxx1235";');
    expect(content[5]).toStrictEqual('');
    expect(content[6]).toStrictEqual('var serviceImages = "/service/images/favicon.png?_snv=xxxxxxxxxxxxxxxx1235";');
    expect(content[7]).toStrictEqual('');
    expect(content[8]).toStrictEqual('var netHtml = "http://www.baidu.com/index.html?_snv=xxxxxxxxxxxxxxxx1235";');
    expect(content[9]).toStrictEqual('');
    expect(content[10]).toStrictEqual('var netHtml2 = "/index.html?_snv=xxxxxxxxxxxxxxxx1235";');
});

test("srcRoot-not-in-componentRoot", async () => {
    let components: RollupOptions[] = builder.build([
        {
            src: "./core/core.ts",
            format: "es",
            assets: [
                "service/images/asset.png",
            ]
        },
    ]);
    /**
     * 这里有个bug，asset的时候，没有验证是否基于component.root目录，非component.root目录下的文件不应该能够copy过去
     *  先保持现状，后续看情况做处理；由于asset支持_SITEROOT_ 这类跨目录操作，copy数据也有此问题
     */
    let ret = await rollup(components[0]);
    await ret.write(components[0].output as OutputOptions);
    let distPng = resolve(options.distRoot!, "service/images/asset.png");
    expect(existsSync(distPng)).toStrictEqual(true);
    //  core.ts内部引入了service下的html，验证不存在，但已经生成了url
    let distHtml = resolve(options.distRoot!, "./service/views/service.html");
    expect(existsSync(distHtml)).toStrictEqual(false);
    let content = readFileSync(resolve(options.distRoot!, "./core/core.js"), "utf-8").split("\n");
    expect(content[0].startsWith('var sx = "/service/views/service.html?_snv=')).toStrictEqual(true);
});

//  错误情况和覆盖率补充测试
test("error-coverage", async () => {

    //  "../test/asset.test.ts"已经不在srcRoot目录下，会报错
    let com: ComponentOptions = {
        src: "./core/core.ts",
        format: "es",
        assets: [
            "../test/rollup-asset.test.ts",
        ]
    };
    expect(() => builder.build([com])).toThrowError(/components\[0]\.assets\[0] invalid: src must be child of srcRoot\. /);
    //  import时的错误输出
    let components = builder.build([{
        src: "./core/error.ts",
        format: "es",
    }]);
    await expect(rollup(components[0])).rejects.toThrowError('process.exit unexpectedly called with "0"');
    expect(ruleMessage).toContain("import file must be child of srcRoot: cannot analysis url of outside file.");
    expect(ruleMessage).toContain("source:       ../../asset.png");

    components = builder.build([{
        src: "./error.ts",
        format: "es",
    }]);
    await expect(rollup(components[0])).rejects.toThrowError('process.exit unexpectedly called with "0"');
    expect(ruleMessage).toContain("source:       vue/x.png");
});