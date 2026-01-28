
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
     *      visible         是否显示
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
     * 是否可见
     * - 默认为true；显式指定为false时，字段不可见
     */
    visible: boolean;
}

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
     * - "status": 修改字段状态（required/readonly/visible）
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
 * 字段位置信息
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
 * 字段事件
 */
export type FieldEvents = {
    /**
     * 字段渲染完成
     * @param field 当前渲染完成的字段
     * @param event 事件详细信息（父级字段、追踪信息）
     */
    rendered: [field: FieldOptions<any>, event: FieldChangeEvent<void>];
    /**
     * 字段值变更事件
     * - 在用户交互或程序赋值导致字段值变化后触发（新旧值不同）
     * @param field 变更值的字段
     * @param event 事件详细信息（新旧值、父级字段、追踪信息）
     */
    valueChange: [field: FieldOptions<any>, event: FieldChangeEvent<any>];
    /**
     * 状态变化事件
     * - 当字段的 required/readonly/visible 状态发生变化时触发
     * - 典型用途：动态控制 UI 显隐、校验规则更新
     * @param field 改变值的字段
     * @param event 事件详细信息（新旧状态、父级字段、追踪信息）
     */
    statusChange: [field: FieldOptions<any>, event: FieldChangeEvent<FieldStatusOptions>];
}
/**
 * 字段改变事件对象
 * - 约束字段父级信息；附带追踪信息
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

/**
 * 字段管理器
 * - 负责进行字段管理，桥接表单-字段之间的通信等
 */
export interface IFieldManager {
    //  注册句柄：从而获取字段信息、操作字段、设置字段值
    //  进行字段事件触发
    //      字段渲染完成、字段值改变事件、字段状态变化事件、、、
    //  对外构建 表单句柄
    //      将表单中和字段相关的句柄，迁移到这里
}
