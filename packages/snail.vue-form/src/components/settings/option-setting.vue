<!-- 选项类控件的设置：（Radio）、多选（Checkbox）、下拉组合（Combobox，C#叫法，更适合） 
    1、无placeholder 配置，只有字段说明
    2、单选、多选可配置选项样式：选项、按钮模式

-->
<template>
    <FieldSettingProxy :="_">
        <FieldTitle :="_" />
        <FieldWidth :="_" />
        <!-- <FieldLikeText :readonly="readonly" title="提示信息" :value="field.placeholder" :multiple="false"
            @change="value => (field.placeholder = value, refresh(field.id, field))" /> -->
        <FieldLikeText :readonly="readonly" title="字段说明" :value="field.description" :multiple="false"
            @change="value => (field.description = value, refresh(field.id, field))" />
        <div class="setting-divider" />
        <FieldLikeBoolean :readonly="readonly" title="必填" :value="field.required"
            @change="value => (field.required = value, refresh(field.id, field))" />
        <FieldLikeBoolean :readonly="readonly" title="只读" :value="field.readonly"
            @change="value => (field.readonly = value, refresh(field.id, field))" />
        <FieldLikeBoolean :readonly="readonly" title="隐藏" :value="field.hidden"
            @change="value => (field.hidden = value, refresh(field.id, field))" />
        <!-- 选项配置、默认值配置合并到独立一节中 -->
        <div class="setting-divider" />
        <div class="setting-item">
            <div class="item-title">选项配置</div>
            <div class="item-detail right">
                <Choose :readonly="readonly" :type="'checkbox'" :mode="'beautiful'" :multi="true"
                    :items="[{ text: '编码', value: 'code' }, { text: '颜色', value: 'color' }]"
                    v-model="valueRef2CodeColor" @change="onCodeColorChange" />
            </div>
            <div class="option-items">
                <Sort :disabled="readonly" :changer="optionItems.length" draggable=".option-item" handle=".option-move"
                    @update="onItemSort">
                    <div class="option-item" v-for="item in optionItems" :key="item.id">
                        <!-- 只读模式时 -->
                        <template v-if="readonly">
                            还没实现【只读】时的渲染
                        </template>
                        <!-- 非只读模式时 -->
                        <template v-else>
                            <Choose :type="'checkbox'" :mode="'beautiful'" :multi="false"
                                :items="[{ text: '', value: true }]" v-model="item.selected"
                                @change="value => onItemSelectedChange(item, value)" />
                            <input type="text" placeholder="文本" v-model.trim="item.text" :title="item.text"
                                @change="syncFieldSetting" />
                            <input type="text" placeholder="编码" v-model.trim="item.code" :title="item.code"
                                v-if="codeEnabledRef" @change="syncFieldSetting" />
                            <Icon :type="'grip'" :size="20" class="option-move" />
                            <Icon :type="'trash'" :size="20" @click="onDeleteItem" />
                        </template>
                    </div>
                </Sort>
            </div>
            <div class="option-buttons" v-if="readonly != true">
                <Button :type="'link'" :size="'small'" v-text="'添加选项'" @click="onAddItem" />
                <Button :type="'link'" :size="'small'" v-text="'重置选项'" @click="onResetItems" />
            </div>
        </div>
    </FieldSettingProxy>
</template>

<script setup lang="ts">
import { Ref, ref, shallowRef, ShallowRef } from "vue";
import { ChooseItem, components, useReactive } from "snail.vue";
import { OptionControlSettings, OptionControlValueItem, TextControlSettings } from "../../models/control-model";
import { FieldSettingOptions } from "../../models/field-setting";
import FieldSettingProxy from "../common/field-setting-proxy.vue";
import FieldTitle from "./atoms/field-title.vue";
import FieldWidth from "./atoms/field-width.vue";
import FieldLikeNumber from "./atoms/field-like-number.vue";
import FieldLikeText from "./atoms/field-like-text.vue";
import FieldLikeBoolean from "./atoms/field-like-boolean.vue";
import { isArrayNotEmpty, moveFromArray } from "snail.core";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const _ = defineProps<FieldSettingOptions<OptionControlSettings>>();
const { Choose, Sort, Icon, Button } = components;
const { watcher } = useReactive();
const { field, readonly, container } = _;
const { refresh } = container;
//  2、组件交互变量、常量
field.settings || (field.settings = {});
/**     是否是多选 */
const isMultiple: boolean = field.type == "Checkbox";
/**     code、color 停启用配置项 */
const valueRef2CodeColor: ShallowRef<string[]> = shallowRef([]);
/**     是否启用选项编码 */
const codeEnabledRef: ShallowRef<boolean> = shallowRef(field.settings.codeEnabled == true);
/**     是否启用选项颜色 */
const colorEnabledRef: ShallowRef<boolean> = shallowRef(field.settings.colorEnabled == true);
/**     选项集合：支持拖拽调整顺序等 */
const optionItems: Ref<Array<OptionControlValueItem & { selected: boolean }>> = ref([]);

