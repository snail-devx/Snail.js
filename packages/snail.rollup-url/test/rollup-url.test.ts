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

import urlPlugin, { buildUrlResolve } from "../src/index"
import { buildDist } from '../../snail.rollup/src/utils/helper';
import { version } from 'snail.core';

//#region 测试前的准备工作
const options: BuilderOptions = { root: __dirname, srcRoot: resolve(__dirname, 'web'), distRoot: resolve(__dirname, 'dist') };
const builder = Builder.getBuilder(options, (component, context, options) => [urlPlugin(component, context, options)]);
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

//  net测试
test("net", async () => {
    const components: RollupOptions[] = builder.build([
        { src: "net_pathurl.js", format: "es", },
        { src: "net_siteurl.js", format: "es" }
    ]);

    await expect(rollup(components[0])).rejects.toThrowError('process.exit unexpectedly called with "0"');
    expect(existsSync(buildDist(options, resolve(options.srcRoot!, "net_pathurl.js")))).toStrictEqual(false);
    expect(ruleMessage).toContain("resolve url failed: not support module.type value. type:net.")
    expect(ruleMessage).toContain("/app/xxx.js?url");

    await expect(rollup(components[1])).rejects.toThrowError('process.exit unexpectedly called with "0"');
    expect(existsSync(buildDist(options, resolve(options.srcRoot!, "net_siteurl.js")))).toStrictEqual(false);
    expect(ruleMessage).toContain("resolve url failed: not support module.type value. type:net.")
    expect(ruleMessage).toContain("http://www.baidu.com/app/xxx.js?url")
});
// npm测试
test("npm", async () => {
    const components: RollupOptions[] = builder.build([
        { src: "npm_url.js", format: "es", }
    ]);

    await expect(rollup(components[0])).rejects.toThrowError('process.exit unexpectedly called with "0"');
    expect(existsSync(buildDist(options, resolve(options.srcRoot!, "npm_url.js")))).toStrictEqual(false);
    expect(ruleMessage).toContain("resolve url failed: not support module.type value. type:npm.")
    expect(ruleMessage).toContain("xxx.js?url")
});
// src测试
test("src", async () => {
    const components: RollupOptions[] = builder.build([
        { src: "src_existsurl.js", format: "es", },
        { src: "src_invalidurl.js", format: "es", },
    ]);

    let ret = await rollup(components[0]);
    await ret.write(components[0].output as OutputOptions);
    const dist = buildDist(options, resolve(options.srcRoot!, "src_existsurl.js"));
    expect(existsSync(dist)).toStrictEqual(true);
    const content = readFileSync(dist, "utf-8").split("\n");
    expect(content.length == 7).toStrictEqual(true);
    expect(content[0] == 'var url5 = "/npm_url.js";')
    expect(content[1] == '')
    expect(content[2] == '//  @ts-ignore src 路径')
    expect(content[3] == 'const x5 = url5;')
    expect(content[4] == '')
    expect(content[5] == 'export { x5 };')
    expect(content[6] == '')

    await expect(rollup(components[1])).rejects
        .toThrowError('resolve module failed: src module not exists.');
});

//  测试增加版本号，本身不会家版本号，但通过自定义插件实现
test("buildUrlResolve", async () => {
    const components: RollupOptions[] = builder.build([
        { src: "version_url.js", format: "es", },
    ]);
    // @ts-ignore
    components[0].plugins!.push({
        name: "test",
        resolveId(source, importer) {
            if (source === "version-url") {
                return buildUrlResolve(source, true);
            }
        }
    });

    //  version采用默认配置
    let ret = await rollup(components[0]);
    await ret.write(components[0].output as OutputOptions);
    const dist = buildDist(options, resolve(options.srcRoot!, "version_url.js"));
    expect(existsSync(dist)).toStrictEqual(true);
    let content = readFileSync(dist, "utf-8").split("\n");
    expect(content.length == 6).toStrictEqual(true);
    expect(content[0].startsWith('var versUrl = "version-url?_snv=')).toStrictEqual(true);
    expect(content[1]).toStrictEqual('');
    expect(content[2]).toStrictEqual('const x1 = versUrl;');
    expect(content[3]).toStrictEqual('');
    expect(content[4]).toStrictEqual('export { x1 };');
    expect(content[5]).toStrictEqual('');

    //  version做干预
    existsSync(dist) && rmSync(dist);
    version.config({ query: "_snvt", version: "1234567" });
    ret = await rollup(components[0]);
    await ret.write(components[0].output as OutputOptions);
    content = readFileSync(dist, "utf-8").split("\n");
    expect(content.length == 6).toStrictEqual(true);
    expect(content[0]).toStrictEqual('var versUrl = "version-url?_snvt=1234567";');
    expect(content[1]).toStrictEqual('');
    expect(content[2]).toStrictEqual('const x1 = versUrl;');
    expect(content[3]).toStrictEqual('');
    expect(content[4]).toStrictEqual('export { x1 };');
    expect(content[5]).toStrictEqual('');
});

