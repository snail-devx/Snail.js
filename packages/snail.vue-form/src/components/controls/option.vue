<!-- 选择组件，支持表单的单选（Radio）、多选（Checkbox）、下拉组合（Combobox，C#叫法，更适合） 
    1、使用 FieldProxy 代理部分逻辑
    2、往代理组件传递参数时，直接使用上层属性，不中转，避免破坏响应式
-->
<template>
    <FieldProxy :type="field.type" :title="field.title" :description="field.description"
        :="{ manager: manager, error: getError() }">
        <!-- 下拉组合框 -->
        <Select v-if="field.type == 'Combobox'" :readonly="readonly" :multiple="false" :="buildSelectItemsAndValue()"
            @change="items => onChooseChange(items && items.length == 1 ? [items[0].id] : [])" />
        <!-- 单选、多选框 -->
        <Choose v-else :readonly="readonly" :type="isMultiple ? 'checkbox' : 'radio'" :mode="'beautiful'"
            :layout="field.settings.layout || 'horizontal'" :multi="isMultiple" :items="buildChooseItems()"
            v-model="valueIdsRef" @change="onChooseChange" />
    </FieldProxy>
</template>

<script setup lang="ts">
import { isArrayNotEmpty, isStringNotEmpty, newId, RunResult } from "snail.core";
import { inject, onMounted, ShallowRef, shallowRef, watch, } from "vue";
import { ChooseItem, components, SelectItem, SelectOptions } from "snail.vue";
import { OptionControlSettings, OptionControlValueItem } from "../../models/control-model";
import { FieldEvents, FieldRenderOptions, FieldValueSetResult, IFieldHandle, IFieldManager, } from "../../models/field-base";
import { INJECTKEY_GlobalContext, newTraces, useField } from "../common/field-common";
import FieldProxy from "../common/field-proxy.vue";
// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const props = defineProps<FieldRenderOptions<OptionControlSettings, OptionControlValueItem[]>>();
const emits = defineEmits<FieldEvents>();
const { Choose, Select } = components;
const global = inject(INJECTKEY_GlobalContext);
const manager: IFieldManager = useField(global, props, {
    emitter: emits,
    getValue(validate: boolean): Promise<RunResult<any>> {
        const success: boolean = validate ? validateSelected() : true;
        const rt: RunResult<any> = success
            ? { success: true, data: valueRef.value }
            : { success: false, reason: getError() };
        return Promise.resolve(rt);
    },
    setValue(values: OptionControlValueItem[]): Promise<FieldValueSetResult> {
        //  提取已选values值，判断是否有变化
        values || (values = []);
        let change: boolean = valueIdsRef.value.length != values.length;
        //      二者数量一样，且非空选项，则判定id是否一样
        if (change == false && values.length > 0) {
            const vm = new Map<string, boolean>();
            values.forEach(item => vm.set(item.id, true));
            valueIdsRef.value.forEach(id => vm.delete(id));
            change = vm.size != 0;
        }
        //  返回操作结果；有变化则重新构建选项，并验证选项数据
        let result: FieldValueSetResult;
        if (change == true) {
            const oldValue = [...valueRef.value];
            buildSelectedOptions(values, true);
            result = validateSelected()
                ? { success: true, change: true, newValue: valueRef.value, oldValue }
                : { success: false, change: false };
        }
        return Promise.resolve(result || { success: true, change: false });
    },
});
const { handle, getError, updateError } = manager;
//  2、组件交互变量、常量
/**     已选选择项：field-proxy需要 */
const valueRef = shallowRef<OptionControlValueItem[]>();
/**     是否是多选 */
const isMultiple: boolean = props.field.type == "Checkbox";
//  3、选项相关
/**     选择项目字典，key为选项id，value为选项对象 */
const optionMap: Map<string, OptionControlValueItem> = new Map();
/**     已选选项的id值集合*/
const valueIdsRef: ShallowRef<string[]> = shallowRef<string[]>();
//  4、其他变量、常量
/**     全局唯一Key，用于在setValue时，重新渲染对应组件的选项和已选项 */
const keyRef: ShallowRef<string> = shallowRef(newId());
// *****************************************   👉  方法+事件    ****************************************
/**
 * 构建已选值相关选项
 */
