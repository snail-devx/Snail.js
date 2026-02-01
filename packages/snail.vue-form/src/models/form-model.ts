//#region ************************************* 表单通用数据结构 ***********************************

import { FieldContainerOptions, FieldContainerEvents, FieldLocation, FieldOptions, FieldStatusOptions, FieldContainerHook } from "./field-model";

//#region ************************************* 表单设计器数据结构 *************************************
/**
 * 表单设计时配置选项
 */
export type FormDesignOptions = Omit<FieldContainerOptions, "values"> & {
    /**
     * 容器栅格列数
     * - layout 为 form 时生效；约束每行最多显示几个字段，一个字段一列
     * - 默认值 2；即一行最多可渲染两个字段
     * - 单个字段可通过 width 属性占用多列;渲染时，对字段进行流式布局渲染；
     * - 不建议值特别大
     */
    readonly columns?: 1 | 2 | 3 | 4;
    /**
     * 新建字段的默认栅格列跨度
     * - layout 为 form 时生效
     * - 表示字段在表单中默认占用的列数（基于 columns 栅格系统）
     * - 取值范围：1 ～ columns（例如 columns=4 时，建议 1～4）
     * - 若未指定，column/2
     */
    readonly defaultFieldSpan?: number;

    /**
     * 表单设计时钩子
     */
    readonly hook?: Partial<FormDesignHook>;
}
/**
 * 表单设计时钩子
 * - 用于在设计时干预字段操作（添加、复制、移除、移动等）
 * - 返回 false 表示阻止操作；返回 true / undefined / void 表示允许操作
 */
export type FormDesignHook = FieldContainerHook;

/**
 * 表单设计时事件
 */
export type FormDesignEvents = {
    /**
     * 表单渲染完成
     * - 所有显示字段渲染完成
     * @param handle 表单设计时句柄
     */
    rendered: [handle: IFormDesignHandle];
    /**
     * 表单配置改变时
     * - 在添加、删除、移动字段时触发
     * - 在修改字段配置时触发
     * @param fields 新的字段配置
     */
    change: [fields: FieldOptions<any>[]];
}
/**
 * 表单设计时句柄
 */
export interface IFormDesignHandle {
    /**
     * 添加字段
     * - 成功时 resolve；失败时 reject 并携带错误信息
     * @param fields 要添加的字段集合
     * @param location 字段位置信息，要把字段添加到哪个字段容器下，不传入则添加到顶级表单中
     * @returns true 验证成功，否则报错失败原因
     */
    addFields(fields: FieldOptions<any>[], location?: FieldLocation): Promise<boolean>;
    /**
     * 获取已配置的字段
     * - 成功时 resolve；失败时 reject 并携带错误信息
     * @param location 字段位置信息，不传入则从顶级表单中取字段
     * @returns 字段配置集合，若失败则报错，如某些字段配置不完整
     */
    getFields(location?: FieldLocation): Promise<FieldOptions<any>[]>;
}
//#endregion

//#region ************************************* 表单渲染器数据结构 *************************************
/**
 * 表单渲染配置选项
 * - 负责表单运行时、预览模式渲染
 */
export type FormRenderOptions = FieldContainerOptions & {
    /**
     * 表单字段值
     * - key为字段id，value为具体的字段值
     */
    readonly values?: Readonly<Record<string, any>>;

    /**
     * 表单栅格列数
     * - 约束每行最多显示的网格数量
     * - 默认值 4；即一行最多可渲染四个字段
     * - 单个字段可通过 width 属性占用多列;渲染时，对字段进行流式布局渲染；
     */
    readonly columns?: 1 | 2 | 4 | 6;
    /**
     * 渲染模式
     * - runtime: 正常运行时（默认值），用户可编辑、提交
     * - preview: 静态预览，所有字段强制只读，隐藏操作控件（如删除/移动按钮）
     * - 未来可扩展 print 等模式
     */
    readonly mode?: "runtime" | "preview";
}
/**
 * 表单渲染器事件
 */
export type FormRenderEvents = FieldContainerEvents;
//#endregion