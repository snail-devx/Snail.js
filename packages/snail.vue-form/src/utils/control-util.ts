/**
 * 控件助手
 */

import { ComponentOptions } from "snail.vue";

import { Component, shallowRef } from "vue";
import { ControlOptions } from "../form";
import Checkbox from "./components/controls/checkbox.vue";
import Combobox from "./components/controls/combobox.vue";
import Datetime from "./components/controls/datetime.vue";
import Group from "./components/controls/group.vue";
import Money from "./components/controls/money.vue";
import Number from "./components/controls/number.vue";
import Percent from "./components/controls/percent.vue";
import Radio from "./components/controls/radio.vue";
import Text from "./components/controls/text.vue";
import Textarea from "./components/controls/textarea.vue";
import TextSetting from "../components/settings/text-setting.vue";

/**
 * 包裹组件
 * @param component 
 * @returns 
 */
function wrapComponent(component: Component): Readonly<ComponentOptions> {
    return Object.freeze({ component: shallowRef(component) });
}

/** 默认控件数组 */
const defaultControls: ControlOptions[] = [
    { type: "Text", name: "文本框", component: wrapComponent(Text), settingComponent: wrapComponent(TextSetting) }
];

/**
 * 默认控件仓库;强制只读
 */
export const DEFAULT_ControlRegistery: Readonly<ControlOptions[]> = Object.freeze<ControlOptions[]>(defaultControls.map(control => Object.freeze(control)));