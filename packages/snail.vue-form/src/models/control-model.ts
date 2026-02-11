import { ChooseOptions, ComponentOptions, NumberBaseOptions } from "snail.vue";

/**
 * 表单控件配置选项
 * - 描述表单中支持的控件相关信息
 */
export type ControlOptions = {
    /**
     * 控件类型；唯一
     */
    type: string;
    /**
     * 控件名称：唯一
     */
    name: string;
    /**
     * 控件渲染组件
     */
    renderComponent: ComponentOptions;
    /**
     * 控件配置的组件
     * - 用于设计时激活字段时，显示此字段的自定义配置项
     * - 无配置时，则无法进行字段自定义配置；若字段无需自定义配置，则忽略此属性
     */
    settingComponent?: ComponentOptions;

    /**
     * 控件用途描述
     * - 字段列表上显示描述，精确描述此字段用途
     */
    description?: string;
    /**
     * 控件分组标识
     * - 用于在字段面板中按组聚合显示
     * - 未指定时归入“其他”组
     */
    group?: string;
    /**
     * 控件图标，svg的绘制路径
     * - 不传入则采用默认图标
     */
    icon?: string | string[];
}

//#region ************************************* 类控件的Settings *************************************
/**
 * 文本类控件的Settings数据结构
 * - 作为 `./field-base.ts`中的`FieldOptions<T>`泛型
 */
export type TextControlSettings = {
    /**
     * 最小长度
     */
    minLength?: number;
    /**
     * 最大长度
     */
    maxLength?: number
}

/**
 * 数字类控件的Settings数据结构
 */
export type NumberControlSettings = NumberBaseOptions;

/**
 * 选项类控件的Settings数据结构
 * - 支持单选、复选、下拉组合框
 */
export type OptionControlSettings = {
    /**
     * 启用【编码】功能
     * - 为true时，可为每个选项自定义编码，更符合业务逻辑
     */
    codeEnabled?: boolean;
    /**
     * 启用【颜色】功能
     * - 为true时，选项显示文本颜色，可为每个选项自定义颜色
     */
    colorEnabled?: boolean;
    /**
     * 启用【搜索】功能
     * - 为true时，选项可本地搜索，仅【下拉组合框】生效
     */
    searchEnabled?: boolean;
    /**
     * 选项布局
     * - 仅【单选】、【复选框】生效
     */
    layout?: ChooseOptions<any>["layout"];

    /**
     * 选项列表
     */
    options?: OptionControlValueItem[];

}
/**
 * 选项类控件的选项数据结构
 */
export type OptionControlValueItem = {
    /**
     * 选项id，自动生成
     */
    id: string;
    /**
     * 选项文本
     */
    text: string;

    /**
     * 选项编码
     * - 启用【编码】功能时生效
     */
    code?: string;
    /**
     * 选项文本颜色
     * - 启用【颜色】功能时生效
     */
    color?: string;
}
//#endregion

