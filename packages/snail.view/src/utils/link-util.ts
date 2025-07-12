/**
 * link 模块助手类方法
 *  1、不对外提供，仅针对 link 模块使用
 */
import { extract, hasOwnProperty, tidyString } from "snail.core";
import { LinkElement, LinkOptions } from "../models/link-model";

//#region ************************************* Link标签配置 *************************************
/** 全局默认的版本配置 */
export const LINK_CONFIG: LinkOptions = { theme: undefined, container: undefined, origin: undefined, version: undefined };
/** 事件：改变样式主题 */
export const EVENT_ChangeTheme = "Snail.ChangeTheme";
/** link标签容器Id */
export const LINK_CONTAINER_ID = "snail_link_container";
/**
 * 检测样式配置选项
 * @param options
 * @returns
 */
export function checkLinkOptions(options: Partial<LinkOptions>): LinkOptions {
    //  仅提取指定key数据，避免外部传入object无效key影响
    options = extract<LinkOptions>(Object.keys(LINK_CONFIG), options);
    //  清理无效数据：仅传入时才生效
    hasOwnProperty(options, "theme") && (options.theme = tidyString(options.theme));
    hasOwnProperty(options, "origin") && (options.origin = tidyString(options.origin));

    return options as LinkOptions;
}
//#endregion

//#region ************************************* Link标签管理 *************************************
/**
 * 获取Link标签的默认容器
 * @returns 默认容器div元素，已加入body下
 */
export function getLinkDefaultContainer(): HTMLElement {
    var container = document.getElementById(LINK_CONTAINER_ID);
    if (!container) {
        container = document.createElement("div");
        container.id = LINK_CONTAINER_ID
        container.style.display = "none !important";
        container.style.height = "0px";
        container.style.width = "0px";
        document.body.appendChild(container);
    }
    return container;
}

/**
 * 基于主题设置指定的link文件
 * @param links 管理的link标签
 * @param code  主题编码
 * @param options 配置选项
 */
export function setlinkByTheme(links: LinkElement[], code: string, options: Partial<LinkOptions>): void {
    //  公共link，强制启用；判断是否有匹配的主题link
    let hasMatchTheme: boolean = false;
    links.forEach(link => {
        code && link.theme == code && (hasMatchTheme = true);
        link.element.disabled = link.ref == 0
            || (link.theme != undefined && link.theme != code);
    });
    //  组件没实现指定主题时，则基于默认主题做一下匹配，启用默认主题支持
    let defaultTheme: string = hasMatchTheme ? undefined : (options.theme || LINK_CONFIG.theme);
    defaultTheme && links.forEach(link => {
        link.theme == defaultTheme && (link.element.disabled = link.ref == 0)
    });
}

/**
 * 销毁指定的link文件
 * @param links 要销毁的文件
 * @param isDel 是否是删除默认；为false则是disabled模式
 */
export function destroylink(links: LinkElement[], isDel: boolean): void {
    links.forEach(link => {
        //  计算引用次数，del模式，强制为0
        link.ref = isDel ? 0 : Math.max(0, link.ref - 1);
        //  更新引用次数；强制删除
        link.element.setAttribute("data-ref", link.ref.toString());
        link.element.disabled = link.ref == 0;
        if (isDel == true) {
            link.element.parentNode && link.element.parentNode.removeChild(link.element);
            link.element = undefined;
        }
    });
    //  清空管理的link文件数据
    links.splice(0);
}
//#endregion