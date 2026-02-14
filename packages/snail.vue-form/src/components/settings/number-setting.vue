<!-- 数值控件的设置
    1、支持配置最大值、最小值、默认值
    2、格式上：支持小数位数、千分位、数值转大写、数值前缀、后缀
-->
<template>
    <FieldSettingProxy :="_" ref="setting-proxy">
        <FieldTitle :="_" />
        <FieldWidth :="_" />
        <FieldLikeText title="提示信息" :readonly="readonly" :value="field.placeholder"
            @change="value => proxy.update('placeholder', false, value)" />
        <FieldLikeText title="字段说明" :readonly="readonly" :value="field.description"
            @change="value => proxy.update('description', false, value)" />
        <div class="setting-divider" />
        <FieldLikeBoolean title="只读" :readonly="readonly" :value="field.readonly"
            @change="value => proxy.update('readonly', false, value)" />
        <FieldLikeBoolean title="隐藏" :readonly="readonly" :value="field.hidden"
            @change="value => proxy.update('hidden', false, value)" />
        <FieldLikeBoolean title="必填" :readonly="readonly" :value="field.required"
            @change="value => proxy.update('required', false, value)" />
        <FieldLikeNumber title="默认值" :readonly="readonly" :value="field.value"
            @change="value => proxy.update('value', false, value)" />
        <FieldLikeNumber title="最小值" :readonly="readonly" :value="field.settings.minValue"
            @change="value => proxy.update('minValue', true, value)" />
        <FieldLikeNumber title="最大值" :readonly="readonly" :value="field.settings.maxValue"
            @change="value => proxy.update('maxValue', true, value)" />
        <!-- 数值格式配置：精度、前后缀、数值+-控制 -->
        <div class="setting-divider" />
        <div class="setting-item">
            <div class="item-title" v-text="'控制器'" :class="'question'" :title="propertyHelps.controls" />
            <div class="item-detail right">
                <Choose :readonly="readonly" :type="'checkbox'" :mode="'beautiful'" :multi="false"
                    :items="[{ text: '禁用', value: 'disabled' }, { text: '默认', value: 'default' }, { text: '右侧', value: 'right' }]"
                    v-model="controlsRef" @change="value => proxy.update('controls', true, value)" />
            </div>
        </div>
        <FieldLikeNumber v-show="controlsRef != 'disabled'" title="步长值" :readonly="readonly"
            :value="field.settings.step" :precision="0" :abs-value="true" :help="propertyHelps.step"
            placeholder="仅支持正整数" @change="value => proxy.update('step', true, value)" />
        <FieldLikeNumber title="精度" :readonly="readonly" :value="field.settings.precision" :abs-value="true"
            placeholder="保留几位小数" @change="value => proxy.update('precision', true, value)" />
        <FieldLikeText title="前缀" :readonly="readonly" :value="field.settings.prefix" placeholder="金额时，可配置前缀为 ￥"
            @change="value => proxy.update('prefix', true, value)" />
        <FieldLikeText title="后缀" :readonly="readonly" :value="field.settings.suffix" placeholder="金额时，可配置后缀为 元"
            @change="value => proxy.update('suffix', true, value)" />
        <!-- 数值格式化处理:大写 千分位 放大系数 -->
        <div class="setting-divider" />
        <FieldLikeBoolean title="金额大写" :readonly="readonly" :value="field.settings.upper" :help="propertyHelps.upper"
            @change="value => (upperRef = value, proxy.update('upper', true, value))" />
        <div class="setting-item">
            <div class="item-title" v-text="'千分位'" :class="'question'" :title="propertyHelps.thousands" />
            <div class="item-detail right">
                <Choose :readonly="readonly" :type="'checkbox'" :mode="'beautiful'" :multi="false"
                    :items="[{ text: '禁用', value: 'disabled' }, { text: '默认', value: 'below' }, { text: '行内', value: 'inline' }]"
                    v-model="thousandsRef" @change="value => proxy.update('thousands', true, value)" />
            </div>
        </div>
        <div class="setting-item" v-if="upperRef == true || thousandsRef == 'below'">
            <div class="item-title" v-text="'放大倍数'" :class="'question'" :title="propertyHelps.formatMultiplier" />
            <div class="item-detail right">
                <Choose :readonly="readonly" :type="'checkbox'" :mode="'beautiful'" :multi="false"
                    :items="[{ text: '禁用', value: 0 }, { text: '万倍', value: 10000 }]" v-model="formatMultiplierRef"
                    @change="value => proxy.update('formatMultiplier', true, value)" />
            </div>
        </div>
    </FieldSettingProxy>
</template>

<script setup lang="ts">
import { isArrayNotEmpty, moveFromArray } from "snail.core";
import { Ref, ref, shallowRef, ShallowRef, useTemplateRef } from "vue";
import { components } from "snail.vue";
import { NumberControlSettings, } from "../../models/control-model";
import { FieldSettingOptions } from "../../models/field-setting";
import FieldSettingProxy from "../common/field-setting-proxy.vue";
import FieldTitle from "./atoms/field-title.vue";
import FieldWidth from "./atoms/field-width.vue";
import FieldLikeText from "./atoms/field-like-text.vue";
import FieldLikeBoolean from "./atoms/field-like-boolean.vue";
import FieldLikeNumber from "./atoms/field-like-number.vue";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const _ = defineProps<FieldSettingOptions<NumberControlSettings>>();
const proxy = useTemplateRef("setting-proxy");
const { Choose, Sort, Icon, Button } = components;
const { field, readonly } = _;
//  2、组件交互变量、常量
field.settings || (field.settings = {});
const controlsRef = shallowRef<NumberControlSettings["controls"]>(field.settings.controls || "disabled");
const upperRef = shallowRef<boolean>(field.settings.upper == true);
const thousandsRef = ref<NumberControlSettings["thousands"]>(field.settings.thousands || "disabled");
const formatMultiplierRef = shallowRef<number>(field.settings.formatMultiplier == undefined ? 0 : field.settings.formatMultiplier);
//  3、临时变量
/**     属性帮助信息字段，key为属性名，value为帮助信息说明 */
const propertyHelps = Object.freeze({
    controls: [
        "是否启用 + - 控制按钮调整数值。可选值：",
        "1.禁用：无+ - 控制",
        "2.默认：输入框左侧 — 右侧 +",
        "3.右侧：+ - 都在右侧"
    ].join("\n"),
    step: "点击 + - 时调整的单位值\n默认值1，仅支持正整数",
    upper: "金额时，转换为 壹仟壹佰壹拾壹元叁角叁分；仅支持人民币",
    thousands: [
        "格式化为带有千分位的数值，可选值：",
        "1.禁用：不进行千分位格式化",
        "2.默认：在控件下方显示",
        "3.行内：在输入框中直接格式化显示"
    ].join("\n"),
    formatMultiplier: [
        "数值格式化时，对数值进行放大处理（值*倍数）",
        "1.转大写、千分位（仅【默认】）时生效",
        "2.用途说明：金额后缀位【万元】时，输入1表示1万，大写时则为“壹万元整”，而不是“壹元整”"
    ].join("\n")
});

// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应

</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.field-setting-proxy>.setting-item {}
</style>