import { ComponentBindOptions, ComponentOptions, EventsType, ReadonlyOptions } from "snail.vue";
import { ControlOptions } from "./control-model";
import { readonly, Ref, ShallowRef } from "vue";

/**
 * 字段配置选项
 */
export type FieldOptions<Settings extends Record<string, any>> = Partial<FieldStatusOptions> & {
    /**
     * 字段id；确保唯一
     */
    id: string;
    /**
     * 控件类型；唯一
     */
    type: string;
    /**
     * 字段标题
     */
    title: string;
    /**
     * 字段宽度
     * - 占用表单行的列数
     */
    width: number;

    /** 继承下来的属性
     *  1、FieldStatusOptions
     *      required        是否必填
     *      readonly        是否只读
     *      hidden          是否显示
     */

    /**
     * 字段默认值
     */
    value?: any;
    /**
     * 字段的自定义配置
     */
    settings?: Settings;
    /**
     * 字段为空时的提示语
     * - 具体是否渲染，取决于字段渲染组件逻辑
     */
    placeholder?: string;
    /**
     * 字段辅助说明文字
     * - 渲染到字段输入等下面，用于辅助说明此字段的用途
     * - 具体是否渲染，取决于字段渲染组件逻辑
     */
    description?: string;
}
/**
 * 字段状态配置选项
 */
export type FieldStatusOptions = {
    /**
     * 字段是否必填
     */
    required: boolean;
    /**
     * 是否只读
     * - true 时，为只读状态
     */
    readonly: boolean;
    /**
     * 是否禁用
     * - 暂时不放开
    disabled?: boolean;
     */
    /**
     * 是否隐藏
     * - 默认为false；显式指定为true时，字段不可见
     * - 初期想用visible/show，但作Vue组件属性时，bool类型不传值会自动默认false，和初衷不符
     */
    hidden: boolean;
}

/**
 * 字段在容器中的位置信息
 */
export type FieldLocation = {
    /**
     * 父级字段Id
     */
    readonly parentFieldId: string;
    /**
      * 行索引位置
      * - 当字段位于可重复容器（如动态表格、列表）中时，表示其所在行索引
      * - 默认为 0（单实例字段）
      */
    readonly rowIndex?: number;
};

/**
 * 字段相关动作配置选项
 * - 用于字段联动、值/状态更新等场景，定位字段信息
 * - 记录字段动作上游动作链，实现执行链路追踪，从而判断死循环
 */
export type FieldActionOptions = Partial<FieldLocation> & {
    /**
     * 操作字段Id
     */
    readonly fieldId: string;
    /**
     * 动作值，具体执行什么动作
     * - "render"：渲染字段
     * - "validate"：验证字段
     * - "value": 修改字段值
     * - "status": 修改字段状态（required/readonly/hidden）
     */
    readonly action: "render" | "validate" | "value" | "status";
    /**
     * 值改变模式
     * - manual 手工输入触发的改变
     * - code 代码设置值触发的改变
     */
    readonly mode: "manual" | "code";

    /** 继承属性
     *  1、FieldLocation
     *      parentFieldId   父级字段id
     *      rowIndex        行索引位置
     */
}

/**
 * 字段渲染配置选项
 * - 约束渲染一个字段需要的相关信息
 */
export type FieldRenderOptions<Settings, Value> = {
    /**
     * 要渲染的字段
     */
    readonly field: FieldOptions<Settings>;
    /**
     * 字段状态，响应式对象
     */
    readonly status: FieldStatusOptions;
    /**
     * 字段值，响应式对象
     */
    readonly value: Value;
}

/**
 * 接口：字段句柄
 * - 用于进行字段操作，如取值、验证、渲染等等、、、
 * - 由字段的具体渲染控件对外暴露
 */
