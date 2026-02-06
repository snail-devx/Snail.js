/**
 * 表单容器 数据结构
 * 1、表单设计器、渲染器作为 表单容器的具体对外组件
 */

import { RunResult } from "snail.core";
import { FieldActionOptions, FieldLocation, FieldOptions, FieldStatusOptions } from "./field-base";
import { FieldContainerEvents, FieldContainerHook, FieldContainerLocation, FieldContainerOptions } from "./field-container";
import { IFieldGlobalContext } from "./field-share";

//#region ************************************* 表单通用数据结构 ***********************************
/**
 * 接口：表单运行时句柄
 */
export interface IFormHande {
    /**
     * 添加字段
     * - 仅在设计时生效
     * - 成功时 resolve；失败时 reject 并携带错误信息
     * @param field 要添加字段
     * @param parentFieldId 添加到哪个父级字段Id中，顶级表单中时undefined；如group组件子容器，则传入子group组件字段id
     * @returns 操作结果；`.success`是否成功：true则添加成功；false则`.reason`失败原因
     */
    addField(field: FieldOptions<any>, parentFieldId?: string): Promise<RunResult>;
    /**
     * 获取表单所有字段
     * - 仅在设计时生效；验证字段配置是否正确
     * @returns 操作结果；`.success`是否成功：true则`.data`为字段信息集合；false则`.reason`失败原因
     */
    getFields(): Promise<RunResult<FieldOptions<any>[]>>;
    /**
     * 获取指定字段信息
     * - 设计时，验证字段配置是否正确，不正确则返回失败
     * - 其他模式，直接返回字段无需任何验证
     * @param location 字段位置（string时为`fieldId`)，包含`fieldId`、`parentFieldId`；顶级字段仅需传入 `fieldId` 即可，
     * @param parentFieldId 添加到哪个父级字段Id中，顶级表单中时undefined；如group组件子容器，则传入子group组件字段id
     * @returns 操作结果；`.success`是否成功：true则`.data`为字段信息；false则`.reason`失败原因
     */
    getField(location: string | Pick<FieldLocation, "fieldId" | "parentFieldId">): Promise<RunResult<FieldOptions<any>>>;

    /**
     * 获取所有字段值
     * - 运行时，返回字段实际值
     * - 其他模式，返回字段配置的默认值；
     * @param validate 是否验证，传入true时，需要验证字段值是否正确（如必填验证，长度验证、、、）
     * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
     * @returns 操作结果；`.success`是否成功：true则`.data`为字段值记录；false则`.reason`失败原因
     */
    getValues(validate: boolean, traces?: ReadonlyArray<FieldActionOptions>): Promise<RunResult<Record<string, any>>>;
    /**
     * 获取指定字段值
     * - 仅在运行时生效
     * @param location 字段位置（string时为`fieldId`)，包含`fieldId`、`parentFieldId`、`rowIndex`；顶级字段仅需传入 `fieldId` 即可，
     * @param validate 是否验证，传入true时，需要验证字段值是否正确（如必填验证，长度验证、、、）
     * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
     * @returns 操作结果；`.success`是否成功：true则`.data`为字段值；false则`.reason`失败原因
     */
    getValue<T>(location: string | FieldLocation, validate: boolean, traces?: ReadonlyArray<FieldActionOptions>): Promise<RunResult<T>>;
    /**
     * 设置指定字段值
     * - 仅运行时生效，设计时若需要设置字段值，通过字段`.value`处理
     * - 设置值时需要进行值验证，若不符合要求则设置失败
     * @param location 字段位置（string时为`fieldId`)，包含`fieldId`、`parentFieldId`、`rowIndex`；顶级字段仅需传入 `fieldId` 即可，
     * @param value 新的字段值
     * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
     * @returns 操作结果；`.success`操作是否成功：true则设置成功；false则`.reason`失败原因
     */
    setValue<T>(location: string | FieldLocation, value: T, traces?: ReadonlyArray<FieldActionOptions>): Promise<RunResult>;

