/**
 * 模态弹窗助手；提供模态弹窗相关功能
 *      1、内部维护一个VueApp实例，专门用于进行模态弹窗操
 *      2、模态弹窗展示效果，通过 @see ../componets/dialog-wrapper.vue 实现
 */
import { App, createApp, getCurrentScope, ref, shallowRef } from "vue";
import { Dialog, DialogOpenResult, DialogOptions } from "../models/dialog-model";
import DialogWrapper from "../components/dialog-wrapper.vue";
import { triggerAppCreated } from "../../base/utils/app-util";
import { defer, isFunction, isPromise, mustFunction, mustObject, newId } from "snail.core";
import { run, hook } from "snail.core";

/**
 * 打开模态弹窗
 * @param options 弹窗组件配置选项
 * @param onDestroyed 监听【调用方】的销毁时机，用于自动销毁打开的弹窗
 * @returns 弹窗打开结果，可手动关闭弹窗
 */
export function openDialog<T>(options: DialogOptions, onDestroyed?: (fn: () => void) => void): DialogOpenResult<T> {
    //  1、准备工作
    //      进行options检测：其他检测先不做，交给内部加载组件时完成，这里检测太冗余且重复
    mustObject(options, "options");
    options.zIndex = options.zIndex || 2000;
    /**     弹窗的异步对象，负责关闭弹窗通知调用方 */
    const deferred = defer<T>();
    //  2、构建弹窗对象，进行弹窗展现
    const dialog: Dialog = {
        id: newId(),
        options,
        //  弹窗操作句柄，强制冻结，不允许修改
        handle: Object.freeze({
            inDialog: true,
            async closeDialog(data: T) {
                const hookCode = createDialogHookCode(dialog);
                const rt = await dialogHook.runHookAsync(hookCode, { mode: "one", order: "desc" });
                if (rt.success != true) {
                    console.warn("run onDialogClose failed", rt.reason, rt.ex);
                    return;
                }
                //  关闭弹窗，并通知调用方
                destroyDialog(dialog);
                deferred.resolve(data);
            },
            onDialogClose(fn) {
                const hookCode = createDialogHookCode(dialog);
                dialogHook.register(hookCode, fn);
            }
        }),
    };
    //  4、展示弹窗，并返回
    initVueApp();
    descriptors.value.push(dialog);
    //      监听外部的销毁时机，自动销毁弹窗；不用再通知外部了，本身就是外部销毁触发的销毁
    isFunction(onDestroyed) && onDestroyed(() => destroyDialog(dialog));
    //      构建返回结果：组装close方法（调用时，强制关闭弹窗）
    const dr = deferred.promise as DialogOpenResult<T>;
    dr.destroy = () => {
        console.warn("force close dialog after openDialog caller called close function.");
        destroyDialog(dialog);
        deferred.resolve(undefined);
    };
    return dr;
}

//#region 👉 内部私有方法逻辑
/** 打开的弹窗实例 */
const descriptors = ref<Dialog[]>([]);
/** 弹窗钩子函数 */
const dialogHook = hook.newScope<string>();

/**
 * 创建指定对话框的dialogHook
 * @param dialog 
 */
const createDialogHookCode = (dialog: Dialog) => `onCloseDialog:${dialog.id}`;

/**
 * 销毁指定弹窗：把此弹窗和上面的弹窗都销毁掉
 * @param dialog 
 */
function destroyDialog(dialog: Dialog) {
    //  移除此dialog+后续dialog：移除前先销毁【注册的钩子】
    const index = descriptors.value.indexOf(dialog);
    if (index != -1) {
        for (var tmpIndex = index; tmpIndex < descriptors.value.length; tmpIndex++) {
            const hookCode = createDialogHookCode(descriptors.value[tmpIndex]);
            dialogHook.remove(hookCode);
        }
        descriptors.value.splice(index);
    }
}

/**
 * 初始化dialog使用到的app实例
 */
const initVueApp: () => void = (() => {
    /** 模态弹窗app实例 */
    var dialogApp: App = undefined;
    //  初始化函数，确保只初始化一次
    return function () {
        if (dialogApp == undefined) {
            const container = document.createElement("div");
            container.style = "height:0 !important; width:0 !important;";
            container.classList.add("snail-dialog-container");
            document.body.appendChild(container);
            /** 这里传入props时，需要先.value后再传递
             *      1、不行：dialogApp = createApp(DialogWrapper, { descriptors: descriptors });
             *          根组件中接收到的数据类型为object Object，只有.value后才是Array
             *      2、不行：const descriptors = [];
             *          定义descriptors不定义为 ref还不行，传过去虽然是Array，但openDialog中push元素后，组件内部接收不到
             */
            dialogApp = createApp(DialogWrapper, { descriptors: descriptors.value });
            triggerAppCreated(dialogApp).mount(container);
        }
    }
})();
//#endregion
