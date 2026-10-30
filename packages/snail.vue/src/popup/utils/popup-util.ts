/**
 * 弹窗助手类
 * - 为了简化Manager中代码，不对外独立使用
 */

import { FlatPromise, isObject, isStringNotEmpty, mustObject, throwIfFalse } from "snail.core";
import { App, Component, shallowRef } from "vue";
import { AppEnv } from "../../base/models/app-model";
import { MotionEffectOptions } from "../../base/models/motion-model";
import { newApp } from "../../base/utils/app-util";
import { PopupDescriptor, PopupOptions } from "../models/popup-model";

/** 默认的Z-index值 */
const DEFAULT_ZINDEX: number = 2000;
/** 弹窗字典：key为弹窗id，value为构建的app实例 */
const POPUPMAPS: Map<string, App<Element>> = new Map();
/** 弹窗的z-index值队列 */
const QUEUE_ZINDEX: number[] = [];

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
 * - 弹窗页面将作为独立app存在
 * @param env 应用环境信息；注入到新的app实例中，后代组件可{@link useApp}取到
 * @param container 弹窗容器组件；作为createApp的根组件；如DialogContainer、PopupContainer、、、
 * @param options 弹窗配置选项
 * @param extOptions 弹窗扩展配置选项
 * @returns 弹窗描述器对象
 */
export function openPopup<Options extends PopupOptions, ExtOptions extends Record<string, any>>(env: AppEnv, container: Component, options: Options, extOptions: ExtOptions)
    : Readonly<PopupDescriptor<Options, ExtOptions>> {
    const descriptor = Object.freeze<PopupDescriptor<Options, ExtOptions>>({
        popupId: `popup-${getPopupId()}`,
        popupStatus: shallowRef("open"),
        options: options,
        extOptions: extOptions,
        zIndex: correctZIndex(options.zIndex),
        motion: shallowRef<string>(correctPopupMotion("open", options.motion)),
    });
    {
        // const app = createApp(container, descriptor);
        // triggerAppCreated(app, "popup");
        const app = newApp("popup", env, container, descriptor);
        app.mount(getPopupAppElement(descriptor.popupId));
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
    const { popupId, popupStatus, options, motion } = descriptor;
    //  任务保底：若状态不是“close”，则是外部执行 scope.destroy() 强制销毁；维护弹窗状态
    if (popupStatus.value != "closed") {
        console.warn("force close after scope.destroy called.");
        popupStatus.value = "closed";
        task.resolve(undefined);
    }
    //  强制将动画值设置为【关闭】，先设置为null，再设置为新的动画名，避免 in和out都是同一个动画名时，动画不执行的问题
    motion.value = undefined;
    setTimeout(() => motion.value = correctPopupMotion("close", options.motion), 0);
    //  销毁app实例：销毁时做一下延迟，实现销毁动画
    const app = POPUPMAPS.get(popupId);
    if (app != undefined) {
        POPUPMAPS.delete(popupId);
        //  延迟销毁，实现销毁动画
        setTimeout(() => {
            app._container.remove();
            app.unmount();
        }, options.motionDuration > 0 ? options.motionDuration : 200);
    }
    //  整理完之后，清理ZIndex值
    QUEUE_ZINDEX.splice(POPUPMAPS.size);
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

/**
 * 校正弹窗动画类样式
 * @param type 打开弹窗，还是关闭弹窗
 * @param motion 动画配置
 * @returns 动画类样式名
 */
function correctPopupMotion(type: "open" | "close", motion?: PopupOptions["motion"]): string {
    let motionName: string = undefined;
    if (isObject(motion) == true) {
        motionName = type == "close"
            ? (motion as MotionEffectOptions).out
            : (motion as MotionEffectOptions).in;
    }
    else if (isStringNotEmpty(motion) == true) {
        motionName = type == "close" ? "out" : "in";
        motionName = `${motion}-${motionName}`
    }
    if (isStringNotEmpty(motionName) == false) {
        motionName = type == "close" ? "out" : "in";
        motionName = `fade-${motionName}`;
    }
    return motionName;
}
/**
 * 校正弹窗的z-index值
 * @param zIndex 
 * @returns 新的z-index值，确保新弹窗在最前面
 */
function correctZIndex(zIndex: number): number {
    let tmpZIndex = zIndex > DEFAULT_ZINDEX ? zIndex : DEFAULT_ZINDEX;
    if (QUEUE_ZINDEX.length > 0) {
        tmpZIndex = Math.max(QUEUE_ZINDEX[QUEUE_ZINDEX.length - 1], tmpZIndex)
    }
    QUEUE_ZINDEX.push(tmpZIndex);
    return tmpZIndex;
}