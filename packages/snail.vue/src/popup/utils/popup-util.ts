/**
 * 弹窗助手类
 * - 为了简化Manager中代码，不对外独立使用
 */

import { correctString, FlatPromise, isFunction, isObject, isStringNotEmpty, mustFunction, mustObject, throwIfFalse } from "snail.core";
import { Component, readonly, shallowRef } from "vue";
import { AppEnv } from "../../base/models/app-model";
import { MotionEffectOptions } from "../../base/models/motion-model";
import { newApp } from "../../base/utils/app-util";
import { PopupAppDescriptor, PopupContext, PopupExtendOptions, PopupHandle, PopupOptions, PopupStatus, PopupType } from "../models/popup-model";

/** 弹窗默认配置 */
const DEFAULT: PopupExtendOptions = Object.create(null);
/** 弹窗字典：key为弹窗id，value为构建的app实例 */
const POPUPMAPS: Map<string, PopupAppDescriptor> = new Map();
/** 弹窗的z-index值队列 */
const QUEUE_ZINDEX: number[] = [];

/**
 * 配置弹窗默认配置
 * - 注意：`z-index`尽量在站点启动时初始化，避免已使用弹窗后再配置，否则容器导致层级混乱
 * @param options 配置选项
 */
export function configPopup(options: PopupExtendOptions) {
    if (options != undefined) {
        options.zIndex > 0 && (DEFAULT.zIndex = options.zIndex);
        options.motion && (DEFAULT.motion = options.motion);
        options.motionDuration > 0 && (DEFAULT.motionDuration = options.motionDuration)
    }
}

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
    }
    catch (ex: any) {
        return ex.message;
    }
}
/**
 * 打开弹窗
 * @param container 
 * @param container 弹窗根容器，无效则自动使用 PopupContainer
 * @param options 弹窗配置选项，将直接挂载到容器属性上
 * @param extend 外部可通过此参数自定义弹窗关闭方法等
 * @returns 弹窗上下文
 */
export function openPopup<T, Options extends PopupOptions<any, any>>(env: AppEnv, container: Component, options: Options, extend: Pick<PopupHandle<T>, "inPopup" | "closePopup">): Readonly<PopupContext<T>> {
    //  基础验证，若这都错了，那说明传入参数有问题，开发级别需要排查出来
    mustObject(options, "openPopup: options");
    mustObject(extend, "openPopup: extend");
    mustFunction(extend.closePopup, "openPopup: extend.closePopup");
    const popupType: PopupType = extend.inPopup || "popup";
    const duration = [options.motionDuration, DEFAULT.motionDuration, 200].find(item => item > 0);
    const motion = options.motion;
    const statusRef = shallowRef<PopupStatus>("open");
    const motionRef = shallowRef<string>(correctPopupMotion(popupType, "open", options.motion));
    debugger;
    //  构建上下文：状态和动画，使用只读副本对外共享
    const context: PopupContext<T> = {
        inPopup: popupType,
        popupId: `popup-${getPopupId()}`,
        zIndex: correctZIndex(options.zIndex),
        popupStatus: readonly(statusRef),
        motion: readonly(motionRef),
        closePopup: extend.closePopup,
    };
    // 构建弹窗app实例，并做绑定
    {
        //  对options进行复制，并剔除掉[PopupOptions]一些属性，这些属性无需往下传递，或者需要加工后共享到context中
        const props = { ...options, context };
        ["motion", "motionDuration", "zIndex"].forEach(key => delete props[key]);
        //  构建app做绑定，并缓存app实例相关数据
        const app = newApp("popup", env, container, props);
        app.mount(getPopupAppElement(context.popupId));
        POPUPMAPS.set(context.popupId, Object.freeze<PopupAppDescriptor>({
            statusRef,
            motionRef,
            destroy() {
                //  强制将动画值设置为【关闭】，先设置为null，再设置为新的动画名，避免 in和out都是同一个动画名时，动画不执行的问题
                statusRef.value = "closed";
                motionRef.value = undefined;
                setTimeout(() => motionRef.value = correctPopupMotion(popupType, "closed", motion), 0);
                POPUPMAPS.delete(context.popupId);
                //  延迟销毁，实现销毁动画
                setTimeout(() => {
                    app._container.remove();
                    app.unmount();
                }, duration);
            }
        }));
    }

    return context;
}
/**
 * 销毁弹窗
 * @param popupId 弹窗Id
 * @param task 弹窗任务，若不处于关闭状态，则先resolve此task
 */
export function destroyPopup(popupId: string, task: FlatPromise<any>): void {
    const descriptor = POPUPMAPS.get(popupId);
    //  任务保底：若状态不是“close”，则是外部执行 scope.destroy() 强制销毁；维护弹窗状态
    if (descriptor != undefined) {
        if (descriptor.statusRef.value != "closed") {
            console.warn("force close after scope.destroy called.");
            task.resolve(undefined);
        }
        descriptor.destroy();
    }
}
/**
 * 更新弹窗状态
 * - 满足模态弹窗时的遮罩层只在最新弹窗显示
 * @param popupId 
 * @param status 
 */
export function updatePopupStatus(popupId: string, status: PopupStatus): void {
    const descriptor = POPUPMAPS.get(popupId);
    descriptor && (descriptor.statusRef.value = status);
}

/**
 * 获取弹窗Id
 * - 自执行函数构建一个闭包，内部维护id值
 */
const getPopupId: () => number = (function () {
    var popupId = 0;
    return () => (++popupId);
})();
/**
 * 校正弹窗动画类样式
 * @param type 弹窗类型
 * @param status 弹窗状态，关闭还是打开
 * @param motion 动画配置
 * @returns 动画类样式名
 */
function correctPopupMotion(type: PopupType, status: PopupStatus, motion?: PopupOptions["motion"]): string {
    let motionName: string = undefined;
    for (const item of [motion, DEFAULT.motion, "fade"]) {
        if (item != undefined) {
            if (isObject(item) == true) {
                motionName = status == "closed"
                    ? (item as MotionEffectOptions).out
                    : (item as MotionEffectOptions).in;
            }
            else if (isStringNotEmpty(item) == true) {
                motionName = status == "closed" ? "out" : "in";
                motionName = `${item}-${motionName}`
            }
            else if (isFunction(item) == true) {
                motionName = (item as (popupType: PopupType, status: PopupStatus) => string)(type, status);
                motionName = correctString(motionName, undefined, true);
            }

            if (motionName != undefined) {
                break;
            }
        }
    }
    return motionName;
}
/**
 * 校正弹窗的z-index值
 * @param zIndex 
 * @returns 新的z-index值，确保新弹窗在最前面
 */
function correctZIndex(zIndex: number): number {
    const globalZIndex = DEFAULT.zIndex > 0 ? DEFAULT.zIndex : 2000;
    zIndex > globalZIndex || (zIndex = globalZIndex);
    QUEUE_ZINDEX.length && (zIndex = Math.max(QUEUE_ZINDEX[QUEUE_ZINDEX.length - 1], zIndex));
    QUEUE_ZINDEX.push(zIndex);
    return zIndex;
}

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
