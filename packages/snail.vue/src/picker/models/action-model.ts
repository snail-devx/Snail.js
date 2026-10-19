/**
 * 操作表 数据实体
 */

import { TitleOptions } from "../../base/models/base-model";

/**
 * 动作选择器 配置选项
 * - 配合 showAction 方法使用
 * - title 在移动端生效
 */
export type ActionPickerOptions = TitleOptions & {
    /**
     * 可用动作项数组
     */
    actions: ActionPickerItem[];
}

/**
 * 动作选择器的一个动作项
 */
export type ActionPickerItem = {
    /**
     * 动作项编码
     * - 确保唯一
     */
    code: string;
    /**
     * 动作项名称
     * - 确保唯一
     */
    name: string;

    /**
     * 点击动作时的回调
     * - 外部需确保执行不报错，否则影响弹窗关闭
     */
    click?: () => void;

    /**
     * 动作项颜色
     */
    color?: string;
    /**
     * 动作项移入时颜色
     */
    hoverColor?: string;

    // 后期支持图标

    // 后期支持子的动作项
}