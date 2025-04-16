/**
 * 打包的组件配置
 * @type {import("rollup").RollupOptions}
 */
export default [
    {
        input: "./src/snail.vue.ts",
        output: [//  Valid values are "amd", "cjs", "system", "es", "iife" or "umd".
            { file: "./dist/snail.vue.ts", format: "es" },
        ],
    },
];