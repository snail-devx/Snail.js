/** 是否启用babel转码 */
export const START_BabelPlugin = true;
/** 禁用默认external，引用的三方包代码一并合并打包 */
export const DISABLE_DefaultExternal = false;

/**
 * 打包的组件配置
 * @type {import("rollup").RollupOptions}
 */
export default [
    {
        input: "./src/snail.core.ts",
        output: [//  Valid values are "amd", "cjs", "system", "es", "iife" or "umd".
            { file: "./dist/snail.core.js", format: "es", name: "snail", },
            { file: "./dist/snail.core.umd.js", format: "umd", name: "snail", }
        ],
    }
];