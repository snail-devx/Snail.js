import { describe, expect, test } from 'vitest'
import { rollup } from "rollup";
import { existsSync, rmSync } from 'fs';
import assetPlugin from "../src/index";
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
//  snail.rollup 采用源码引用方式，方便错误调试；整体测试完成后，再换成包形式
// import { Builder, helper } from "snail.rollup";
import { BuilderOptions, CommonLibOptions, IRollupBuilder } from "../../snail.rollup/src/index"
import { ComponentOptions } from '../../snail.rollup/src/index';
import { Builder, helper } from "../../snail.rollup/src/index";

describe('rollup-asset', async () => {
    const options: BuilderOptions = {
        root: __dirname,
        srcRoot: resolve(__dirname, "web"),
        siteRoot: resolve(__dirname, "dist"),
        distRoot: resolve(__dirname, "dist"),
    };
    const builder = Builder.getBuilder(options, (component, context, options) => {
        return [
            assetPlugin(component, context, options)
        ]
    });

    test("default", async () => {
        const dist = helper.buildDist(options, resolve(options.srcRoot!, "core/images/favicon.png"));
        existsSync(dist) && rmSync(dist);
        const rollupOptions = builder.build([
            { src: "emtpy.ts", assets: ["core/images/favicon.png"] }
        ])[0];
        const result = await rollup(rollupOptions);
        // 执行完成后，需要能够找到图片
        expect(existsSync(dist)).toBeTruthy();

    });
});