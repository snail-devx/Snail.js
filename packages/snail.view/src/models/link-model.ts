import { IScope, IServerManager, ServerOptions, IVersionManager } from "snail.core";

/**
 * 接口：link标签管理器
 */
export interface ILinkManager {
    /**
     * 注册link文件
     * - 基于配置origin组装link文件全路径；未配置origin则使用location.origin
     * - 自动基于version追加版本到querystring中
     * @param files link文件；可通过theme指定link，不指定则是公共link
     * @returns link句柄，支持切换主题，销毁link等操作
     */
    register(...files: Array<LinkFile | string>): IScope;
    /**
     * 切换主题；自动将非当前主题的link禁用掉(公共link除外)
     * @param code 主题编码字符串
     * @returns 管理器自身
     */
    theme(code: string): ILinkManager;
}

/**
 * link配置选项
 */
export type LinkOptions = {
    /**
     * 默认主题；未指定或不支持指定主题时，以此主题为准
     */
    theme: string;

    /**
     * link注入的容器元素
     * - 不传入则采用默认的
     * - 传入则需外部确保存在性，且在元素销毁时执行link的destroy方法同步销毁管理器
     */
    container: HTMLElement;

    /**
     * link文件的所在的服务器
     * - 优先级： scope -> global-> location
     * @see https://developer.mozilla.org/zh-CN/docs/Web/API/URL/URL#base
     */
    origin: string;

    /**
     * link版本管理器
     * - 用于注册link时，格式化link文件url地址
     */
    version: IVersionManager;
}

/**
 * link文件
 */
export type LinkFile = {
    /**
     * link文件路径
     */
    file: string;
    /**
     * 匹配的主题code，若为undefined表示为公共link
     */
    theme: string | undefined;
}

/**
 * link标签元素对象
 */
export type LinkElement = LinkFile & {
    /**
     * 此元素的引用次数：为0时强制禁用掉
     */
    ref: number;
    /**
     * link元素信息
     */
    element?: HTMLLinkElement;
}