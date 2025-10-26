/**
 * 弹窗助手类
 * - 为了简化Manager中代码，不对外独立使用
 */

import { PopupDescriptor, PopupOptions } from "../models/popup-model";
import { triggerAppCreated } from "../../base/utils/app-util"
import { createApp, App, Component, shallowRef } from "vue";
import { FlatPromise, isObject, isStringNotEmpty, mustObject, throwIfFalse } from "snail.core";

/** 默认的Z-index值 */
const DEFAULT_ZINDEX: number = 2000;
/** 弹窗字典：key为弹窗id，value为构建的app实例 */
const POPUPMAPS: Map<string, App<Element>> = new Map();

/**
 * 检测弹窗配置选项
 * @param options 弹窗配置选项
 * @returns 检测结果：为空则检测通过，否则返回错误信息
 */
export function checkPopup(options: PopupOptions): string | undefined {
    try {
        mustObject(options, "checkPopup: options");
        throwIfFalse(
            isStringNotEmpty(options.name) || isObject(options.component) || isStringNotEmpty(options.url),
            "checkPopup: options.name/component/url cannot be invalid at same time."
        );
        options.zIndex > 0 || (options.zIndex = DEFAULT_ZINDEX);
    }
    catch (ex: any) {
        return ex.message;
    }
}

/**
 * 打开弹窗
 * @param container 弹窗容器组件；作为createApp的根组件；如DialogContainer、PopupContainer、、、
 * @param options 弹窗配置选项
 * @param extOptions 弹窗扩展配置选项
 * @returns 弹窗描述器对象
 */
export function openPopup<Options extends PopupOptions, ExtOptions extends Record<string, any>>(container: Component, options: Options, extOptions: ExtOptions)
    : Readonly<PopupDescriptor<Options, ExtOptions>> {
    const descriptor = Object.freeze<PopupDescriptor<Options, ExtOptions>>({
        popupId: `popup-${getPopupId()}`,
        popupStatus: shallowRef("open"),
        options: options,
        extOptions: extOptions,
        zIndex: options.zIndex || DEFAULT_ZINDEX,
        popupTransition: shallowRef<string>(`${options.transition || "fade"}-in`),
    });
    {
        const app = createApp(container, descriptor);
        triggerAppCreated(app, "popup");
        const appEl = getPopupAppElement(descriptor.popupId);
        app.mount(appEl);
        POPUPMAPS.set(descriptor.popupId, app);
    }
    return descriptor;
}
/**
 * 销毁弹窗
 * @param descriptor openPopup返回的弹窗描述器
 * @param task 弹窗任务，在外部通过destroy销毁时，同步任务状态用
 */
export function destroyPopup<T>(descriptor: PopupDescriptor<PopupOptions, any>, task: FlatPromise<T>) {
    const { popupId, popupStatus, options, popupTransition } = descriptor;
    //  任务保底：若状态不是“close”，则是外部执行 scope.destroy() 强制销毁；维护弹窗状态
    if (popupStatus.value != "closed") {
        console.warn("force close after scope.destroy called.");
        popupStatus.value = "closed";
        task.resolve(undefined);
    }
    //  强制将动画值设置为【关闭】
    popupTransition.value = `${options.transition || "fade"}-out`;
    //  销毁app实例：销毁时做一下延迟，实现销毁动画
    const app = POPUPMAPS.get(popupId);
    if (app != undefined) {
        POPUPMAPS.delete(popupId);
        //  延迟销毁，实现销毁动画
        setTimeout(() => {
            app._container.remove();
            app.unmount();
        }, options.transitionDuration > 0 ? options.transitionDuration : 500);
    }
}

/**
 * 获取弹窗Id
 */
const getPopupId: () => number = (function () {
    var popupId = 0;
    return () => (++popupId);
})();
/**
 * 构建挂载弹窗App实例dom元素
 * @param popupId 弹窗Id
 * @returns
 */
function getPopupAppElement(popupId: string): HTMLElement {
    //  创建通义根元素
    var rootEl = document.getElementById("snail-popup-apps");
    if (rootEl == undefined) {
        rootEl = document.createElement("div");
        rootEl.id = "snail-popup-apps";
        rootEl.style = "height:0 !important; width:0 !important;";
        document.body.appendChild(rootEl);
    }
    //  构建当前弹窗实例元素
    const appEle = document.createElement("div");
    appEle.id = popupId;
    appEle.classList.add("snail-app", "popup-app");
    return rootEl.appendChild(appEle);
}
