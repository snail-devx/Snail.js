import { mustString, extract, isArrayNotEmpty, isObject, isStringNotEmpty, tidyString } from "../base/data";
import { event } from "../base/event";
import { IStyleHandle, IStyleManager, StyleElement, StyleFile, StyleOptions } from "./models/style-model";
import { version } from "./version";

/** 把自己的类型共享出去 */
export * from "./models/style-model"

/**
 * CSS模块：自动注册css文件、支持换肤、支持版本号注入
 */
export namespace style {
    /** 全局默认的版本配置 */
    const CONFIG: StyleOptions = { theme: undefined, container: undefined, origin: undefined, version: undefined };
    /** 事件：改变样式主题 */
    const EVENT_ChangeTheme = "Snail.Style.ChangeTheme";
    /** 全局样式管理 */
    const global: IStyleManager = newScope();

    //#region ************************************* 公共方法、变量*************************************
    /**
     * 新的样式作用域：执行后返回一个全新的管理器对象
     * @param options 配置选项
     * @returns 新的管理器对象
     */
    export function newScope(options?: Partial<StyleOptions>): IStyleManager {
        /** 脚本配置选项 */
        options = Object.freeze(checkStyoleOptions(options));
        /** 当前样式主题 */
        var scopeTheme: string = undefined;
        /** 管理的样式文件 */
        const scopeStyles: StyleElement[] = [];

        //#region *************************************接口方法：IStyleManager具体实现*************************************
        /**
         * 注册样式文件
         * @param files 样式文件；可通过theme指定样式，不指定则是公共样式
         * @returns 样式句柄，支持切换主题，销毁样式等操作
         */
        function register(...files: Array<StyleFile | string>): IStyleHandle {
            //  转换注入Element，需要注意元素的引用次数，若相同文件（文件相同、theme相同），重复注册，则增加引用次数
            const funcStyles: StyleElement[] = [];
            isArrayNotEmpty(files) && files.forEach((file: string | StyleFile) => {
                //  1、解析配置；生成文件地址：考虑服务器地址相关配置
                let href: string = typeof (file) == "string" ? file : file.file;
                mustString(href, "href");
                const theme: string = typeof (file) == "string" ? undefined : (file.theme || undefined);
                let tmpStr: string = options.origin || CONFIG.origin;
                isStringNotEmpty(tmpStr) && (href = new URL(href, tmpStr).toString());
                //  2、基于file（不处理query和hash）+theme查重，若已经存在则不用新加入到syleFiles中，此时判断element是否有效
                tmpStr = href.toLowerCase();
                let styleEle: StyleElement = scopeStyles.find(s => s.theme == theme && s.file.toLowerCase() == tmpStr);
                if (!styleEle) {
                    styleEle = { file: href, theme, ref: 0 };
                    scopeStyles.push(styleEle);
                }
                styleEle.ref += 1;
                funcStyles.push(styleEle);
                //  3、创建Element数据：加入到dom中，
                if (!styleEle.element) {
                    //  基于version,构建href版本信息
                    styleEle.element = document.createElement("link");
                    styleEle.element.href = (options.version || CONFIG.version || version).formart(styleEle.file);
                    styleEle.element.rel = "stylesheet";
                    styleEle.element.disabled = true;
                    theme && styleEle.element.setAttribute("data-theme", theme);
                    //  自己的Container-》global-》默认body下创建一个固定的
                    let container: HTMLElement = options.container || CONFIG.container
                        || document.getElementById("snail_style_container");
                    if (!container) {
                        container = document.createElement("div");
                        container.id = "snail_style_container"
                        container.style.display = "none !important";
                        container.style.height = "0px";
                        container.style.width = "0px";
                        document.body.appendChild(container);
                    }
                    container.appendChild(styleEle.element);
                }
                styleEle.element.setAttribute("data-ref", styleEle.ref.toString());
            });
            //  基于主题设置sytle；并构建Style句柄返回
            funcStyles.length > 0 && setStyleByTheme(funcStyles, scopeTheme);
            return {
                destroy: () => funcStyles.length > 0 && destroyStyle(funcStyles, false),
            }
        }
        /**
         * 改变主题；自动将非当前主题的样式禁用掉(公共样式除外)
         * @param code 主题编码字符串
         * @returns 管理器自身
         */
        function theme(code: string): IStyleManager {
            mustString(code, "code");
            scopeTheme != code && setStyleByTheme(scopeStyles, scopeTheme = code), true;
            return manager;
        }
        /**
         * 销毁样式；将管理的样式全部移除掉
         */
        function destroy(): void {
            event.off(EVENT_ChangeTheme, theme);
            destroyStyle(scopeStyles, true);
        }
        //#endregion

        //#region *************************************辅助方法：IStyleManager方法使用*************************************
        /**
         * 基于主题设置指定的样式文件
         * @param styles 
         * @param code 
         */
        function setStyleByTheme(styles: StyleElement[], code: string): void {
            //  公共样式，强制启用；判断是否有匹配的主题样式
            let hasMatchTheme: boolean = false;
            styles.forEach(style => {
                code && style.theme == code && (hasMatchTheme = true);
                style.element.disabled = style.ref == 0
                    || (style.theme != undefined && style.theme != code);
            });
            //  组件没实现指定主题时，则基于默认主题做一下匹配，启用默认主题支持
            let defaultTheme: string = hasMatchTheme ? undefined : (options.theme || CONFIG.theme);
            defaultTheme && styles.forEach(style => {
                style.theme == defaultTheme && (style.element.disabled = style.ref == 0)
            });
        }
        /**
         * 销毁指定的样式文件
         * @param styles 要销毁的文件
         * @param isDel 是否是删除默认；为false则是disabled模式
         */
        function destroyStyle(styles: StyleElement[], isDel: boolean): void {
            styles.forEach(style => {
                //  计算引用次数，del模式，强制为0
                style.ref = isDel ? 0 : Math.max(0, style.ref - 1);
                //  更新引用次数；强制删除
                style.element.setAttribute("data-ref", style.ref.toString());
                style.element.disabled = style.ref == 0;
                if (isDel == true) {
                    style.element.parentNode && style.element.parentNode.removeChild(style.element);
                    style.element = undefined;
                }
            });
            //  清空管理的样式文件数据
            styles.splice(0);
        }
        //#endregion

        //  事件监听：主题改变事件
        event.on(EVENT_ChangeTheme, theme);

        /** 管理器对象 */
        const manager: IStyleManager = Object.freeze({ config, register, theme, destroy });
        return manager;
    }
    /**
     * 配置样式管理器
     * @param options 配置选项
     */
    export function config(options: Partial<StyleOptions>): IStyleManager {
        options = checkStyoleOptions(options);
        Object.assign(CONFIG, options);
        return global;
    }
    /**
     * 注册样式文件
     * - 基于配置origin组装样式文件全路径；未配置origin则使用location.origin
     * - 自动基于version追加版本到querystring中
     * @param files 样式文件；可通过theme指定样式，不指定则是公共样式
     * @returns 样式句柄，支持切换主题，销毁样式等操作
     */
    export function register(...files: Array<StyleFile | string>): IStyleHandle {
        return global.register(...files);
    }
    /**
     * 切换主题；自动将非当前主题的样式禁用掉(公共样式除外)
     * @param code 主题编码字符串
     * @returns 管理器自身
     */
    export function theme(code: string): IStyleManager {
        global.theme(code);
        event.trigger(EVENT_ChangeTheme, code, true);
        return global;
    }
    /**
     * 销毁全局样式；将管理的样式全部移除掉
     */
    export function destroy(): void {
        global.destroy();
    }
    //#endregion


    //#region ************************************* 私有方法  *************************************
    /**
     * 检测样式配置选项
     * @param options 
     * @returns
     */
    function checkStyoleOptions(options: Partial<StyleOptions>): StyleOptions {
        //  仅提取指定key数据，避免外部传入object无效key影响
        options = extract<StyleOptions>(Object.keys(CONFIG), options);
        //  清理空数据
        options.theme = tidyString(options.theme);
        options.origin = tidyString(options.origin);

        return options as StyleOptions;
    }
    //#endregion
}