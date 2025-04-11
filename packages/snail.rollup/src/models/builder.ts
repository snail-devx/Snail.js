/**
 * 全局打包配置
 * - 约束项目src、dist、site目录等信息
 */
export type BuilderOptions = {
    /**
     * 【必填】所有js组件源文件路径
     * - 用于分析路径，实现组件源文件、目标输出同目录结构
     * - 取值约束：绝对地址，或相对项目根路径
     */
    srcRoot: string;
    /**
     * 【必填】站点根目录
     * - 用于分析组件、资源在web站点中使用时的URL绝对路径
     * - 所有输出文件，必须在此目录下；否则会强制报错
     * - 取值约束：绝对地址，或相对项目根路径；不是srcRoot值、且不在srcRoot目录下
     */
    siteRoot: string;
    /**
     * 【必填】组件输出根目录
     * - srcRoot下组件源文件同目录结构输出到此目录下
     * - 结合siteRoot分析分析组件依赖资源路径URL绝对路径
     * - 取值约束：绝对地址，或相对项目根路径；在siteRoot下（直接输出到站点根目录下结构不好）
     */
    distRoot: string;

    /**
     * 通用js库
     * - 这些js不会被rollup合并导包，而是作为独立三方依赖库存在
     */
    commonLib?: CommonLibOptions[];

    /**
     * css样式块合并提取成文件时的目录
     * - 使用相对路径，相对组件打包src路径；默认 ./css
     * - 在提取js组件库中使用vue文件时，基于此合并vue组件style样式：./css/[componentFileName].Vue.css
     */
    cssChunkFolder?: string;

    /**
     * 是否是生产环境
     * - 默认false
     */
    isProduction?: string;
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

}