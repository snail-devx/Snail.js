/** 是否禁用默认的插件配置；配合工作空间根目录下的【rollup.config】使用 */
export const DISABLE_DefaultPlugins = false;

/**
 * 打包的组件配置
 * @type {import("rollup").RollupOptions}
 */
export default [
    {
        input: "./src/builder.ts",
        output: [//  Valid values are "amd", "cjs", "system", "es", "iife" or "umd".
            { file: "./dist/index.js", format: "es" },
        ],
    },
    {
        input: "./src/plugin.ts",
        output: [//  Valid values are "amd", "cjs", "system", "es", "iife" or "umd".
            { file: "./dist/plugin.js", format: "es" },
        ],
    }
];