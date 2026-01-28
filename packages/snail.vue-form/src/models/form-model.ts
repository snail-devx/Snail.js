//#region ************************************* 表单通用数据结构 ***********************************

import { ReadonlyOptions } from "snail.vue";
import { ControlOptions } from "./control-model";
import { FieldActionOptions, FieldChangeEvent, FieldLocation, FieldOptions, FieldStatusOptions } from "./field-model";

/**
 * 接口：表单上下文
 */
export interface IFormContext {
    /**
     * 使用表单的模式
     * - runtime: 正常运行时（默认值），用户可编辑、提交
     * - design: 设计时，所有字段只读不可编辑，显示【复制】、【删除】等操作控件，点击字段激活字段配置
     * - preview: 静态预览，所有字段强制只读，隐藏操作控件（如删除/移动按钮）
     */
    mode: "runtime" | "design" | "preview";
}

/**
 * 表单基础配置选项
 */
export type FormBaseOptions = {
    /**
     * 表单id
     * - 用于日志、埋点、多表单区分
     * - 不传入，则内部自动分配
     */
    readonly id?: string;
    /**
     * 表单名称
     * - 用于日志、埋点、多表单区分
     */
    readonly name?: string;

    /**
     * 表单支持的控件描述符集合
     * - 用于将字段类型（如 'text', 'select'）映射到对应的渲染组件
     * - 不传入，则使用内置 DEFAULT_ControlRegistery 仓库注册组件
     */
    readonly controls?: ControlOptions[];
    /**
     * 已有的字段配置列表
     * - 定义表单中需要渲染的字段及其初始值、规则等
     */
    readonly fields?: FieldOptions<any>[];
    /**
     * 表单栅格列数
     * - 约束每行最多显示的网格数量（如 12 列栅格系统）
     * - 默认值 4；即一行最多可渲染四个字段
     * - 单个字段可通过 width 属性占用多列;渲染时，对字段进行流式布局渲染；
     */
    readonly columns?: 1 | 2 | 4 | 6 | 8 | 10 | 12;
}
//#endregion

//#region ************************************* 表单设计器数据结构 *************************************
/**
 * 表单设计器配置选项
 */
export type FormDesignerOptions = FormBaseOptions & {
    /**
     * 新建字段的默认栅格列跨度
     * - 表示字段在表单中默认占用的列数（基于 columns 栅格系统）
     * - 取值范围：1 ～ form.columns（例如 columns=12 时，建议 1～12）
     * - 若未指定，则默认 1 ～ columns/2 ，最小值1
     */
    defaultFieldSpan?: number;
}
/**
 * 表单设计器钩子
 * - 用于在设计时干预字段操作（添加、复制、移除、移动等）
 * - 返回 false 表示阻止操作；返回 true / undefined / void 表示允许操作
 */
export type FormDesignerHook = {
    /**
     * 添加字段时
     * @param field 要添加的字段，可修改字段属性，如调整字段id等等
     * @param parent 所属父级字段信息，无则表示为顶级字段
     * @returns false 阻止添加；其余值允许
     */
    addField(field: FieldOptions<any>, parent?: FieldOptions<any>): boolean | undefined;
    /**
    * 复制字段时
    * @param field 要复制的字段
     * @param parent 所属父级字段信息，无则表示为顶级字段
    * @returns false 阻止复制；其余值允许复制，然后执行添加字段逻辑
    */
    copyField(field: FieldOptions<any>, parent?: FieldOptions<any>): boolean | undefined;
    /**
     * 移除字段
     * @param field 要删除的字段
     * @param parent 所属父级字段信息，无则表示为顶级字段
     * @returns false 阻止删除；其余值允许
     */
    removeField(field: FieldOptions<any>, parent?: FieldOptions<any>): boolean | undefined;
    /**
     * 移动字段时
     * - 支持在容器间移动（如从顶级移入容器，或容器间迁移）
     * @param field 要移动的字段
     * @param from 原父级字段信息，无则表示为顶级字段
     * @param to 新的父级字段信息，无则表示为顶级字段
     * @returns false 阻止移动；其余值允许移动
     */
    moveField(field: FieldOptions<any>, from: FieldOptions<any> | undefined, to: FieldOptions<any> | undefined): boolean | undefined;
}
/**
 * 表单设计时句柄
 */
export type FormDesignerHandle = {
    /**
     * 添加字段
     * @param fields 
     */
    addFields(...fields: FieldOptions<any>[]): Promise<boolean>;
    /**
     * 获取已配置的字段
     * @returns 字段配置集合，若失败则报错，如某些字段配置不完整
     */
    getFields(): Promise<FieldOptions<any>[]>;
}
/**
 * 表单设计时事件
 */
