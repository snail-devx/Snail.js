/**
 * 起始、终止端点插件测试，看看是否拦截掉异常模块使用
 */

import { existsSync, rmSync } from "fs";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { Builder, BuilderOptions, FLAG } from "../src";
import { resolve } from "path";
import { OutputOptions, rollup } from "rollup";

//#region 测试前的准备工作
const options: BuilderOptions = {
    root: __dirname,
    srcRoot: resolve(__dirname, 'web'),
    distRoot: resolve(__dirname, 'dist'),
    commonLib: []
}
const builder = Builder.getBuilder(options, (component, context, options) => {
    return null!;
});
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

async function tmpFunc(src: string, rule: string, source: string, other?: string | undefined) {
    let components = builder.build([
        { src: src, format: "es" }
    ]);
    await expect(rollup(components[0])).rejects.toThrowError('process.exit unexpectedly called with "0"');
    expect(ruleMessage).toContain(rule);
    expect(ruleMessage).toContain(source);
    other && expect(ruleMessage).toContain(other);
}

// 动态注入模块
test("DMI:", async () => {
    await tmpFunc("point/dmi-import.ts",
        'error rule:   please use "snail.rollup-inject" to resolve dynamic module.',
        'source:       DMI:test-xxxx',
        'suggestion:   use registerDynamicModule method to register before use it.'
    );
});
//  url相关
describe("url-module", async () => {
    test("?url-net", async () => {
        await tmpFunc("point/url-import.ts",
            'error rule:   please use "snail.rollup-url" to resolve url module.',
            'source:       /xxx?url'
        );
    });
    test("?url-src", async () => {
        await tmpFunc("point/url-import2.ts",
            'error rule:   please use "snail.rollup-url" to resolve url module.',
            'source:       ./url-import?url'
        );
    });
    test("url:", async () => {
        await tmpFunc("point/url-import3.ts",
            'error rule:   please use "snail.rollup-url" to load url module.',
            'source:       URL:/jhxxxxx/.js'
        );
    });
    test("url_version:", async () => {
        await tmpFunc("point/url-import4.ts",
            'error rule:   please use "snail.rollup-url" to load url module.',
            'source:       URL_VERSION:/jhxxxxx/.js'
        );
    });
});
//  脚本、样式文件
describe("script-style", async () => {
    test("script-import:", async () => {
        await tmpFunc("point/script-import.ts",
            'error rule:   please use "snail.rollup-script" to resolve script file.',
            'source:       /x/v.js'
        );
    });
    test("style-import:", async () => {
        await tmpFunc("point/style-import.ts",
            'error rule:   please use "snail.rollup-style" to resolve style file.',
            'source:       /xx/xxx/d.css'
        );
    });
});
//  资产、视图
describe("asset-view", async () => {
    test("asset-import:", async () => {
        await tmpFunc("point/asset-import.ts",
            'error rule:   please use "snail.rollup-asset" to resolve asset file.',
            'source:       /xxx/x.png'
        );
    });
    test("asset-component", async () => {
        let components = builder.build([
            {
                src: "point/empty.ts", format: "es",
                assets: [
                    "point/asset-import.ts"
                ]
            }
        ]);
        let ret = await rollup(components[0]);
        await expect(ret.write(components[0].output as OutputOptions)).rejects
            .toThrowError('process.exit unexpectedly called with "0"');
        expect(ruleMessage).toContain('error rule:   please use "snail.rollup-asset" to write asset file.');
        expect(ruleMessage).toContain('source:       point/asset-import.ts');
    });
    test("view-component", async () => {
        let components = builder.build([
            {
                src: "point/empty.ts", format: "es",
                views: [
                    "point/asset-import.ts"
                ]
            }
        ]);
        let ret = await rollup(components[0]);
        await expect(ret.write(components[0].output as OutputOptions)).rejects
            .toThrowError('process.exit unexpectedly called with "0"');
        expect(ruleMessage).toContain('error rule:   please use "snail.rollup-html" to write view file.');
        expect(ruleMessage).toContain('source:       point/asset-import.ts');
    });
});

//  覆盖率测试，不在这里单独写了，直接基于style等插件中做了即可