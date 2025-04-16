export type Package = {
    /**
     * 包名称；package.json中的name字段
     */
    name: string,
    /**
     * 目录名称，仅包含自身
     */
    dir: string,

    /**
     * 包所在根目录
     */
    root: string,
    /**
     * src目录路径
     */
    srcRoot: string,
    /**
     * dist目录路径
     * 使用releaseRoot替换掉
     * distRoot: string,
     */
    /**
     * types目录路径
     */
    typesRoot: string,
    /**
     * 当前包的发布目录路径
     */
    releaseRoot: string,

    /**
     * package.json文件全路径
     */
    packageFile: string,
    /**
     * rollup.config.js文件全路径
     */
    rollupFile: string,
};