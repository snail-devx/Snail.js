/**
 * link 标签管理
 *  1、csslink标签管理，自动追加版本号，维护生命周期
 */
import { IScope, mountScope, useScope } from "snail.core"
import { event, mustString, isArrayNotEmpty, isStringNotEmpty, version } from "snail.core";
import { ILinkManager, LinkElement, LinkFile, LinkOptions } from "../models/link-model";
import { checkLinkOptions, destroylink, EVENT_ChangeTheme, getLinkDefaultContainer, LINK_CONFIG, LINK_CONTAINER_ID, setlinkByTheme } from "../utils/link-util";

// 把自己的类型共享出去
export * from "../models/link-model";

/**
 * 使用【link标签管理器】
 * - 全新作用域，和其他【link标签管理器】实例隔离
 * @param options 
 * @returns 新的管理器+作用域 
 */
export function useLink(options?: Partial<LinkOptions>): ILinkManager & IScope {
    /** 脚本配置选项 */
    options = Object.freeze(checkLinkOptions(options));
    /** 当前link主题 */
    var scopeTheme: string = undefined;
    /** 管理的link文件 */
    const scopeLinks: LinkElement[] = [];

    //#region *************************************接口方法：IlinkManager具体实现*************************************
    /**
     * 注册link文件
     * @param files link文件；可通过theme指定link，不指定则是公共link
     * @returns link句柄，支持切换主题，销毁link等操作
     */
    function register(...files: Array<LinkFile | string>): IScope {
        //  转换注入Element，需要注意元素的引用次数，若相同文件（文件相同、theme相同），重复注册，则增加引用次数
        const funclinks: LinkElement[] = [];
        isArrayNotEmpty(files) && files.forEach((file: string | LinkFile) => {
            //  1、解析配置；生成文件地址：考虑服务器地址相关配置
            const link: LinkFile = typeof (file) == "string"
                ? { file: file, theme: undefined }
                : file;
            //      解析出href值：进行map映射管理
            let href: string = linkMap.get(link.file);
            href && console.log(`map to new link file. link: ${link.file}, new link: ${href}`);
            href = href || link.file;
            mustString(href, "href");
            //      基于origin组装link文件全路径
            let tmpStr: string = options.origin || LINK_CONFIG.origin;
            isStringNotEmpty(tmpStr) && (href = new URL(href, tmpStr).toString());
            //  2、基于file（不处理query和hash）+theme查重，若已经存在则不用新加入到syleFiles中，此时判断element是否有效
            tmpStr = href.toLowerCase();
            let linkEle: LinkElement = scopeLinks.find(s => s.theme == link.theme && s.file.toLowerCase() == tmpStr);
            if (!linkEle) {
                linkEle = {
                    file: href,
                    theme: link.theme,
                    ref: 0
                };
                scopeLinks.push(linkEle);
            }
            linkEle.ref += 1;
            funclinks.push(linkEle);
            //  3、创建Element数据：加入到dom中，
            if (!linkEle.element) {
                //  基于version,构建href版本信息
                linkEle.element = document.createElement("link");
                linkEle.element.href = (options.version || LINK_CONFIG.version || version).formart(linkEle.file);
                linkEle.element.rel = "stylesheet";
                linkEle.element.disabled = true;
                link.theme && linkEle.element.setAttribute("data-theme", link.theme);
                //  自己的Container-》link-》默认body下创建一个固定的
                const container: HTMLElement = options.container || LINK_CONFIG.container || getLinkDefaultContainer();
                container.appendChild(linkEle.element);
            }
            linkEle.element.setAttribute("data-ref", linkEle.ref.toString());
        });
        //  基于主题设置sytle；并构建link句柄返回
        funclinks.length > 0 && setlinkByTheme(funclinks, scopeTheme, options);
        //  构建作用域返回：销毁时移除link
        return useScope().onDestroy(() => destroylink(funclinks, false));
    }
    /**
     * 改变主题；自动将非当前主题的link禁用掉(公共link除外)
     * @param code 主题编码字符串
     * @returns 管理器自身
     */
    function theme(code: string): ILinkManager {
        /** 主题没改动，就不操作；全局管理器时，做事件触发，通知所有管理器同步修改主题*/
        mustString(code, "code");
        if (scopeTheme != code) {
            setlinkByTheme(scopeLinks, scopeTheme = code, options);
            manager === link && event.trigger(EVENT_ChangeTheme, code, true);
        }
        return manager;
    }
    //#endregion

    //  构建管理器实例，挂载scope作用域
    const manager = mountScope<ILinkManager>({ register, theme }, "ILinkManager");
    manager.onDestroy(() => {
        event.off(EVENT_ChangeTheme, theme);
        destroylink(scopeLinks, true)
    });
    event.on(EVENT_ChangeTheme, theme);
    return Object.freeze(manager);
}
/** 全局的link映射表
 * - 将指定的link文件映射为新的link文件
 * - key为源link文件地址，value为新的link文件地址
 * - 注意：key区分大小写，外部使用时做好控制
 */
export const linkMap: Map<string, string> = new Map();
/** 
 * 全局【link管理器】
 */
export const link: ILinkManager = useLink();
//  全局link管理器监听【改变主题】事件，则会进入死循环(自己触发、自己监听）；全局切换主题采用:Link.theme(code)
event.off(EVENT_ChangeTheme, link.theme);

/**
 * Link标签 全局配置
 * @param options 配置选项
 * @returns 全局link管理器
 */
export function configLink(options: Partial<LinkOptions>): ILinkManager {
    options = checkLinkOptions(options);
    Object.assign(LINK_CONFIG, options);
    return link;
}