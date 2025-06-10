/**
 * rollup工具类需要的类型文件
 */

/**
 * rollup配置选项的默认值
 */
export type RollupOptionsDefault = {
    /**
     * 是否支持TypeScript
     */
    supportTS: boolean,

    /**
     * 是否需要使用Babel进行转码
     */
    needBabel: boolean,

    /**
     * 是否需要使用外部依赖
     * - 为true时启用外部依赖，不会将外部依赖代码合并到打包文件中
     * - 为false时禁用外部依赖，将外部依赖代码合并到打包文件中
     */
    needExternal: boolean,
    /**
     * 忽略警告
     * - 只忽略特定警告，如 UNKNOWN_OPTION
     */
    ignoreWarning: boolean,
}