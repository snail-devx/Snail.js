import { IScope } from "../../base/models/scope-model";
import { IVersionManager } from "./version-model";

/**
 * 接口：脚本管理器
 */
export interface IScriptManager {
    /**
     * 注册脚本
     * - 重复注册同一脚本，报错
     * @param files 脚本文件数组（为string时为脚本url，脚本id则转小写）
     * @returns 脚本句柄，支持对注册的脚本做销毁等操作
     */
    register(...files: (string | ScriptFile)[]): IScope;
    /**
     * 指定脚本是否已注册
     * - id（去除锚点）未注册，则id作为脚本url构建脚本Id（转小写）再次判断
     * @param id 脚本id；传入模块名（如：vue），或者脚本url地址（如：/xx/xhs/test.js）
     * @param referUrl 参照url地址。当id为脚本url为相对路径时，基于referUrl分析具体的绝对路径
     * @returns 存在返回true；否则false
     */
    has(id: string, referUrl?: string): boolean;

    /**
     * 加载指定脚本：获取脚本内容并执行，返回export对象信息
     * - 若id（去除锚点）未注册，则id作为脚本url地址就地注册脚本（id为url转小写）
     * - 若当前scope未注册此脚本，则尝试从全局的scipt执行加载
     * @param id 脚本id；传入模块名（如：vue），或者脚本url地址（如：/xx/xhs/test.js）
     * - id 支持锚点模式，逐级钻取export下的key信息，如 #components.dialog
     * - id 锚点支持批量，使用#号分隔，如 #components.dialog#components.follow#components.isFunction
     * @remarks 若脚本依赖其他脚本，依赖脚本在当前scope未注册，则会从global中查找
     * @param loadOptions 脚本加载的配置选项
     * @returns 解析后的脚本对象
     */
    load<T>(id: string, loadOptions?: Partial<ScriptLoadOptions>): Promise<T>;
    /**
     * 批量加载脚本：获取脚本内容并执行，返回export对象信息
     * - 若id（去除锚点）未注册，则id作为脚本url地址就地注册脚本（id为url转小写）
     * - 若当前scope未注册此脚本，则尝试从全局的scipt执行加载
     * @param ids 脚本id集合：传入模块名（如：vue），或者脚本url地址（如：/xx/xhs/test.js）
     * - id 支持锚点模式，逐级钻取export下的key信息，如 #components.dialog
     * - id 锚点支持批量，使用#号分隔，如 #components.dialog#components.follow#components.isFunction
     * @remarks 若脚本依赖其他脚本，依赖脚本在当前scope未注册，则会从global中查找
     * @param loadOptions 脚本加载的配置选项
     * @returns 解析后的脚本对象，按照ids顺序返回
     */
    loads(ids: string[], loadOptions?: Partial<ScriptLoadOptions>): Promise<any[]>;
}

/**
 * 脚本管理器配置选项
 */
export type ScriptOptions = {
    /**
     * 脚本文件所在的服务器
     * - 优先级： scope -> global-> location
     */
    origin: string;

    /**
     * 脚本的版本管理器
     * - 不传入则使用全局version对象
     */
    version: IVersionManager;
}

/**
 * 脚本文件
 */
export type ScriptFile = {
    /**
     * 脚本id；可选值：
     * - node_modules下的模块名，如vue
     * - null，此时取url值的路径值小写
     */
    id?: string;
    /**
     * 脚本文件网络路径地址
     * - 脚本推荐umd模式
     * - 最终和orign配合得到最终的下载地址
     */
    url?: string;
    /**
     * 脚本导出模块
     * - 可在register时传入，即可避免load时重复加载
     * - 为undefined时，基于load动态获取脚本解析exports对象
     */
    exports?: object | undefined;
    /**
     * 自定义的脚本加载
     * - 可在register时传入，进行脚本的自定义加载
     * - 为undefined时，基于url动态加载脚本
     * @returns 脚本加载任务
     */
    load?: () => Promise<any>;
}

/**
 * 脚本加载的配置选项
 */
export type ScriptLoadOptions = {
    /**
     * 加载过的脚本id集合，用于判断 循环加载 使用
     */
    ids: string[],

    /**
     * 参照url地址
     * - 当加载脚本id为脚本url为相对路径时，基于referUrl分析具体的绝对路径
     */
    refer?: string,
}
