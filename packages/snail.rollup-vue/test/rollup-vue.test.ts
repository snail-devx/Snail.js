import { describe, expect, test } from 'vitest'
import assetPlugin from "../src/index";
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
//  snail.rollup 采用源码引用方式，方便错误调试；整体测试完成后，再换成包形式
// import { Builder, helper } from "snail.rollup";
import { BuilderOptions, CommonLibOptions, IRollupBuilder } from "../../snail.rollup/src/index"
import { ComponentOptions } from '../../snail.rollup/src/index';
import { Builder, helper } from "../../snail.rollup/src/index";

import { rollup } from "rollup";
import { existsSync, rmSync } from 'fs';

import scriptPlugin from "snail.rollup-script";
import vuePlugin from "../src/index"

describe('rollup-vue', async () => {
    const options: BuilderOptions = {
        root: __dirname,
        srcRoot: resolve(__dirname, 'web'),
        commonLib: [
            { id: 'vue', name: 'Vue', url: 'https://cdn.jsdelivr.net/npm/vue@2.6.11/dist/vue.min.js' }
        ]
    }
    const builder = Builder.getBuilder(options, (component, context, options) => {
        return [
            scriptPlugin(component, context, options),
            vuePlugin(component, context, options),
        ]
    });

    test("default", async () => {
        const rollupOptions = builder.build([
            { src: "index.js" }
        ])[0];
        const result = await rollup(rollupOptions);
        //  @ts-ignore
        await result.write(rollupOptions.output!);
    });
});