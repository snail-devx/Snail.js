/**
 * 字段设置相关配置选项
 */

import { ReadonlyOptions } from "snail.vue";
import { FieldOptions } from "./field-base";
import { FieldContainerLocation, IFieldContainerHandle } from "./field-container";

/**
 * 字段设置配置选项
 * - 在其他位置不合适，放到这里
 */
export type FieldSettingOptions<Settings> = Required<ReadonlyOptions> & {
    /**
     * 字段信息
     */
    field: FieldOptions<Settings>;
    /**
     * 字段所属容器
     */
    container: IFieldContainerHandle;
}

/**
 * 字段设置句柄
 * - 用于激活、关闭、字段设置面板
 */
export interface IFieldSettingHandle {
    /**
     * 获取当前激活状态唯一标记
     * - 用于唯一标记激活面板
     */
    getActiveKey(): string;
    /**
     * 获取激活字段信息
     * @requires 字段对象，字段所属容器对象
     */
    getactiveField(): { field: FieldOptions<any>, container: FieldContainerLocation } | undefined;
    /**
     * 是否是激活字段
     * @param field 字段
     * @param container 字段所属容器，顶级字段是容器传undefined
     * @returns true为激活字段
     */
    isActiveField(field: FieldOptions<any>, container: FieldContainerLocation | undefined): boolean;
    /**
     * 激活字段，打开此字段的设置面板
     * @param field 字段
     * @param container 字段所属容器，顶级字段是容器传undefined
     */
    activateField(field: FieldOptions<any>, container: FieldContainerLocation | undefined);
    /**
     * 取消激活字段
     */
    deactivateField();
}

//#region ************************************* 字段属性设置相关配置选项 *************************************
/**
 * 指定属性设置的配置选项
 * - 作为属性设置的基类存在
 */
export type FieldPropertySettingOptions<Value> = Required<ReadonlyOptions> & {
    /**
     * 属性标题
     */
    title: string;
    /**
     * 属性值
     */
    value: Value;
    /**
     * 异常信息
     * - 外部ref传入，进行实时渲染
     */
    error?: string;
}

/**
 * 字段文本类属性设置的配置选项
 */
export type FieldTextPropertySettingOptions = FieldPropertySettingOptions<string> & {
    /**
     * 是否为多行文本
     */
    multiple: boolean;
}
/**
 * 字段数值类属性设置的配置选项
 */
export type FieldNumberPropertySettingOptions = FieldPropertySettingOptions<number> & {
    /**
     * 精度，保留几位小数
     */
    precision: number
}
//#endregion