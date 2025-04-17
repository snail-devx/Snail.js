import { RollupOptions } from "rollup";
import { ComponentOptions } from "./component";

/**
 * 全局打包配置
 * - 约束项目src、dist、site目录等信息
 */
export type BuilderOptions = {
    /**
     * 【必填】项目根目录
     */
    root: string;

    /**
     * 所有js组件源文件路径
     * - 用于分析路径，实现组件源文件、目标输出同目录结构
     * - 取值约束：绝对地址，或相对项目根路径
     * - 不传则默认 root+src
     */
    srcRoot?: string;
    /**
     * 站点根目录
     * - 用于分析组件、资源在web站点中使用时的URL绝对路径
     * - 所有输出文件，必须在此目录下；否则会强制报错
     * - 取值约束：绝对地址，或相对项目根路径；不是srcRoot值、且不在srcRoot目录下
     * - 不传则默认 root+dist
     */
    siteRoot?: string;
    /**
     * 组件输出根目录
     * - srcRoot下组件源文件同目录结构输出到此目录下
     * - 结合siteRoot分析分析组件依赖资源路径URL绝对路径
     * - 取值约束：绝对地址，或相对项目根路径；在siteRoot下
     * - 不传则默认 root+dist
     */
    distRoot?: string;

    /**
     * 通用js库
     * - 这些js不会被rollup合并导包，而是作为独立三方依赖库存在
     */
    commonLib?: CommonLibOptions[];

    /**
     * css样式块合并提取成文件时的目录
     * - 使用相对路径，相对组件打包src路径；默认 ./css
     * - 在提取js组件库中使用vue文件时，基于此合并vue组件style样式：./css/[componentFileName].vue.css
     */
    cssChunkFolder?: string;

    /**
     * 是否是生产环境
     * - 默认false
     */
    isProduction?: boolean;
}

/**
 * 公共js库配置：公共js作为rollup的external存在，不会打包到组件中
 */
export type CommonLibOptions = {
    /**
     * 【必填】库模块id；可用值：
     * - node_modules下的模块名，如vue
     * - 物理文件绝对路径地址；如src下的某个js作为公共库。此时使用path.resolve整理出绝对路径，否则影响打包结果
     * - 网络绝对路径地址：如"/snail/test/x.js"
     */
    id: string;
    /**
     * 【必填】类库全局变量名
     * - import此类库时的别名；打包时自动分析替换成此名称
     * -  - 如vue可换成Vue2，SVue等等
     * - 仅umd、iife等生效，es等情况无效下无效
     */
    name: string;
    /**
     * 【必填】类库文件URL地址
     * - 用于和html做绑定使用
     * - 若组件强制公共库使用url地址，则打包生成的js库依赖，也会使用此url地址
     */
    url: string;
}

/**
 * 接口：rollup构建器
 */
export interface IRollupBuilder {
    /**
     * 批量构建组件Rollup打包配置选项
     * @param components 组件对象数组
     * @param commonLib 公共js库；和component.commonLib做合并
     * @returns rollup打包配置数组
     */
    build(components: ComponentOptions[], commonLib?: CommonLibOptions[]): RollupOptions[];
    /**
     * 构建项目下的组件Rollup打包配置选项
     * - 自动分析项目下的打包组件信息
     * - 自动分析依赖的项目文件
     * @param projects 项目文件地址；绝对路径，或者向对BuilderOptions.root的向对路径
     * @returns rollup打包配置数组
     */
    buildProject(...projects: string[]): Promise<RollupOptions[]>;
    /**
     * 从命令行参数构建项目下的组件Rollup打包配置选项
     * - 自动从 --project 参数中分析要构建的项目的项目文件地址
     * - 内部执行 buildProject方法，完成实际项目打包配置构建
     * - 多个项目用空格分开；如 rollup --project ./.projects/common.js ./.projects/service.js
     * @returns rollup打包配置数组
     */
    buildFromCmd(): Promise<RollupOptions[]>;
}