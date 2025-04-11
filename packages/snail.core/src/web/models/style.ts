import { IServerManager, ServerOptions } from "./server";
import { IVersionManager } from "./version";

/**
 * 接口：样式文件句柄
 */
export interface IStyleHandle {
    /**
     * 销毁样式；将管理的样式全部移除掉
     */
    destroy(): void;
}

/**
 * 接口：样式管理器
 */
export interface IStyleManager extends IStyleHandle {
    /**
     * 注册样式文件
     * - 基于配置origin组装样式文件全路径；未配置origin则使用location.origin
     * - 自动基于version追加版本到querystring中
     * @param files 样式文件；可通过theme指定样式，不指定则是公共样式
     * @returns 样式句柄，支持切换主题，销毁样式等操作
     */
    register(...files: Array<StyleFile | string>): IStyleHandle;
    /**
     * 切换主题；自动将非当前主题的样式禁用掉(公共样式除外)
     * @param code 主题编码字符串
     * @returns 管理器自身
     */
    theme(code: string): IStyleManager;
}

/**
 * 样式配置选项
 */
export type StyleOptions = {
    /**
     * 默认主题；未指定或不支持指定主题时，以此主题为准
     */
    theme: string;

    /**
     * 样式注入的容器元素
     * - 不传入则采用默认的
     * - 传入则需外部确保存在性，且在元素销毁时执行style的destroy方法同步销毁管理器
     */
    container: HTMLElement;

    /**
     * 样式文件的所在的服务器
     * - 优先级： scope -> global-> location
     * @see https://developer.mozilla.org/zh-CN/docs/Web/API/URL/URL#base
     */
    origin: string;

    /**
     * 样式版本管理器
     * - 用于注册style时，格式化样式文件url地址
     */
    version: IVersionManager;
}

/**
 * 样式文件
 */
export type StyleFile = {
    /**
     * 样式文件路径
     */
    file: string;
    /**
     * 匹配的主题code，若为undefined表示为公共样式
     */
    theme: string | undefined;
}

export type StyleElement = StyleFile & {
    /**
     * 此元素的引用次数：为0时强制禁用掉
     */
    ref: number;
    /**
     * 样式元素信息
     */
    element?: HTMLLinkElement;
}