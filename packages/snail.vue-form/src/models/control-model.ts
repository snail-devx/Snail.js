import { ComponentOptions } from "snail.vue";

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

//#region ************************************* 文本类控件的Settings *************************************
/**
 * 文本控件的Settings数据解构
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
//#endregion