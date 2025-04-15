
//  后期考虑直接读取 package.json
const external = [/node_modules/, "snail.core"];

/**
 * 打包的组件配置
 * @type {import("rollup").RollupOptions}
 */
export default [
    {
        input: "./src/builder.ts",
        output: [//  Valid values are "amd", "cjs", "system", "es", "iife" or "umd".
            { file: "./dist/builder.js", format: "es" },
        ],
        external
    },
    {
        input: "./src/plugin.ts",
        output: [//  Valid values are "amd", "cjs", "system", "es", "iife" or "umd".
            { file: "./dist/plugin.js", format: "es" },
        ],
        external
    }
];