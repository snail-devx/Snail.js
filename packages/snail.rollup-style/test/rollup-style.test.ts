import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test } from 'vitest'
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { OutputOptions, rollup, RollupOptions } from "rollup";
import { existsSync, readFileSync, rmSync } from 'fs';
//  snail.rollup 采用源码引用方式，方便错误调试；整体测试完成后，再换成包形式
import { BuilderOptions, CommonLibOptions, IRollupBuilder } from "../../snail.rollup/src/index"
import { Builder } from "../../snail.rollup/src/index";

import stylePlugin, { buildAddLinkCode } from "../src/index"
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
    stylePlugin(component, context, options),
    urlPlugin(component, context, options),
    assetPlugin(component, context, options),
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

//  默认情况测试：测试无报错的less、css在ts中引入，样式中url，@import引入
test("default", async () => {
    let components = builder.build([
        { src: "./core/core.ts", format: "es" }
    ]);
    let ret = await rollup(components[0]);
    await ret.write(components[0].output as OutputOptions);
    //  验证结果
    const dist = resolve(options.distRoot!, "./core/core.js")
    expect(existsSync(dist)).toStrictEqual(true);
    let content = readFileSync(dist, "utf-8").split("\n");
    expect(content.length).toStrictEqual(13);
    expect(content[0].startsWith('var styleUrl = "/core/styles/c2.css?_snv=')).toStrictEqual(true);
    expect(content[1]).toStrictEqual("");
    expect(content[2].startsWith('var netStyle = "/app/styles.less?ADDLINK=&_snv=')).toStrictEqual(true);
    expect(content[3]).toStrictEqual("");
    expect(content[4].startsWith('var outStyle1 = "/outer/styles/1.css?_snv=')).toStrictEqual(true);
    expect(content[5]).toStrictEqual("");
    expect(content[6].startsWith('var outStyle2 = "/outer/styles/2.css?_snv=')).toStrictEqual(true);
    expect(content[7]).toStrictEqual("");
    expect(content[8].trim()).toStrictEqual("console.log(styleUrl);");
    expect(content[9].trim()).toStrictEqual("console.log(netStyle);");
    expect(content[10].trim()).toStrictEqual("console.log(outStyle1);");
    expect(content[11].trim()).toStrictEqual("console.log(outStyle2);");
    expect(content[12]).toStrictEqual("");
    //      css编译输出结果验证：验证关键行即可
    let styleDist = resolve(options.distRoot!, "./core/styles/c1.css");
    expect(existsSync(styleDist)).toStrictEqual(true);
    content = readFileSync(styleDist, "utf-8").split("\n");
    expect(content.length).toStrictEqual(10);
    expect(content[0]).toStrictEqual("body {")
    expect(content[3]).toStrictEqual("body #id {")
    expect(content[4]).toContain("  background-image: url(/core/images/asset.png?_snv");
    expect(content[7]).toContain("background-image: url(/asset.png?_snv=");
    styleDist = resolve(options.distRoot!, "./core/styles/c2.css");
    expect(existsSync(styleDist)).toStrictEqual(true);
    content = readFileSync(styleDist, "utf-8").split("\n");
    expect(content.length).toStrictEqual(3);
    expect(content[1]).toContain("background-image: url(/outer/images/asset.png?_snv=");
    styleDist = resolve(options.distRoot!, "./core/styles/i.css");
    expect(existsSync(styleDist)).toStrictEqual(false);
    //      依赖导入验证
    let imageDist = resolve(options.distRoot!, "./core/images/asset.png");
    expect(existsSync(imageDist)).toStrictEqual(true);
    imageDist = resolve(options.distRoot!, "../outer/images/asset.png");
    expect(existsSync(imageDist)).toStrictEqual(false);
    imageDist = resolve(options.distRoot!, "./asset.png");
    expect(existsSync(imageDist)).toStrictEqual(false);
    //      引入srcRoot下，componentRoot外的src样式
    let outDist = resolve(options.distRoot!, "./outer/styles/1.css");
    expect(existsSync(outDist)).toStrictEqual(false);
    outDist = resolve(options.distRoot!, "./outer/styles/2.css");
    expect(existsSync(imageDist)).toStrictEqual(false);
});

//  测试错误导入情况；导入规则错误
test("error-rule", async () => {
    //  ts中引入srcRoot外的less
    let components = builder.build([
        { src: "./outer/outer-src.ts", format: "es" }
    ]);
    await expect(rollup(components[0])).rejects.toThrowError('process.exit unexpectedly called with "0"');
    expect(ruleMessage).toContain("import file must be child of srcRoot: cannot analysis url of outside file.");
    expect(ruleMessage).toContain("source:       ../../root.less");
    //  引入npm下的样式：强制报错，如果需要，则应该在less等预编译样式文件中通过@import引入
    components = builder.build([
        { src: "./outer/outer-npm.ts", format: "es" }
    ]);
    await expect(rollup(components[0])).rejects.toThrowError('process.exit unexpectedly called with "0"');
    expect(ruleMessage).toContain("resolve style failed: not support module.type value. type:npm.");
    expect(ruleMessage).toContain("source:       vue/less.css");
    //  测试less中的url、@import错误；覆盖StyleProcessor部分逻辑
    components = builder.build([
        { src: "./outer/processor-import.ts", format: "es" }
    ]);
    await expect(rollup(components[0])).rejects.toThrowError('process.exit unexpectedly called with "0"');
    expect(ruleMessage).toContain("import style file must be child of componentRoot when it is child of srcRoot.");
    expect(ruleMessage).toContain("/test/web/outer/styles/import-core.less");
    //  测试url引入image的错误情况
    components = builder.build([
        { src: "./outer/processor-image.ts", format: "es" }
    ]);
    await expect(rollup(components[0])).rejects.toThrowError('process.exit unexpectedly called with "0"');

    components = builder.build([
        { src: "./outer/processor-no-src.ts", format: "es" }
    ]);
    await expect(rollup(components[0])).rejects.toThrowError('process.exit unexpectedly called with "0"');;

});
//  代码覆盖率补充测试
test("coverage", async () => {
    //  测试满足，暂时不报错即可
    let components = builder.build([
        { src: "./coverage.ts", format: "es", sourceMap: true }
    ]);
    let ret = await rollup(components[0]);
    await ret.write(components[0].output as OutputOptions);
    //  测试net和base64位图片引入；不报错即可
    components = builder.build([
        { src: "./outer/processor-net.ts", format: "es" }
    ]);
    await rollup(components[0]);

    //  测试buildAddLinkCode方法
    expect(buildAddLinkCode("")).toStrictEqual(undefined);
    let content = buildAddLinkCode("/app.css").split("\n");
    expect(content.length).toStrictEqual(2);
    expect(content[0].trim()).toStrictEqual(`import addLink from "DMI:SNAIL_ADD_LINK";`);
    expect(content[1].trim()).toStrictEqual(`addLink("/app.css");`);

    //  测试生产环境；不报错就算过了，后期再完善
    process.env.NODE_ENV = "production";
    let tmpBuilder = Builder.getBuilder(options, (component, context, options) => [
        stylePlugin(component, context, options),
        urlPlugin(component, context, options),
        assetPlugin(component, context, options),
    ]);
    delete process.env.NODE_ENV;
    components = tmpBuilder.build([
        { src: "./coverage.ts", format: "es", sourceMap: true }
    ]);
    ret = await rollup(components[0]);
    await ret.write(components[0].output as OutputOptions);
});