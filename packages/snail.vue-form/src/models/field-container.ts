/**
 * 字段容器相关数据结构
 * - 管理一组字段的配置、状态、值、事件等
 */

import { IScope, RunResult } from "snail.core";
import { EmitterType, EventsType, ReadonlyOptions } from "snail.vue";
import { ControlOptions } from "./control-model";
import { FieldActionOptions, FieldChangeEvent, FieldEvents, FieldOptions, FieldStatusOptions, FieldLocation } from "./field-base";

/**
 * 字段容器配置选项
 */
export type FieldContainerOptions = {
    // /**
    //  * 容器id
    //  * - 用于日志、埋点、多表单区分
    //  * - 不传入，则内部自动分配
    //  */
    // readonly id?: string;
    // /**
    //  * 容器名称
    //  * - 用于日志、埋点、多表单区分
    //  */
    // readonly name?: string;

    /**
     * 容器归属的上级字段信息，顶级表单容器为null
     */
    readonly parent?: FieldOptions<any>;

    /**
     * 当前容器是否只读
     * - 需要注意的是，全局上下文上传递了只读为true，则此处即使设置为非只读，外部也应判定为只读
     */
    readonly readonly: boolean;
    /**
     * 容器中的字段配置
     * - 定义表单中需要渲染的字段及其初始值、规则等
     */
    readonly fields?: FieldOptions<any>[];
    /**
     * 容器中的字段值
     * - key为字段id，value为具体的字段值
     * - 设计时忽略，运行时渲染时生效
     */
    readonly values?: Readonly<Record<string, any>>;
}
/**
 * 接口：字段容器
 * - 管理此容器下字段集合
 * - 如字段是否渲染完了，维护字段句柄、字段状态等等
 * - 维护字段容器上下文
 */
export interface IFieldContainer {
    /**
     * 已有的字段集合
     * - 在group等容器类字段时，此值为group字段的子字段
     */
    readonly fields: Array<FieldOptions<any>>;
    /**
     * 字段容器句柄
     */
    readonly handle: IFieldContainerHandle;
    /**
     * 获取字段的唯一Key值
     * - 用于组件的`:key`属性，实现刷新渲染等功能
     * @param fieldId 
     * @returns
     */
    getFieldKey(fieldId: string): string;
    /**
     * 构建字段监听器
     * - 监听字段相关事件，并进行对外分发
     * @param field 
     * @returns 事件监听器对象
     */
    buildFieldMonitor(field: FieldOptions<any>): EventsType<FieldEvents>;
    /**
     * 字段是否应该显示
     * - 运行时根据实际值判断，设计时、预览等模式下始终显示
     * @param field 
     * @returns 显示返回true，否则false
     */
    isVisible(field: FieldOptions<any>): boolean;

    //  ------------------ 设计时：字段增删改查管理方法
    /**
     * 添加字段
     * - 仅设计时生效；执行hook判断是否能够添加
     * - 从控件列表添加字段时；从其他容器中移动过来时
     * @param type 字段类型
     * @param index 添加到哪个位置，不传入则追加到末尾
     * @param originField 原始模板字段，不传入则全新构建，否则复制此字段配置
     * @returns 添加是否成功
     */
    addField(type: string, index?: number, originField?: FieldOptions<any>): boolean;
    /**
     * 删除字段
     * - 仅设计时生效；执行hook判断是否能够删除
     * @param field 要删除的字段
     * @param index 字段所在位置
     * @returns 复制是否成功
     */
    deleteField(field: FieldOptions<any>, index: number): boolean;
    /**
     * 复制字段
     * - 仅设计时生效；执行hook判断是否能够复制
     * @param field 要赋值的模板字段
     * @param index 模板字段所在位置
     * @returns 复制是否成功
     */
    copyField(field: FieldOptions<any>, index: number): boolean;
    /**
     * 移动字段
     * - 仅设计时生效
     * @param oldIndex 字段旧的索引位置
     * @param newIndex 字段新的索引位置
     * @returns 复制是否成功
     */
    moveField(oldIndex: number, newIndex: number): boolean;
}
/**
 * 字段容器钩子函数
 * - 用于在设计时干预字段操作（添加、复制、移除、移动等）
 * - 返回 false 表示阻止操作；返回 true / undefined / void 表示允许操作
 */
export type FieldContainerHook = {
    /**
     * 添加字段时
     * @param field 要添加的字段，可修改字段属性，如调整字段id等等
     * @param parent 所属父级字段信息，无则表示为顶级字段
     * @returns false 阻止添加；其余值允许
     */
    addField?: (field: FieldOptions<any>, parent?: FieldOptions<any>) => boolean | undefined;
    /**
    * 复制字段时
    * @param field 要复制的字段
     * @param parent 所属父级字段信息，无则表示为顶级字段
    * @returns false 阻止复制；其余值允许复制，然后执行添加字段逻辑
    */
    copyField?: (field: FieldOptions<any>, parent?: FieldOptions<any>) => boolean | undefined;
    /**
     * 移除字段
     * @param field 要删除的字段
     * @param parent 所属父级字段信息，无则表示为顶级字段
     * @returns false 阻止删除；其余值允许
     */
    removeField?: (field: FieldOptions<any>, parent?: FieldOptions<any>) => boolean | undefined;
    /**
     * 移动字段时
     * - 支持在容器间移动（如从顶级移入容器，或容器间迁移）
     * @param field 要移动的字段
     * @param from 原父级字段信息，无则表示为顶级字段
     * @param to 新的父级字段信息，无则表示为顶级字段
     * @returns false 阻止移动；其余值允许移动
     */
    moveField?: (field: FieldOptions<any>, from: FieldOptions<any> | undefined, to: FieldOptions<any> | undefined) => boolean | undefined;
}
/**
 * 接口：字段容器 句柄
 * - 一个字段容器中，可包含多个字段
 * - 主要约束运行时渲染相关句柄
 */