    /**
     * 获取指定字段状态
     * - 运行时返回字段实际状态
     * - 其他模式，返回字段配置状态
     * @param location 字段位置（string时为`fieldId`)，包含`fieldId`、`parentFieldId`、`rowIndex`；顶级字段仅需传入 `fieldId` 即可，
     * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
     * @returns 操作结果；`.success`是否成功：true则`.data`为字段状态；false则`.reason`失败原因
     */
    getStatus(location: string | FieldLocation, traces?: ReadonlyArray<FieldActionOptions>): RunResult<FieldStatusOptions>;
    /**
     * 设置指定字段状态
     * - 仅运行时生效；设计时若需要获取字段状态，直接取字段配置即可
     * @param location 字段位置（string时为`fieldId`)，包含`fieldId`、`parentFieldId`、`rowIndex`；顶级字段仅需传入 `fieldId` 即可，
     * @param status 新的状态字段
     * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
     * @returns 操作结果；`.success`操作是否成功：true则设置成功；false则`.reason`失败原因
     */
    setStatus(location: string | FieldLocation, status: Partial<FieldStatusOptions>, traces?: ReadonlyArray<FieldActionOptions>): RunResult;

    /**
     * 刷新字段
     * - 设计时被指改变后，重新刷新配置，运行时基于规则重新调整字段适配时渲染
     * - 使用最新的字段配置重建 DOM 或虚拟节点，直接使用v-if做一下重新渲染
     * @param location 字段位置（string时为`fieldId`)，包含`fieldId`、`parentFieldId`、`rowIndex`；顶级字段仅需传入 `fieldId` 即可，
     * @param field 完整字段配置
     * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
     * @returns 操作结果；`.success`操作是否成功：true则刷新成功；false则`.reason`失败原因
     */
    refresh(location: string | FieldLocation, field: FieldOptions<any>, traces?: ReadonlyArray<FieldActionOptions>): Promise<RunResult>;
}

/**
 * 表单字段布局配置选项
 */
export type FormFieldLayoutOptions = {
    /**
     * 字段宽度
     */
    width: number;
    /**
     * 是否显示
     */
    show: boolean;
    /**
     * 是否是当前行的最后一个字段
     */
    isRowLast: boolean;
    /**
     * 字段后面留白宽度，用于填充满当前行
     * - 仅在 isRowLast 为true时生效
     */
    blankWidthAfter: number
}
//#endregion

//#region ************************************* 表单设计器数据结构 *************************************
/**
 * 表单设计器配置选项
 */
export type FormDesignerOptions =
    Pick<IFieldGlobalContext, "controls" | "columns" | "defaultSpan"> &
    Pick<FieldContainerOptions, "readonly" | "fields"> & {
        /**
         * 表单设计时钩子
         */
        readonly hook?: FormDesignerHook;
    }
/**
 * 表单设计器钩子
 * - 用于在设计时干预字段操作（添加、复制、移除、移动等）
 * - 返回 false 表示阻止操作；返回 true / undefined / void 表示允许操作
 */
export type FormDesignerHook = FieldContainerHook;

/**
 * 表单设计时句柄
 */
export interface IFormDesignerHandle extends Pick<IFormHande, "addField" | "getFields" | "getField" | "refresh"> { };

/**
 * 表单设计时事件
 */
export type FormDesignerEvents = {
    /**
     * 表单渲染完成
     * - 所有显示字段渲染完成
     * @param handle 表单设计时句柄
     */
    rendered: [handle: IFormDesignerHandle];
    /**
     * 表单配置改变时
     * - 在添加、删除、移动字段时触发
     * - 在修改字段配置时触发
     * @param fields 新的字段配置
     */
    change: [fields: FieldOptions<any>[]];
}
//#endregion

//#region ************************************* 表单渲染器数据结构 *************************************
/**
 * 表单渲染配置选项
 * - 负责表单运行时、预览模式渲染
 */
export type FormRenderOptions =
    Pick<IFieldGlobalContext, "columns" | "controls"> &
    Pick<FieldContainerOptions, "readonly" | "fields" | "values"> & {
        /**
         * 渲染模式
         * - runtime: 正常运行时（默认值），用户可编辑、提交
         * - preview: 静态预览，所有字段强制只读，隐藏操作控件（如删除/移动按钮）
         * - 未来可扩展 print 等模式
         */
        readonly mode?: "runtime" | "preview";
    };

/**
 * 表单渲染句柄
 * - 用于表单渲染完成后，外部操作表单使用
 */
export interface IFormRenderHandle extends Pick<IFormHande, "getField"
    | "getValues" | "getValue" | "setValue" | "getStatus" | "setStatus"
    | "refresh"> { };

/**
 * 表单渲染器事件
 */
export type FormRenderEvents = {
    /**
     * 表单渲染完成
     * - 所有显示字段渲染完成
     * @param handle 表单渲染器句柄
     */
    rendered: [handle: IFormRenderHandle];
} & Pick<FieldContainerEvents, "fieldRendered" | "valueChange" | "statusChange">;
//#endregion