export type FormDesignerEvents = {
    /**
     * 表单渲染完成
     * - 所有显示字段渲染完成
     */
    rendered: [];
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
 * 表单渲染器配置选项
 */
export type FormRendererOptions = FormBaseOptions & ReadonlyOptions & {
    /**
     * 渲染模式
     * - runtime: 正常运行时（默认值），用户可编辑、提交
     * - preview: 静态预览，所有字段强制只读，隐藏操作控件（如删除/移动按钮）
     * - 未来可扩展 print 等模式
     */
    mode?: "runtime" | "preview";
}

/**
 * 表单渲染器句柄
 */
export type FormRendererHandle = {
    /**
     * 验证表单
     * - 验证所有字段是否有效
     * - 成功时 resolve；失败时 reject 并携带错误信息，如传入值验证不通过
     * @returns true 验证成功，否则报错失败原因
     */
    validates(): Promise<boolean>;
    /**
     * 验证指定字段
     * @param fieldId  字段id
     * @param location 字段所在位置（在父级容器中的位置），不传则为顶级字段
     * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
     * @returns true 验证成功，否则报错失败原因
     */
    validate(fieldId: string, location?: FieldLocation, traces?: FieldActionOptions[]): Promise<boolean>;

    /**
     * 获取表单值
     * - 成功时 resolve；失败时 reject 并携带错误信息，如验证失败信息
     * @returns 字段值，key为字段id，value为对应的字段值
     */
    getValues(): Promise<Record<string, any>>;
    /**
     * 获取指定字段值
     * - 成功时 resolve；失败时 reject 并携带错误信息，如字段验证不通过
     * @param fieldId 字段id
     * @param location 字段所在位置（在父级容器中的位置），不传则为顶级字段
     * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
     * @returns 当前字段值
     */
    getValue<T>(fieldId: string, location?: FieldLocation, traces?: FieldActionOptions[]): Promise<T>;
    /**
     * 设置指定字段值
     * - 成功时 resolve；失败时 reject 并携带错误信息，如传入值验证不通过
     * @param fieldId 字段id
     * @param value 新的字段值
     * @param location 字段所在位置（在父级容器中的位置），不传则为顶级字段
     * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
     * @returns true 设置成功，否则报错失败原因
     */
    setValue<T>(fieldId: string, value: T, location?: FieldLocation, traces?: FieldActionOptions[]): Promise<boolean>;

    /**
     * 获取字段状态
     * @param fieldId  字段id
     * @param location 字段所在位置（在父级容器中的位置），不传则为顶级字段
     * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
     * @returns 字段状态
     */
    getStatus(fieldId: string, location?: FieldLocation, traces?: FieldActionOptions[]): FieldStatusOptions;
    /**
     * 设置字段状态
     * @param fieldId  字段id
     * @param status 新的状态字段
     * @param location 字段所在位置（在父级容器中的位置），不传则为顶级字段
     * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
     * @returns true 设置成功，否则报错失败原因
     */
    setStatus(fieldId: string, status: Partial<FieldStatusOptions>, location?: FieldLocation, traces?: FieldActionOptions[]): Promise<boolean>;

    /**
     * 刷新字段
     * - 使用最新的字段配置重建 DOM 或虚拟节点
     * - 成功时 resolve；失败时 reject 并携带错误信息
     * @param field 完整字段配置
     * @param location 字段所在位置（在父级容器中的位置），不传则为顶级字段
     * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
     * @returns true 设置成功，否则报错失败原因
     */
    refresh(field: FieldOptions<any>, location?: FieldLocation, traces?: FieldActionOptions[]): Promise<boolean>;
}

/**
 * 表单渲染器事件
 * - 仅针对运行时渲染，设计时使用 FormDesignEvents
 */
export type FormRendererEvents = {
    /**
     * 表单渲染完成
     * - 所有显示字段渲染完成
     */
    rendered: [];

    /**
     * 字段渲染完成
     * @param field 当前渲染完成的字段
     * @param event 事件详细信息（父级字段、追踪信息）
     */
    fieldRendered: [field: FieldOptions<any>, event: FieldChangeEvent<void>];
    /**
     * 字段值变更事件
     * - 在用户交互或程序赋值导致字段值变化后触发（新旧值不同）
     * @param field 变更值的字段
     * @param event 事件详细信息（新旧值、父级字段、追踪信息）
     */
    fieldValueChange: [field: FieldOptions<any>, event: FieldChangeEvent<any>];
    /**
     * 状态变化事件
     * - 当字段的 required/readonly/visible 状态发生变化时触发
     * - 典型用途：动态控制 UI 显隐、校验规则更新
     * @param field 改变值的字段
     * @param event 事件详细信息（新旧状态、父级字段、追踪信息）
     */
    fieldStatusChange: [field: FieldOptions<any>, event: FieldChangeEvent<FieldStatusOptions>];
}
//#endregion