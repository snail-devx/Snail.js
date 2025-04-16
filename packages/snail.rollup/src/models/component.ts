import { InputPluginOption } from "rollup"
import { BuilderOptions, CommonLibOptions } from "./builder";

/**
 * 构建组件的配置选项
 * - 描述组件打包源、目标相关信息
 */
export type ComponentOptions = {
    /**
     * 【必填】js组件源文件
     * - 组件输出路径基于此分析：求相对srcRoot的路径，然后映射到distRoot目录下
     * - 内部引用的文件资源，自动基于此求相对路径，然后映射到输出路径下，并求URL
     * - 取值约束：绝对地址，或者相对srcRoot的路径；组件root目录下的文件
     */
    src: string;
    /**
     * 【必填】组件打包文件格式
     * - 默认umd模式
     */
    format?: "amd" | "cjs" | "es" | "iife" | "system" | "umd";
    /**
     * 组件打包时的全局变量名
     * - 可通过此名访问组件提供的方法属性等
     * - 仅在打包支持script标签挂载方式时生效，且format为iife/umd
     * - 组件isCommonLib为true时，强制必须有值
     */
    name?: string;

    /**
     * 组件附带的资产文件
     * - 自动将这些资产文件原样结构拷贝的组件输出路径下
     * - 资产文件不做任何操作，仅进行内容copy
     * - 取值约束：数组，元素为string时自动映射为资源src
     */
    assets?: Array<AssetOptions | string>;
    /**
     * 组件绑定的视图html文件
     * - 自动将组件依赖的commonLib、css等文件注入到视图中
     * - 将视图文件从源拷贝到指定的目标下
     * - 取值约束：数组，元素为String时自动映射为资源src
     */
    views?: Array<ViewOptions | string>;

    /**
     * 是否是公共js库
     * - 为公共js库时，将可以被其他js组件引入
     * - 默认false；为true时format推荐umd/amd/iife；为true时，name值需指定，否则无效
     * - 无特殊情况，推荐为true，方便js组件复用
     */
    isCommonLib?: boolean;
    /**
     * 组件依赖的通用js库
     * - 当前组件import的这些js不会被rollup合并导包，而是作为独立三方依赖库存在
     * - rollup打包时，会将所有可用的commonLib合并到此属性上。顺序：组件commonLib、全局commonLib
     */
    commonLib?: Array<CommonLibOptions>;
    /**
     * 组件使用通用js库时强制url地址
     * - rollup打包时，会分析公共库js，重新生成相对于当前组件js的路径
     * - 此值为true时，会强制使用commonLib指定的url地址；
     * - 解决某些amd库无法进行相对路径依赖加载的问题
     */
    commonLibForceUrl?: boolean;

    /**
     * 组件root目录
     * - 打包时分析组件import资源，若非当前路径下的，则判定为三方公共资源；当前路径下的组件，做拷贝处理
     * - 取值约束：绝对地址，或者相对srcRoot的路径；srcRoot的子目录
     * - 若未传入，则直接使用组件src目录
     */
    root?: string;

    /**
     * 是否生成sourceMap
     * - 默认false
     * - 为true时，js和css同步生成sourcemap
     */
    sourceMap?: boolean;

    /**
     * 配合name使用；
     * - 默认值：name有值时强制true；则默认false
     * - 可避免name被全局重写
     * - - 为true时，this.snail = this.snail || {}
     * - - 为false|undefined时，this.snail={}
     */
    extend?: boolean;
    /**
     * 用于指定导出模式
     * - 可选取值
     * - - default 适用于只使用 export default ... 的情况
     * - - named   适用于导出超过一个模块的情况
     * - - none    适用于没有导出的情况（比如，当你在构建应用而非库时）
     * - - auto    指根据 input 模块导出推测你的意图
     * - 默认值：named
     */
    exports?: "default" | "named" | "auto" | "none";

    /**
     * 打包前，在源文件顶部的插入的字符串；然后再进行format格式打包输出
     */
    intro?: string;
    /**
     * 打包前，在源文件底部的插入的字符串；然后再进行format格式打包输出
     */
    outro?: string;
    /**
     * 打包后，在format格式打包输出文件顶部的插入的字符串
     */
    banner?: string;
    /**
     * 打包后，在format格式打包输出文件底部的插入的字符串
     */
    footer?: string;

    /**
     * js组件初始化方法
     * - 在rollupbuilder环境初始化加载完成后，调用此方法，完成js组件自身的一些环境依赖信息初始化
     * - 调用前component数据已检测好、并做了默认值构建，请谨慎修改组件值，避免影响功能
     * @param options 构建器全局配置
     */
    init?: (component: ComponentOptions, options: BuilderOptions) => void;

    /**
     * 【忽略】js组件输出路径
     * - 内部会自动根据src分析构建；外部写入值无效
     * - 放到这里单纯是为了智能提示
     */
    dist?: string;
    /**
     * 【忽略】js组件在siteRoot下的网络路径
     *  - 内部自动分析构建；外部写入值无效
     *  - 放到这里单纯是为了智能提示
     */
    url?: string;
}
/**
 * 资源配置选项
 */
export type AssetOptions = {
    /**
     * 【必填】源文件路径
     * - 组件打包依赖的资源：这些资源会做强制自动拷贝
     * - 取值约束：绝对地址，或者相对srcRoot的路径；需在srcRoot目录下
     */
    src: string;
    /**
     * 【选填】资源输出路径；
     * - 无特殊传null即可，内部自动基于src和组件src分析映射
     * - 取值约束：绝对地址，或者相对distRoot的路径；需要在siteRoot目录下
     * - 填写固定值"\_SITEROOT_"；表示输出到站点根路径下，如做站点首页使用的html文件
     */
    dist: string;

    /** 
     * 是否已经写入过了 
     */
    writed?: boolean;
}

/**
 * 视图资源配置选项
 */
export type ViewOptions = AssetOptions & {
    /**
     * 句柄：用于外部再次处理视图html文件内容
     * @param options 打包全局配置
     * @param src 视图源文件地址
     * @param content 视图html文件内容
     * @returns 处理完的html文件内容
     */
    handle?: (options: BuilderOptions, src: string, content: string) => string;
}

/** 
 * 组件上下文，用于组件打包各处共享一些数据
 */
export type ComponentContext = {
    /**
     * 组件打包过程中分析出来的依赖资源；如图片，这些自动copy到输出目录
     */
    assets: AssetOptions[];

    /**
     * 组件打包过程中依赖的commonLib字典
     * - key为模块id；value为对应的commonLib配置
     * - 配合rollup的globals属性使用，方便一键得到全局依赖
     */
    globals: Map<string, CommonLibOptions>;

    /**
     * 组件上下文的缓存字典
     * - 插件可以使用此缓存，避免重复分析计算
     */
    caches: Map<string, any>;
}

/**
 * 组件的插件构建器
 * - 在打包时，执行此方法，构建组件打包所需插件
 * - 执行时传递参数
 * - - component：当前组件的配置信息
 * - - context：组件上下文，用于组件打包各处共享一些数据
 * - - options：打包全局配置
 * - 返回值：rollup插件数组
 */
export type PluginBuilder = (component: ComponentOptions, context: ComponentContext, options: BuilderOptions) => InputPluginOption[];