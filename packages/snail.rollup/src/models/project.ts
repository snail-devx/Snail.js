import { ComponentOptions } from "./component";

/**
 * 项目打包配置
 */
export type ProjectOptions = {
    /**
     * 当前项目要打包的js组件集合
     */
    components: ComponentOptions[],

    /**
     * 项目依赖项
     * - 依赖的其他项目文件绝对路径；或相对项目根路径
     * - 打包时分析项目下的commonLib组件，作为当前项目下所有components的commonLib使用
     */
    projectDeps?: string[],
}