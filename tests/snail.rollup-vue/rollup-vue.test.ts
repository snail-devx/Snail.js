import { describe, expect, test } from 'vitest'

import { Builder, helper } from "../../packages/snail.rollup/src/index";
import assetPlugin from "../../packages/snail.rollup-asset/src/index";
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { BuilderOptions, CommonLibOptions, IRollupBuilder } from '../../packages/snail.rollup/src/models/builder';
import { ComponentOptions } from '../../packages/snail.rollup/src/models/component';

import { rollup } from "rollup";
import { existsSync, rmSync } from 'fs';

describe('rollup-vue', async () => {
    const options = Builder.getDefaultOptions(resolve(__dirname));
    const builder = Builder.getBuilder(options, (component, context, options) => {
        return []
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