/**
 * 字段基础数据结构
 */

import { RunResult, } from "snail.core";
import { EmitterType, ReadonlyOptions } from "snail.vue";

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
     * 字段id
     */
    readonly fieldId: string;

    /**
     * 父级字段Id
     * - 子字段时，传入所属父级字段id；如Group组件下的字字段时，parentFieldId为Group组件的字段Id
     * - 非子字段时为undefined
     */
    readonly parentFieldId: string | undefined;
    /**
      * 在父级字段的行索引位置
      * - 当字段位于可重复容器（如动态表格、列表）中时，表示其所在行索引
      * - 默认为 0（单实例字段）
      */
    readonly rowIndex: number | undefined;
};
/**
 * 字段相关动作配置选项
 * - 用于字段联动、值/状态更新等场景，定位字段信息
 * - 记录字段动作上游动作链，实现执行链路追踪，从而判断死循环
 */
export type FieldActionOptions = FieldLocation & {
    /** 继承属性
     *  1、FieldLocation
     *      fieldId         字段id
     *      parentFieldId   父级字段id
     *      rowIndex        行索引位置
     */

    /**
     * 动作值，具体执行什么动作
     */
    readonly action: "get-value" | "set-value" | "value-change" | "get-status" | "set-status";
    /**
     * 值改变模式
     * - manual 手工输入触发的改变
     * - code 代码设置值触发的改变
     */
    readonly mode: "manual" | "code";
}
/**
 * 接口：字段句柄
 * - 用于进行字段操作，如取值、验证、渲染等等、、、
 * - 由字段的具体渲染控件对外暴露
 */
export interface IFieldHandle {
    /**
     * 获取字段信息
     * - 设计时，验证字段配置是否正确，不正确则返回失败
     * - 其他模式，直接返回字段无需任何验证
     * @returns 操作结果；`.success`是否成功：true则`.data`为字段信息；false则`.reason`失败原因
     */
    getField(): Promise<RunResult<FieldOptions<any>>>;

    /**
     * 获取字段值
     * - 运行时，返回字段实际值
     * - 其他模式，返回字段配置的默认值；
     * @param validate 是否验证，传入true时，需要验证字段值是否正确（如必填验证，长度验证、、、）
     * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
     * @returns 操作结果；`.success`是否成功：true则`.data`为字段值；false则`.reason`失败原因
     */
    getValue<T>(validate: boolean, traces?: ReadonlyArray<FieldActionOptions>): Promise<RunResult<T>>;
    /**
     * 设置字段值
     * - 仅运行时生效，设计时若需要设置字段值，通过字段`.value`处理
     * - 设置值时需要进行值验证，若不符合要求则设置失败
     * @param value 新的字段值
     * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
     * @returns 操作结果；`.success`操作是否成功：true则设置成功；false则`.reason`失败原因
     */
    setValue<T>(value: T, traces?: ReadonlyArray<FieldActionOptions>): Promise<RunResult>;

    /**
     * 获取字段状态
     * - 运行时返回字段实际状态
     * - 其他模式，返回字段配置状态
     * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
     * @returns 操作结果；`.success`是否成功：true则`.data`为字段状态；false则`.reason`失败原因
     */
    getStatus(traces?: ReadonlyArray<FieldActionOptions>): RunResult<FieldStatusOptions>;
    /**
     * 设置字段状态
     * - 仅运行时生效；设计时若需要获取字段状态，直接取字段配置即可
     * @param status 新的状态字段
     * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
     * @returns 操作结果；`.success`操作是否成功：true则设置成功；false则`.reason`失败原因
     */
    setStatus(status: Partial<FieldStatusOptions>, traces?: ReadonlyArray<FieldActionOptions>): RunResult;
};

/**
 * 接口：字段管理器
 * - 用于进行字段状态、字段值、字段配置等管理
 */
export interface IFieldManager {
    /**
     * 字段事件发射器
     */
    readonly emitter: EmitterType<FieldEvents>;
    /**
     * 字段句柄
     */
    readonly handle: IFieldHandle;

    /**
     * 获取字段的错误信息
     */
    getError(): string;
    /**
     * 更新字段错误信息
     * - 如验证通过则清理掉，验证失败则设置具体的错误信息
     * @param error 错误信息数据，传入undefined表示清理错误信息
     */
    updateError(error: string | undefined): void;

