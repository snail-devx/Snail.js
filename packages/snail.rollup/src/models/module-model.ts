/**
 * 打包相关模块配置选项
 * - 打包模块，import引入模块相关信息
 */
export type ModuleOptions = {
    /**
     * 模块类型
     */
    type: ModuleType;
    /**
     * 模块id
     * - src时，为绝对路径地址
     * - net时，为网络绝对路径
     * - npm时，保持原样
     */
    id: string;
    /**
     * 模块来源；会对一些特殊模块引入，如url等做解析处理
     */
    src: string;

    /**
     * 模块文件扩展名
     */
    ext?: string;

    /**
     * 模块src上分析出来的查询条件
     * - 如url、raw等
     */
    query?: { [key: string]: string };
}
/**
 * 模块类型
 *  - net：网络url
 *  - src：项目源码
 *  - npm：node_modules目录下npm包
 */
export type ModuleType = "net" | "src" | "npm";

/**
 * 模块转码编译结果
 */
export type ModuleTransformResult = {
    /**
     * 编译后的代码
     */
    code: string;
    /**
     * sourcemap
     * - 不同地方情况不一样，先any表示
     */
    map: any | void;
    /**
     * 依赖哪些其他文件
     * - 如style中@import的文件。
     */
    dependencies?: string[];
}