export interface IFieldHandle {
    /**
     * 验证字段
     * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
     * @returns true 验证成功，否则报错失败原因
     */
    validate(traces: ReadonlyArray<FieldActionOptions>): Promise<boolean>;
    /**
     * 获取字段值
     * - 成功时 resolve；失败时 reject 并携带错误信息，如字段验证不通过
     * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
     * @returns 当前字段值
     */
    getValue<T>(traces?: ReadonlyArray<FieldActionOptions>): Promise<T>;
    /**
     * 设置指定字段值
     * - 成功时 resolve；失败时 reject 并携带错误信息，如传入值验证不通过
     * @param value 新的字段值
     * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
     * @returns true 设置成功，否则报错失败原因
     */
    setValue<T>(value: T, traces?: ReadonlyArray<FieldActionOptions>): Promise<boolean>;
    /**
     * 获取字段状态
     * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
     * @returns 字段状态
     */
    getStatus(traces?: ReadonlyArray<FieldActionOptions>): FieldStatusOptions;
    /**
     * 设置字段状态
     * @param status 新的状态字段
     * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
     * @returns true 设置成功，否则报错失败原因
     */
    setStatus(status: Partial<FieldStatusOptions>, traces?: ReadonlyArray<FieldActionOptions>): Promise<boolean>;
};

/**
 * 字段事件
 * - 由字段的具体渲染控件对外通知字段容器
 */
export type FieldEvents = {
    /**
     * 字段渲染完成
     * @param handle 字段句柄
     */
    rendered: [handle: IFieldHandle];
    /**
     * 字段值变更
     * - 在用户交互或程序赋值导致字段值变化后触发（新旧值不同）
     * @param newValue 新的字段值
     * @param oldValue 旧的字段值
     * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
     */
    valueChange: [newValue: any, oldValue: any, traces?: ReadonlyArray<FieldActionOptions>];
    /**
     * 状态变化
     * - 当字段的 required/readonly/hidden 状态发生变化时触发
     * - 典型用途：动态控制 UI 显隐、校验规则更新
     * @param newStatus 新的字段状态
     * @param oldStatus 旧的字段状态
     * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
     */
    statusChange: [newStatus: FieldStatusOptions, oldStatus: FieldStatusOptions, traces?: ReadonlyArray<FieldActionOptions>];
}
/**
 * 字段改变事件对象
 * - 约束字段父级信息；附带追踪信息
 * - 给表单渲染器使用
 * - 字段值、状态等改变时，传递新旧变化
 */
export type FieldChangeEvent<T> = (T extends (void | never | null | undefined) ? {} : {
    /**
     * 新值
     */
    readonly newValue: T;
    /**
     * 旧值
     */
    readonly oldValue?: T;
}) & {
    /**
     * 字段所在位置（在父级容器中的位置），不传则为顶级字段
     */
    readonly location?: FieldLocation;

    /**
     * 字段追踪信息
     * - 响应事件需要操作字段时，传递下去，从而避免调用死循环
     */
    readonly traces: ReadonlyArray<FieldActionOptions>;
}

//#region ************************************* 字段容器相关数据结构 *************************************
/**
 * 接口：字段全局上下文
 * - 从顶级容器到子容器，到字段之间共用一个上下文对象
 * - 约束容器-字段之间的共享信息，通用方法、、、
 */
export interface IFieldGlobalContext {
    /**
     * 全局标记值
     * - 如一个表单下，可能存在多个字段容器，此时所有字段容器共享一个全局标记值，用于实现字段在容器间拖拽
     */
    readonly global: string;
    /**
     * 是否处于只读状态
     */
    readonly readonly: boolean;
    /**
     * 使用模式
     * - runtime: 正常运行时（默认值），用户可编辑、提交
     * - design: 设计时，所有字段只读不可编辑，显示【复制】、【删除】等操作控件，点击字段激活字段配置
     * - preview: 静态预览，所有字段强制只读，隐藏操作控件（如删除/移动按钮）
     */
    readonly mode: "runtime" | "design" | "preview";

    /**
     * 布局方式
     * - form：表单布局(默认值)
     * - table: 表格布局
     */
    readonly layout: "form" | "table";
    /**
     * 容器栅格列数
     * - layout 为 form 时生效；约束每行最多显示几个字段，一个字段一列
     * - 默认值 2；即一行最多可渲染两个字段
     * - 单个字段可通过 width 属性占用多列;渲染时，对字段进行流式布局渲染；
     * - 不建议值特别大
     */
    readonly columns: 1 | 2 | 3 | 4;
    /**
     * 新建字段的默认栅格列跨度
     * - layout 为 form 时生效
     * - 表示字段在表单中默认占用的列数（基于 columns 栅格系统）
     * - 取值范围：1 ～ columns（例如 columns=4 时，建议 1～4）
     * - 若未指定，column/2
     */
    readonly defaultFieldSpan: number;

