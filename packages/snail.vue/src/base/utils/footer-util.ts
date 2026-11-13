import { FooterOptions } from "../models/header-footer-model";

/**
 * 构建`Footer`组件的通用Footer配置
 * - 包含【取消】、【确认】按钮
 * @param cancelFn 取消按钮点击时的回调方法
 * @param confirmFn 确认按钮点击时的回调方法
 * @param algin 按钮对齐方式
 * @returns 
 */
export function buildCommonFooter(cancelFn: () => void, confirmFn: () => void, algin?: FooterOptions["align"],): FooterOptions {
    return {
        align: algin || "end",
        buttons: [
            { id: 'cancel', name: '取消', type: 'default', click: cancelFn },
            { id: 'confirm', name: '确定', type: 'primary', click: confirmFn },
        ]
    };
}