    /**
     * 字段是否必填
     */
    isReqired(): boolean;
    /**
     * 字段是否只读了
     */
    isReadonly(): boolean;
    /**
     * 字段是否隐藏了
     */
    isHidden(): boolean;
}

/**
 * 字段管理器配置选项
 */
export type FieldManagerOptions = {
    /**
     * 字段事件发射器
     */
    readonly emitter: EmitterType<FieldEvents>;

    /**
     * 获取字段配置
     * - 设计时，验证字段配置是否正确，不正确则返回失败；其他模式，直接返回字段无需任何验证
     * - 传入后，代理组件内部响应 IFieledHandle.getField 时，调用此方法
     * @returns 取值成功返回具体值，若失败则将错误信息写入error中
     */
    readonly getField?: () => Promise<FieldOptions<any>>;
    /**
     * 取值方法
     * - 运行时，返回字段实际值；其他模式，返回字段配置的默认值
     * - 代理组件内部响应 IFieledHandle.getValue 时，调用此方法
     * @param validate 是否进行值验证
     * @returns 取值成功返回具体值，若失败则将错误信息写入error中
     */
    readonly getValue: <T>(validate: boolean) => Promise<RunResult<T>>;
    /**
     * 设置字段值
     * - 代理组件内部响应 IFieledHandle.setValue 时，调用此方法
     * - 此方法内部的改变，不用触发`valueChagne`事件，交给`IFieldHandle`句柄处理，这样才能保留追踪链路
     * @returns 操作结果
     */
    readonly setValue: (value: any) => Promise<FieldValueSetResult>;
}
/**
 * 字段值设置结果
 */
export type FieldValueSetResult = {
    /**
     * 是否设置成功
     * - true则设置成功
     * - false则将错误信息写入error中
     */
    readonly success: boolean;
    /**
     * 设置成功时，值是否改变
     */
    readonly change: boolean;
    /**
     * 设置之后的新值
     * - change为true时生效
     * - 如格式化后的值，可能和传入值不一样
     */
    readonly newValue?: any;
    /**
     * 设置之前的旧值
     * - change为true时生效
     */
    readonly oldValue?: any;
}

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
     * 字段配置改变事件
     * @param field 新的字段配置
     */
    configChange: [field: FieldOptions<any>];
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

    /**
     * 复制字段时
     * - 设计时专用：通知字段容器，基于此字段，复制一个新字段出来
     */
    copyField: [];
    /**
     * 删除字段时
     * - 设计时专用；通知字段容器，删除此字段
     */
    deleteField: [];
    /**
     * 激活字段时
     * - 设计时专用：通知字段容器，激活此字段的自定义配置面板
     */
    activateField: [];
}
/**
 * 字段改变事件对象
 * - 约束字段父级信息；附带追踪信息
 * - 给表单渲染器使用
 * - 字段值、状态等改变时，传递新旧变化
 */
export type FieldChangeEvent<T = void> = {
    /**
     * 字段所在位置（在父级容器中的位置），不传则为顶级字段
     */
    readonly location?: Pick<FieldLocation, "parentFieldId" | "rowIndex">;

    /**
     * 新值
     */
    readonly newValue?: T;
    /**
     * 旧值
     */
    readonly oldValue?: T;

    /**
     * 字段追踪信息
     * - 响应事件需要操作字段时，传递下去，从而避免调用死循环
     */
    readonly traces: ReadonlyArray<FieldActionOptions>;
};

/**
 * 字段渲染配置选项
 * - 约束渲染一个字段需要的相关信息
 */
export type FieldRenderOptions<Settings, Value> = Required<ReadonlyOptions & Pick<FieldLocation, "parentFieldId" | "rowIndex">> & {
    /**
     * 要渲染的字段
     */
    readonly field: FieldOptions<Settings>;
    /**
     * 字段值
     */
    readonly value: Value;
}

/**
 * 字段渲染代理组件配置选项
 * - title 为空时，不显示标题区域，此时required无效
 */
export type FieldRenderProxyOptions = Required<Pick<FieldOptions<any>, "type" | "title" | "description">> & {
    /**
     * 字段管理器对象
     */
    manager: IFieldManager;
    /**
     * 字段的错误信息，如字段值验证错误等
     * - 外部使用响应式传递，方便实时显示错误信息
     */
    error?: string;
}