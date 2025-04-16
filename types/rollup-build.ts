import { RollupOptions } from "rollup"

/**
 * roolup打包导出配置
 */
export type RollupBuildOptions = {

    /**
     * 是否禁用默认的external
     * - 默认为false
     * - 为true时，为rollup打包配置自动追加内置external（/node_modules/）
     * - 解决某些项目需要将 node_modules 中包代码合并打包输出的需求
     */
    DISABLE_DefaultExternal?: boolean,
    /**
     * 是否启用Babel插件
     * - 默认为false
     * - 为true时，为rollup打包配置自动追加内置Babel插件
     * - 解决某些项目针对nodejs环境，无需Babel做垫片编译的需求
     */
    START_BabelPlugin?: boolean,

    /**
     * 打包配置选项
     */
    default: RollupOptions[],

}