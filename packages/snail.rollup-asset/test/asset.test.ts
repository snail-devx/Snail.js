import { describe, expect, test } from 'vitest'
import { rollup } from "rollup";
import { existsSync, rmSync } from 'fs';
import assetPlugin from "../src/index";
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { BuilderOptions, CommonLibOptions, IRollupBuilder } from "snail.rollup"
import { ComponentOptions } from 'snail.rollup';
import { Builder, helper } from "snail.rollup";

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