// *****************************************   👉  方法+事件    ****************************************
/**
 * 同步字段配置
 */
function syncFieldSetting() {
    //  编码、颜色是否启用
    field.settings.codeEnabled = codeEnabledRef.value;
    field.settings.colorEnabled = colorEnabledRef.value;
    //  遍历选项，构建选项和默认值
    const values: OptionControlValueItem[] = [];
    field.settings.options = optionItems.value.map<OptionControlValueItem>(item => {
        const newItem: OptionControlValueItem = { id: item.id, text: item.text, code: item.code, color: item.color };
        item.selected == true && values.push({ ...newItem })
        return newItem;
    });
    field.value = values;
    //  构建完成，刷新字段
    container.refresh(field.id, field);
}

/**
 * 编码、颜色配置项变化
 * @param value 
 */
function onCodeColorChange(value: string[]) {
    codeEnabledRef.value = value.includes("code");
    colorEnabledRef.value = value.includes("color");
    syncFieldSetting();
}

/**
 * 选项【选中】状态变化时
 * @param option 
 * @param selected 
 */
function onItemSelectedChange(option: OptionControlValueItem, selected: boolean) {
    /**单选时，只能选中一个  */
    selected = selected == true;
    if (isMultiple == false && selected == true) {
        optionItems.value.forEach(item => item.id != option.id && (item.selected = false));
    }
    syncFieldSetting();
}
/**
 * 选项顺序调整时
 * @param oldIndex 
 * @param newIndex 
 */
function onItemSort(oldIndex: number, newIndex: number) {
    moveFromArray(optionItems.value, oldIndex, newIndex);
    syncFieldSetting();
}
/**
 * 删除选项时
 * @param index 
 */
function onDeleteItem(index: number) {
    optionItems.value.splice(index, 1);
    syncFieldSetting();
}

/**
 * 添加新选项
 */
function onAddItem() {
    optionItems.value.push({
        id: new Date().getTime().toString(),
        text: "",
        code: undefined,
        color: undefined,
        selected: false
    });
}
/**
 * 重置选项
 */
function onResetItems() {
    optionItems.value.forEach(item => item.selected = false);
    syncFieldSetting();
}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//      选项编码、颜色停启用状态初始化
codeEnabledRef.value == true && valueRef2CodeColor.value.push("code");
colorEnabledRef.value == true && valueRef2CodeColor.value.push("color");
//      初始化选项信息：需要根据当前默认值，判断是否需要选中
if (isArrayNotEmpty(field.settings.options)) {
    const values: Record<string, boolean> = Object.create(null);
    isArrayNotEmpty(field.value) && (field.value as Array<OptionControlValueItem>).forEach(item => values[item.id] = true);
    optionItems.value = field.settings.options.map(item => ({ ...item, selected: values[item.id] == true }))
}
//  2、生命周期响应

</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.field-setting-proxy>.setting-item {

    >.option-items,
    >.option-buttons {
        width: 100%;
        flex-shrink: 0;
        padding-left: 10px;
    }

    >.option-items {
        >.option-item {
            margin-bottom: 4px;
            width: 100%;
            display: flex;
            flex-wrap: nowrap;
            overflow-x: hidden;
            height: 32px;
            align-items: center;

            >.snail-choose,
            >.snail-icon {
                flex-shrink: 0;
            }

            >input {
                height: 30px;
                margin-left: 10px;
            }

            >.snail-icon.option-move {
                cursor: move;
            }
        }
    }

    >.option-buttons {
        >.snail-button {
            font-size: 12px;
            width: fit-content;
            margin-right: 20px;
        }
    }
}
</style>