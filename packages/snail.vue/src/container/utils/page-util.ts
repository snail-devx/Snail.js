import { PageFooterOptions } from "../models/page-model";

//#region ************************************* 全局共享方法 *************************************
/**
 * 构建`Page`组件的通用Footer配置
 * - 包含【取消】、【确认】按钮
 * @param cancelFn 取消按钮点击时的回调方法
 * @param confirmFn 确认按钮点击时的回调方法
 * @param algin 按钮对齐方式
 * @returns 
 */
export function buildPageCommonFooter(cancelFn: () => void, confirmFn: () => void, algin?: PageFooterOptions["align"],): PageFooterOptions {
    return {
        align: algin || "end",
        buttons: [
            { code: 'cancel', name: '取消', type: 'default', click: cancelFn },
            { code: 'confirm', name: '确定', type: 'primary', click: confirmFn },
        ]
    };
}
//#endregion