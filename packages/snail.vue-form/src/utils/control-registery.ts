/**
 * 控件仓库
 */

import { ComponentOptions } from "snail.vue";
import { Component, shallowRef } from "vue";
import { ControlExtendOptions, ControlOptions } from "../models/control-model";

import Datetime from "../components/controls/datetime.vue";
//  👉 Group
import Group from "../components/controls/group.vue";
import GroupSetting from "../components/settings/group-setting.vue";
//  👉 Text、TextArea   
import Text from "../components/controls/text.vue";
import TextSetting from "../components/settings/text-setting.vue";
//  👉 Number
import Number from "../components/controls/number.vue";
import NumberSetting from "../components/settings/number-setting.vue";
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
    //  基础控件：文本、数值、日期时间、、
    {
        type: "Text",
        name: "单行文本框",
        renderComponent: wrapComponent(Text),
        settingComponent: wrapComponent(TextSetting)
    },
    {
        type: "TextArea",
        name: "多行文本框",
        renderComponent: wrapComponent(Text),
        settingComponent: wrapComponent(TextSetting)
    },
    {
        type: "Number",
        name: "数值",
        renderComponent: wrapComponent(Number),
        settingComponent: wrapComponent(NumberSetting)
    },
    //  选项类控件
    {
        type: "Radio",
        name: "单选框",
        renderComponent: wrapComponent(Option),
        settingComponent: wrapComponent(OptionSetting)
    },
    {
        type: "Checkbox",
        name: "复选框",
        renderComponent: wrapComponent(Option),
        settingComponent: wrapComponent(OptionSetting)
    },
    {
        type: "Combobox",
        name: "下拉框",
        renderComponent: wrapComponent(Option),
        settingComponent: wrapComponent(OptionSetting)
    },
    //  其他控件
    {
        type: "Group",
        name: "分组",
        renderComponent: wrapComponent(Group),
        settingComponent: wrapComponent(GroupSetting),
        extend: Object.freeze<ControlExtendOptions>({
            width: 100000000, /**   给个超级大的宽度，保证分组控件能够占满一行 */
            childDisabled: true,/**  不允许在子容器中，再次添加此控件 */
        })
    },
];


/**
 * 默认控件仓库;强制只读
 */
export const DEFAULT_ControlRegistery: Readonly<ControlOptions[]> = Object.freeze<ControlOptions[]>(defaultControls.map(control => Object.freeze(control)));