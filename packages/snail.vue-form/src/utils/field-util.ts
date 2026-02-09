/**
 * 字段助手方法
 * - 提供一下控件的通用方法，如文本必填、长度验证，数值的最大值、最小值，小数位数、、、
 * - 将一些非ui代码提取到这里，减少vue组件中的代码量，让其专注ui交互
 */

import { isStringNotEmpty, RunResult } from "snail.core";
import { TextControlSettings } from "../models/control-model";
import { FieldOptions, FieldStatusOptions } from "../models/field-base";
import { IFieldContainerHandle } from "../models/field-container";

/**
 * 处理值字符串：确保始终为string，且不是undefined、、、
 * @param value 
 */
export function getValueString(value: string): string {
    return value == undefined ? "" : String(value);
}
/**
 * 验证文本值
 * @param text 要验证的文本
 * @param status 字段状态
 * @param settings 文本控件的特殊配置
 * @returns 验证结果；`.success`是否成功：true则验证通过；false则`.reason`失败原因
 */
export function validateText(text: string, status: FieldStatusOptions, settings?: TextControlSettings): RunResult {
    /** 后续还需要完成，只读、隐藏时不做验证 */
    const textLen: number = typeof text == "string" ? text.length : 0;
    //  有值时；最大、最小长度验证
    if (textLen > 0 && settings) {
        if (settings.minLength > 0 && settings.minLength > textLen) {
            return { success: false, reason: `小于最小长度限制(${settings.minLength})` };
        }
        if (settings.maxLength > 0 && settings.maxLength < textLen) {
            return { success: false, reason: `超过最大长度限制(${settings.maxLength})` };
        }
    }
    //  无值时，必填验证
    else if (textLen == 0 && status.required == true) {
        return { success: false, reason: "不可为空" };
    }
    return { success: true };
}