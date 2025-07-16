/**
 * 弹窗助手类
 * - 为了简化Manager中代码，不对外独立使用
 */

import { PopupOptions, PopupStatus } from "../models/popup-model";
import { PopupDescriptor } from "../models/manager-model";
import { triggerAppCreated } from "../../base/utils/app-util"
import { createApp, ref, App, Component, shallowRef } from "vue";
import PopupApp from "../components/popup-app.vue";
import { FlatPromise, getMessage, isObject, isStringNotEmpty, mustObject, throwIfFalse } from "snail.core";

/** 默认的Z-index值 */
const DEFAULT_ZINDEX: number = 2000;
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
        return getMessage(ex)
    }
}

/**
 * 打开弹窗
 * @param container 弹窗打开的容器组件：如DialogContainer、PopupContainer、、、
 * @param options 弹窗配置选项
 * @param extOptions 弹窗扩展配置选项
 * @returns 分配给弹窗的Id值
 */
export function openPopup<Options extends PopupOptions, ExtOptions extends Object>(container: Component, options: Options, extOptions: ExtOptions): number {
    //  构建新弹窗信息：将传入的container做shallowRef处理，避免性能浪费
    initPopupApp();
    const id = getPopupId();
    const descriptor: PopupDescriptor<Options, ExtOptions> = {
        id: id,
        container: shallowRef(container),
        options,
        extOptions,
        zIndex: options.zIndex || DEFAULT_ZINDEX,
    }
    DESCRIPTORS.value.set(id, descriptor);
    return id;
}

/**
 * 销毁弹窗
 * @param popupId openPopup返回的唯一标记，销毁时使用
 * @param status 弹窗状态，响应式
 * @param task 弹窗任务，在外部通过destroy销毁时，同步任务状态用
 * @param delay 销毁延迟时间；单位ms，不传入则不立即销毁
 */
export function destroyPopup<T>(popupId: number, status: PopupStatus, task: FlatPromise<T>) {
    //  任务保底：若状态不是“close”，则是外部执行 scope.destroy() 强制销毁；维护弹窗状态
    if (status.value != "close") {
        console.warn("force close after scope.destroy called.");
        status.value = "close";
        task.resolve(undefined);
    }
    //  清理弹窗挂载
    DESCRIPTORS.value.delete(popupId);
}

/**
 * 弹窗实例对象
 * - key 为分配的唯一Id值
 * - value 为弹窗描述器
 */
const DESCRIPTORS = ref<Map<number, PopupDescriptor<PopupOptions, any>>>(new Map());
/**
 * 初始化弹窗app实例
 */
const initPopupApp: () => void = (function () {
    var popupApp: App = undefined;
    return function () {
        if (popupApp == undefined) {
            const container = document.createElement("div");
            container.classList.add("snail-app", "snail-popup-app");
            container.style = "height:0 !important; width:0 !important;";
            document.body.appendChild(container);
            /** 这里传入props时，需要先.value后再传递
             *      1、不行：createApp(PopupApp, { descriptors: descriptors });
             *          根组件中接收到的数据类型为object Object，只有.value后才是Array
             *      2、不行：const descriptors = [];
             *          定义descriptors不定义为 ref还不行，传过去虽然是Array，但openDialog中push元素后，组件内部接收不到
             */
            popupApp = createApp(PopupApp, { descriptors: DESCRIPTORS.value });
            triggerAppCreated(popupApp).mount(container);
        }
    }
})();
/**
 * 获取弹窗Id
 */
const getPopupId: () => number = (function () {
    var popupId = 0;
    return () => (++popupId);
})();

