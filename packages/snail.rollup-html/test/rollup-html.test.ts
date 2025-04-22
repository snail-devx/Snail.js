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

import htmlPlugin from "../src/index"
import { buildDist } from '../../snail.rollup/src/utils/helper';
import { url, version } from 'snail.core';

//#region 测试前的准备工作
const options: BuilderOptions = { root: __dirname, srcRoot: resolve(__dirname, 'web'), distRoot: resolve(__dirname, 'dist') };
const builder = Builder.getBuilder(options, (component, context, options) => {
    const injectScript = `
    <script scr="${version.formart(component.url!)}"></script>
    `;
    return [htmlPlugin(component, context, options, injectScript)];
});
const htmlDist = resolve(options.distRoot!, "./views/index.html");
beforeEach(() => {
    existsSync(options.distRoot!) && rmSync(options.distRoot!, { recursive: true });
});
afterEach(() => {
    existsSync(options.distRoot!) && rmSync(options.distRoot!, { recursive: true });
});
//#endregion

test("default", async () => {
    const components: RollupOptions[] = builder.build([
        {
            src: "html.ts",
            format: "es",
            views: [
                {
                    src: "./views/index.html",
                    dist: htmlDist,
                    handle(options, src, content) {
                        return content;
                    },
                }
            ]
        },
    ]);
    let ret = await rollup(components[0]);
    await ret.write(components[0].output as OutputOptions);
    const content = readFileSync(htmlDist, "utf-8").split("\n");
    expect(content[0].trim()).toStrictEqual('<html>');
    expect(content[1].trim()).toStrictEqual('');
    expect(content[2].trim()).toStrictEqual('<body>');
    expect(content[3].trim()).toStrictEqual('');
    expect(content[4].trim().startsWith('<script scr="/html.js?_snv=')).toStrictEqual(true);
    expect(content[5].trim()).toStrictEqual('');
    expect(content[6].trim()).toStrictEqual('</body>');
    expect(content[7].trim()).toStrictEqual('');
    expect(content[8].trim()).toStrictEqual('</html>');
});