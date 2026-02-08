/**
 * 控件仓库
 */

import { ComponentOptions } from "snail.vue";
import { Component, shallowRef } from "vue";
import { ControlOptions } from "../models/control-model";

import Datetime from "../components/controls/datetime.vue";
import Group from "../components/controls/group.vue";
import Money from "../components/controls/money.vue";
import Number from "../components/controls/number.vue";
import Percent from "../components/controls/percent.vue";
//  👉 Text、TextArea   
import Text from "../components/controls/text.vue";
import TextSetting from "../components/settings/text-setting.vue";
//  👉 Radio、Checkbox、Combobox
import Option from "../components/controls/option.vue";
import OptionSetting from "../components/settings/option-setting.vue";

/**
 * 包裹组件
 * @param component 
 * @returns 
 */
function wrapComponent(component: Component): Readonly<ComponentOptions> {
    return Object.freeze({ component: component });
}

/** 默认控件数组 */
const defaultControls: ControlOptions[] = [
    { type: "Text", name: "文本框", renderComponent: wrapComponent(Text), settingComponent: wrapComponent(TextSetting) },
    { type: "TextArea", name: "多行文本框", renderComponent: wrapComponent(Text), settingComponent: wrapComponent(TextSetting) },
    { type: "Radio", name: "单选框", renderComponent: wrapComponent(Option), settingComponent: wrapComponent(OptionSetting) },
    { type: "Checkbox", name: "复选框", renderComponent: wrapComponent(Option), settingComponent: wrapComponent(OptionSetting) },
    { type: "RComboboxo", name: "下拉框", renderComponent: wrapComponent(Option), settingComponent: wrapComponent(OptionSetting) },
];


/**
 * 默认控件仓库;强制只读
 */
export const DEFAULT_ControlRegistery: Readonly<ControlOptions[]> = Object.freeze<ControlOptions[]>(defaultControls.map(control => Object.freeze(control)));