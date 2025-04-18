import { describe, expect, test } from 'vitest'

import { Builder, helper } from "../../packages/snail.rollup/src/index";
import assetPlugin from "../../packages/snail.rollup-asset/src/index";
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { BuilderOptions, CommonLibOptions, IRollupBuilder } from '../../packages/snail.rollup/src/models/builder';
import { ComponentOptions } from '../../packages/snail.rollup/src/models/component';

import { rollup } from "rollup";
import { existsSync, rmSync } from 'fs';

describe('rollup-asset', async () => {
    const options = Builder.getDefaultOptions(resolve(__dirname));
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