function buildSelectedOptions(values: OptionControlValueItem[], refresh: boolean): void {
    //  初始化已选值,并初始化给已选id值集合；单选时，只取第一个值
    valueRef.value = [];
    valueIdsRef.value = [];
    if (optionMap.size > 0) {
        (values || []).forEach(item => {
            const value = optionMap.get(item.id);
            if (value != undefined) {
                valueRef.value.push(value);
                valueIdsRef.value.push(value.id);
            }
        });
        if (isMultiple != true && valueRef.value.length > 1) {
            valueRef.value.splice(1);
            valueIdsRef.value.splice(1);
        }
    }
    refresh && (keyRef.value = newId());
}

/**
 * 验证已选选项；主要验证必选
 */
function validateSelected(): boolean {
    const error = handle.getStatus().data.required && valueIdsRef.value.length == 0
        ? "请至少选择一项!"
        : undefined;
    updateError(error);
    return error == undefined;
}

/**
 * 构建【Select】控件的选择项集合和值
 */
function buildSelectItemsAndValue(): Pick<SelectOptions<OptionControlValueItem>, "items" | "value" | "search" | "showPath" | "showClear"> {
    const items: SelectItem<OptionControlValueItem>[] = [];
    for (const [_, item] of optionMap) {
        items.push({ id: item.id, text: item.text, clickable: true });
    }
    const value: SelectItem<OptionControlValueItem>[] = [];
    valueIdsRef.value.forEach(id => {
        const tmp = items.find(item => item.id == id);
        tmp && value.push(tmp);
    });

    return {
        items,
        value,
        showPath: false,
        showClear: true,
        search: props.field.settings.searchEnabled ? { autoComplete: true, placeholder: '请输入选项名称' } : undefined,
    }
}
/**
 * 构建【Choose】控件的选择项集合
 */
function buildChooseItems(): ChooseItem<string>[] {
    const items: ChooseItem<string>[] = [];
    for (const [_, item] of optionMap) {
        items.push({ text: item.text, value: item.id });
    }
    return items;
}

/**
 * 单选、复选的选项改变时
 * @param value 
 */
function onChooseChange(value: string[]) {
    //  兼容radio时传入单个string的情况
    typeof (value) == "string" && (value = [value]);

    valueIdsRef.value = value || [];
    const oldValue = [...valueRef.value];
    //  遍历更新字段值
    const newValues: OptionControlValueItem[] = [];
    valueRef.value = [];
    valueIdsRef.value.forEach(id => {
        const value = optionMap.get(id);
        newValues.push({ ...value });
        valueRef.value.push({ ...value });
    });
    //  发送值改变事件
    validateSelected();
    const traces = newTraces(props, "value-change", "manual");
    emits("valueChange", newValues, oldValue, traces);
}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//      初始化选择项：选项text非空时才有效
if (props.field.settings && isArrayNotEmpty(props.field.settings.options) == true) {
    props.field.settings.options.forEach(item => {
        isStringNotEmpty(item.text) && optionMap.set(item.id, { ...item });
    });
}
//      初始化已选值
buildSelectedOptions(props.value || props.field.value, false)
//  2、生命周期响应
onMounted(() => emits("rendered", handle));
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

//  下拉组合框特定样式
.field-item.combobox>.field-detail {}

//  单选、多选框特定样式
.field-item.radio>.field-detail,
.field-item.checkbox>.field-detail {
    >.snail-choose {
        width: 100%;
        overflow-x: hidden;

        >.choose-item {
            height: 32px;
            margin-left: 0;
            max-width: 100%;

            >.status {
                width: 16px;
                height: 16px;
            }

            >.item-text {
                overflow-x: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }
    }

    //  选项定制化样式：水平布局时，间距
    >.snail-choose.horizontal {
        >.choose-item:not(:last-child) {
            margin-right: 20px;
        }
    }
}
</style>