    /**
     * 字段容器钩子
     */
    readonly hook: Partial<FieldContainerHook>;
    /**
     * 支持使用的控件集合
     */
    readonly controls: ReadonlyArray<ControlOptions>;
    /**
     * 基于控件类型，获取控件对象
     * @param type 控件类型
     */
    getControl(type: string): ControlOptions | undefined;
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
    // /**
    //  * 字段容器上下文
    //  * - 传递到容器下的子字段中使用
    //  */
    // readonly context: IFieldContainerContext;

    /**
     * 构建字段渲染选项
     * @param field 
     * @returns 字段用什么组件渲染，传递的属性参数，绑定监听事件等
     */
    buildFieldRenderOptions(field: FieldOptions<any>): ComponentOptions & ComponentBindOptions<FieldRenderOptions<any, any>> & EventsType<FieldEvents>;

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
 * 接口：字段容器上下文
 * - 每个容器独享自己的下文；管理容器下的字段相关信息
 */
export interface IFieldContainerContext {
    // /**
    //  * 容器id
    //  */
    // readonly containerId: string;
    // /**
    //  * 容器是否只读；若顶级容器只读，则自身强制只读
    //  */
    // readonly readonly: boolean;
    // /**
    //  * 容器的父级字段
    //  * - 在group等容器类字段时，此值为group字段自身
    //  */
    // readonly parent: FieldOptions<any> | undefined;
    // /**
    //  * 已有的字段集合
    //  * - 在group等容器类字段时，此值为group字段的子字段
    //  */
    // readonly fields: Array<FieldOptions<any>>;

    // /**
    //  * 构建字段
    //  * - 全新添加字段、当前容器复制字段时
    //  * - 内部需要执行容器hook判断是否可添加处理
    //  * @param type 新字段的类型，全新添加时生效
    //  * @param originField 原始字段，复制字段时传入作为模板使用
    //  * @returns 新的字段对象
    //  */
    // buildField(type: string, originField?: FieldOptions<any>): FieldOptions<any>;
    // /**
    //  * 获取字段值
    //  * @param fieldId 字段id
    //  * @param defaultValue 若无字段值，则以此值构建字段
    //  * @returns 字段值ref响应对象
    //  */
    // getValue<Value>(fieldId: string, defaultValue: Value): ShallowRef<Value>;
    // /**
    //  * 获取字段状态
    //  * @param fieldId 字段Id
    //  * @returns 字段状态ref响应对象
    //  */
    // getStatus(fieldId: string): Ref<FieldStatusOptions>;
}

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
     * 容器在parent中行索引位置，group等字段类容器，允许创建多条记录
     */
    readonly rowIndex?: number;

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
 * 接口：字段容器 句柄
 * - 一个字段容器中，可包含多个字段
 * - 主要约束运行时渲染相关句柄
 */
export interface IFieldContainerHandle {
    /**
     * 添加字段
     * - 仅在设计时生效
     * - 成功时 resolve；失败时 reject 并携带错误信息
     * @param field 要添加字段
     * @param location 字段位置信息，要把字段添加到哪个字段容器下，不传入则添加到顶级表单中
     * @returns true 验证成功，否则报错失败原因
     */
    addField(field: FieldOptions<any>, location?: FieldLocation): Promise<boolean>;
    /**
     * 获取已配置的字段
     * - 仅在设计时生效
     * - 成功时 resolve；失败时 reject 并携带错误信息
     * @param location 字段位置信息，不传入则从顶级表单中取字段
     * @returns 字段配置集合，若失败则报错，如某些字段配置不完整
     */
    getFields(location?: FieldLocation): Promise<FieldOptions<any>[]>;