export interface IFieldContainerHandle {
    /**
     * 添加字段
     * - 仅在设计时生效
     * @param field 要添加字段
     * @returns 操作结果；`.success`是否成功：true则添加成功；false则`.reason`失败原因
     */
    addField(field: FieldOptions<any>): Promise<RunResult>;
    /**
     * 获取所有字段
     * - 设计时，验证字段配置是否正确，不正确则返回失败
     * - 其他模式，直接返回字段无需任何验证
     * @returns 操作结果；`.success`是否成功：true则`.data`为字段信息集合；false则`.reason`失败原因
     */
    getFields(): Promise<RunResult<FieldOptions<any>[]>>;
    /**
     * 获取指定字段信息
     * - 设计时，验证字段配置是否正确，不正确则返回失败
     * - 其他模式，直接返回字段无需任何验证
     * @param fieldId 字段id
     * @returns 操作结果；`.success`是否成功：true则`.data`为字段信息；false则`.reason`失败原因
     */
    getField(fieldId: string): Promise<RunResult<FieldOptions<any>>>;
    /**
     * 验证指定字段的标题是否重复
     * @param fieldId 字段Id
     * @param title 要验证的标题
     * @returns 重复返回true，否则false
     */
    isDuplicateTitle(fieldId: string, title: string): boolean;

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
     * @param fieldId 字段id
     * @param validate 是否验证，传入true时，需要验证字段值是否正确（如必填验证，长度验证、、、）
     * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
     * @returns 操作结果；`.success`是否成功：true则`.data`为字段值；false则`.reason`失败原因
     */
    getValue<T>(fieldId: string, validate: boolean, traces?: ReadonlyArray<FieldActionOptions>): Promise<RunResult<T>>;
    /**
     * 设置指定字段值
     * - 仅运行时生效，设计时若需要设置字段值，通过字段`.value`处理
     * - 设置值时需要进行值验证，若不符合要求则设置失败
     * @param fieldId 字段id
     * @param value 新的字段值
     * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
     * @returns 操作结果；`.success`操作是否成功：true则设置成功；false则`.reason`失败原因
     */
    setValue<T>(fieldId: string, value: T, traces?: ReadonlyArray<FieldActionOptions>): Promise<RunResult>;

    /**
     * 获取指定字段状态
     * - 运行时返回字段实际状态
     * - 其他模式，返回字段配置状态
     * @param fieldId 字段id
     * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
     * @returns 操作结果；`.success`是否成功：true则`.data`为字段状态；false则`.reason`失败原因
     */
    getStatus(fieldId: string, traces?: ReadonlyArray<FieldActionOptions>): RunResult<FieldStatusOptions>;
    /**
     * 设置指定字段状态
     * - 仅运行时生效；设计时若需要获取字段状态，直接取字段配置即可
     * @param fieldId 字段id
     * @param status 新的状态字段
     * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
     * @returns 操作结果；`.success`操作是否成功：true则设置成功；false则`.reason`失败原因
     */
    setStatus(fieldId: string, status: Partial<FieldStatusOptions>, traces?: ReadonlyArray<FieldActionOptions>): RunResult;

    /**
     * 刷新字段
     * - 设计时被指改变后，重新刷新配置，运行时基于规则重新调整字段适配时渲染
     * - 使用最新的字段配置重建 DOM 或虚拟节点，直接使用v-if做一下重新渲染
     * @param fieldId 字段id
     * @param field 完整字段配置
     * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
     * @returns 操作结果；`.success`操作是否成功：true则刷新成功；false则`.reason`失败原因
     */
    refresh(fieldId: string, field: FieldOptions<any>, traces?: ReadonlyArray<FieldActionOptions>): Promise<RunResult>;
}

/**
 * 字段容器位置信息
 */
export type FieldContainerLocation = Pick<FieldLocation, "parentFieldId" | "rowIndex">;

/**
 * 字段容器事件
 * - 主要约束运行时渲染相关事件
 */
export type FieldContainerEvents = {
    /**
     * 容器渲染完成
     * - 所有字段完成渲染时触发
     * @param handle 表单渲染器句柄
     */
    rendered: [handle: IFieldContainerHandle];
    /**
     * 字段渲染完成
     * @param field 当前渲染完成的字段
     * @param event 事件详细信息（字段位置、追踪信息）
     */
    fieldRendered: [field: FieldOptions<any>, event: FieldChangeEvent<void>];

    /**
     * 配置改变，特指设计时容器中字段、字段配置改变
     * @param fields 当前表单的所有字段配置
     */
    configChange: [fields: FieldOptions<any>[]];
    /**
     * 字段值变更事件
     * - 在用户交互或程序赋值导致字段值变化后触发（新旧值不同）
     * @param field 变更值的字段
     * @param event 事件详细信息（新旧值、父级字段、追踪信息）
     */
    valueChange: [field: FieldOptions<any>, event: FieldChangeEvent<any>];
    /**
     * 状态变化事件
     * - 当字段的 required/readonly/hidden 状态发生变化时触发
     * - 典型用途：动态控制 UI 显隐、校验规则更新
     * @param field 改变值的字段
     * @param event 事件详细信息（新旧状态、父级字段、追踪信息）
     */
    statusChange: [field: FieldOptions<any>, event: FieldChangeEvent<FieldStatusOptions>];
}