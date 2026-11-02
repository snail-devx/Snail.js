import { FlatPromise, IScope, isStringNotEmpty } from "snail.core";
import { DialogOptions } from "../models/dialog-model";
import { checkPopup, destroyPopup, updatePopupStatus } from "./popup-util";

/**
 * 检测弹窗配置选项
 * @param options 弹窗配置选项
 * @returns 检测结果：为空则检测通过，否则返回错误信息
 */
export function checkDialog(options: DialogOptions): string | undefined {
    var message = checkPopup(options);
    if (isStringNotEmpty(message) == false) {
        //  目前没啥可必须检测的
    }
    return message;
}

/** 
 * 模态弹窗信息
 * - 记录弹窗Scope，在前面弹窗销毁后，它之后的弹窗全部强制销毁，它前面的谭庄激活
 * - 记录弹窗主键Id，用于更新弹窗状态
 */
const DIALOGS: { id: string, scope: IScope }[] = [];
/**
 * 监听弹窗
 * - 将之前的弹窗 设置为 非激活状态
 * - 关闭弹窗时，将它和之后的弹窗强制关闭，上一个弹窗设置为激活
 * @param popupId 弹窗主键id
 * @param scope 弹窗作用域
 * @param task 弹窗任务，在外部通过destroy销毁时，同步任务状态用
 */
export function monitorDialog<T>(popupId: string, scope: IScope, task: FlatPromise<T>) {
    //  当前弹窗激活，之前的所有弹窗全部 失焦
    updatePopupStatus(popupId, "active");
    const index = DIALOGS.push(Object.freeze({ id: popupId, scope })) - 1;
    index > 0 && (updatePopupStatus(DIALOGS[index - 1].id, "unactive"));
    //  响应弹窗销毁操作：
    scope.onDestroy(function () {
        //  激活上一个弹窗
        if (index > 0) {
            const pre = DIALOGS[index - 1];
            pre && pre.scope.destroyed == false && updatePopupStatus(pre.id, "active");
        }
        //  清理之后的所有弹窗
        DIALOGS.splice(index).forEach((item, index) => {
            if (index > 0 && item.scope.destroyed == false) {
                updatePopupStatus(item.id, "closed");
                item.scope.destroy();
            }
        });
        //  清理自己
        destroyPopup(popupId, task);
    });
}