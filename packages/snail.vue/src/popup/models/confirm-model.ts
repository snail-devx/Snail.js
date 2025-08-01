import { ConfirmAreaOptions, MessageOptions, TitleOptions } from "../../base/models/base-model";

/**
 * 确认弹窗配置选项
 * - title          弹窗标题，默认“提示”
 * - message        确认提示信息；默认“请确认？”；支持html格式内容
 */
export type ConfirmOptions = TitleOptions & MessageOptions & ConfirmAreaOptions & {

}