    /**
     * 刷新字段
     * - 设计时被指改变后，重新刷新配置，运行时基于规则重新调整字段适配时渲染
     * - 使用最新的字段配置重建 DOM 或虚拟节点，直接使用v-if做一下重新渲染
     * - 成功时 resolve；失败时 reject 并携带错误信息
     * @param field 完整字段配置
     * @param location 字段所在位置（在父级容器中的位置），不传则为顶级字段
     * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
     * @returns true 设置成功，否则报错失败原因
     */
    refresh(field: FieldOptions<any>, location?: FieldLocation, traces?: ReadonlyArray<FieldActionOptions>): Promise<boolean>;
    /**
     * 验证所有字段
     * - 设计时字段配置是否有效；运行时验证字段值是否合法
     * - 成功时 resolve；失败时 reject 并携带错误信息，如传入值验证不通过
     * @returns true 验证成功，否则报错失败原因
     */
    validates(): Promise<boolean>;
    /**
     * 验证指定字段
     * - 设计时字段配置是否有效；运行时验证字段值是否合法
     * - 成功时 resolve；失败时 reject 并携带错误信息，如字段验证不通过
     * @param fieldId  字段id
     * @param location 字段所在位置（在父级容器中的位置），不传则为顶级字段
     * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
     * @returns true 验证成功，否则报错失败原因
     */
    validate(fieldId: string, location?: FieldLocation, traces?: ReadonlyArray<FieldActionOptions>): Promise<boolean>;

    /**
     * 获取所有字段值
     * - 仅在运行时生效
     * - 成功时 resolve；失败时 reject 并携带错误信息，如验证失败信息
     * @returns 字段值，key为字段id，value为对应的字段值
     */
    getValues(): Promise<Record<string, any>>;
    /**
     * 获取指定字段值
     * - 仅在运行时生效
     * - 成功时 resolve；失败时 reject 并携带错误信息，如字段验证不通过
     * @param fieldId 字段id
     * @param location 字段所在位置（在父级容器中的位置），不传则为顶级字段
     * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
     * @returns 当前字段值
     */
    getValue<T>(fieldId: string, location?: FieldLocation, traces?: ReadonlyArray<FieldActionOptions>): Promise<T>;
    /**
     * 设置指定字段值
     * - 仅在运行时生效
     * - 成功时 resolve；失败时 reject 并携带错误信息，如传入值验证不通过
     * @param fieldId 字段id
     * @param value 新的字段值
     * @param location 字段所在位置（在父级容器中的位置），不传则为顶级字段
     * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
     * @returns true 设置成功，否则报错失败原因
     */
    setValue<T>(fieldId: string, value: T, location?: FieldLocation, traces?: ReadonlyArray<FieldActionOptions>): Promise<boolean>;

    /**
     * 获取字段状态
     * - 仅在运行时生效
     * @param fieldId  字段id
     * @param location 字段所在位置（在父级容器中的位置），不传则为顶级字段
     * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
     * @returns 字段状态
     */
    getStatus(fieldId: string, location?: FieldLocation, traces?: ReadonlyArray<FieldActionOptions>): FieldStatusOptions;
    /**
     * 设置字段状态
     * - 仅在运行时生效
     * @param fieldId  字段id
     * @param status 新的状态字段
     * @param location 字段所在位置（在父级容器中的位置），不传则为顶级字段
     * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
     * @returns true 设置成功，否则报错失败原因
     */
    setStatus(fieldId: string, status: Partial<FieldStatusOptions>, location?: FieldLocation, traces?: ReadonlyArray<FieldActionOptions>): Promise<boolean>;
}
/**
 * 字段容器事件
 * - 主要约束运行时渲染相关事件
 */
export type FieldContainerEvents = {
    /**
     * 表单渲染完成
     * - 所有显示字段渲染完成
     * @param handle 表单渲染器句柄
     */
    rendered: [handle: IFieldContainerHandle];

    /**
     * 容器配置发生变化
     * - 添加、删除、修改字段配置等均会触发
     * - 仅在设计时生效
     */
    settingChange: [fields: FieldOptions<any>[]];

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
     * - 当字段的 required/readonly/hidden 状态发生变化时触发
     * - 典型用途：动态控制 UI 显隐、校验规则更新
     * @param field 改变值的字段
     * @param event 事件详细信息（新旧状态、父级字段、追踪信息）
     */
    fieldStatusChange: [field: FieldOptions<any>, event: FieldChangeEvent<FieldStatusOptions>];
}
//#endregion