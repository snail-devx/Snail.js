/** 是否禁用默认的插件配置；配合工作空间根目录下的【rollup.config】使用 */
export const DISABLE_DefaultPlugins = false;

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