import { describe, expect, test } from 'vitest'

import assetPlugin from "../src/index";
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { BuilderOptions, CommonLibOptions, IRollupBuilder } from 'snail.rollup';
import { ComponentOptions } from 'snail.rollup';
import { Builder, helper } from "snail.rollup";

import { rollup } from "rollup";
import { existsSync, rmSync } from 'fs';

describe('rollup-vue', async () => {
    // const options = Builder.getDefaultOptions(resolve(__dirname));
    // options.srcRoot = resolve(__dirname);
    // const builder = Builder.getBuilder(options, (component, context, options) => {
    //     return []
    // });

    // test("default", async () => {
    //     const rollupOptions = builder.build([
    //         { src: "index.js" }
    //     ])[0];
    //     const result = await rollup(rollupOptions);
    //     //  @ts-ignore
    //     await result.write(rollupOptions.output!);
    // });
});