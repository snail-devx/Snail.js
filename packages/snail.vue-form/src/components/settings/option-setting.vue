<!-- 选项类控件的设置：（Radio）、多选（Checkbox）、下拉组合（Combobox，C#叫法，更适合） 
    1、无placeholder 配置，只有字段说明
    2、单选、多选可配置选项样式：选项、按钮模式
    3、选项文本不是实时刷新到字段，那样刷新次数太多了，先使用change方式
        但这样有点问题，需要field-setting-proxy中getField时在特定情况下取不到最新的，后期再优化

-->
<template>
    <FieldSettingProxy :="_" ref="setting-proxy">
        <div class="setting-divider" />
        <FieldTitle :="_" />
        <FieldWidth :="_" />
        <FieldLikeText title="字段说明" :readonly="readonly" :value="field.description" :multiple="false"
            @change="value => proxy.update('description', false, value)" />
        <div class="setting-divider" />
        <FieldLikeBoolean title="必填" :readonly="readonly" :value="field.required"
            @change="value => proxy.update('required', false, value)" />
        <FieldLikeBoolean title="只读" :readonly="readonly" :value="field.readonly"
            @change="value => proxy.update('readonly', false, value)" />
        <FieldLikeBoolean title="隐藏" :readonly="readonly" :value="field.hidden"
            @change="value => proxy.update('hidden', false, value)" />
        <div class="setting-divider" />
        <!-- 选项布局和搜索功能；根据控件类型不同配置 -->
        <FieldLikeBoolean title="选项搜索" :readonly="readonly" :value="field.settings.searchEnabled"
            v-if="field.type == 'Combobox'" @change="value => proxy.update('searchEnabled', true, value)" />
        <div class="setting-item" v-else>
            <div class="item-title">选项布局</div>
            <div class="item-detail right">
                <Choose :readonly="readonly" :type="'checkbox'" :mode="'beautiful'" :multi="false"
                    :items="[{ text: '水平', value: 'horizontal' }, { text: '垂直', value: 'vertical' }]"
                    v-model="layoutRef" @change="value => proxy.update('layout', true, value)" />
            </div>
        </div>
        <!-- 选项配置、默认值配置合并到独立一节中 -->
        <div class="setting-item">
            <div class="item-title">选项配置</div>
            <div class="item-detail right">
                <Choose :readonly="readonly" :type="'checkbox'" :mode="'beautiful'" :multi="true"
                    :items="[{ text: '编码', value: 'code' },/*{ text: '颜色', value: 'color' }*/]"
                    v-model="valueRef2CodeColor" @change="onCodeColorChange" />
            </div>
            <div class="option-items">
                <Sort :disabled="readonly" :changer="optionItems.length" draggable=".option-item" handle=".option-move"
                    @update="onItemSort">
                    <div class="option-item" v-for="item in optionItems" :key="item.id">
                        <Choose :readonly="readonly" :type="'checkbox'" :mode="'beautiful'" :multi="false"
                            :items="[{ text: '', value: true }]" v-model="item.selected"
                            @change="value => onItemSelectedChange(item, value)" />
                        <input type="text" :placeholder="readonly ? '' : '文本'" :readonly="readonly" :title="item.text"
                            v-model.trim="item.text" @change="syncFieldSetting" />
                        <input type="text" :placeholder="readonly ? '' : '编码'" :readonly="readonly" :title="item.code"
                            v-model.trim="item.code" v-if="codeEnabledRef" @change="syncFieldSetting" />
                        <!-- 非只读模式时显示操作按钮 -->
                        <template v-if="readonly != true">
                            <Icon type="grip" :size="20" class="option-move" />
                            <Icon type="trash" button :size="20" @click="onDeleteItem" />
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
import { isArrayNotEmpty, moveFromArray } from "snail.core";
import { Ref, ref, shallowRef, ShallowRef, useTemplateRef } from "vue";
import { components } from "snail.vue";
import { OptionControlSettings, OptionControlValueItem } from "../../models/control-model";
import { FieldSettingOptions } from "../../models/field-setting";
import FieldSettingProxy from "../common/field-setting-proxy.vue";
import FieldTitle from "./atoms/field-title.vue";
import FieldWidth from "./atoms/field-width.vue";
import FieldLikeText from "./atoms/field-like-text.vue";
import FieldLikeBoolean from "./atoms/field-like-boolean.vue";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const _ = defineProps<FieldSettingOptions<OptionControlSettings>>();
const proxy = useTemplateRef("setting-proxy");
const { Choose, Sort, Icon, Button } = components;
const { field, readonly } = _;
//  2、组件交互变量、常量
field.settings || (field.settings = {});
/**     是否是多选 */
const isMultiple: boolean = field.type == "Checkbox";
/**      选项布局：仅单选和多选有值，下拉组合框无值 */
const layoutRef: ShallowRef = shallowRef(field.settings.layout || "horizontal");
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
    //  遍历选项，构建选项和默认值：
    const values: OptionControlValueItem[] = [];
    field.settings.options = optionItems.value.map<OptionControlValueItem>(item => {
        const newItem: OptionControlValueItem = { id: item.id, text: item.text, code: item.code, color: item.color };
        item.selected == true && values.push({ ...newItem })
        return newItem;
    });
    field.value = values;
    //  构建完成，刷新字段
    proxy.value.refresh();
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
        padding-left: 14px;
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
                flex: 1;
                height: 28px;
                margin-left: 10px;
            }

            //  只读时，组装这样的格式“ 选项文本 | 编码 ”
            >input[readonly] {
                padding-right: 0;

                &:nth-child(n+3) {
                    border-radius: 0;
                    height: 20px;
                    padding-left: 10px;
                    border-left: 1px solid #dddfed;
                }
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