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
        <!-- 数值格式：千分位、数值大写、小数位数、、、、 -->
        <div class="setting-divider" />
        <FieldLikeNumber title="精度" :readonly="readonly" :value="field.settings.precision" :abs-value="true"
            placeholder="保留几位小数" @change="value => proxy.update('precision', true, value)" />
        <FieldLikeText title="前缀" :readonly="readonly" :value="field.settings.prefix" placeholder="金额时，可配置前缀为 ￥"
            @change="value => proxy.update('prefix', true, value)" />
        <FieldLikeText title="后缀" :readonly="readonly" :value="field.settings.suffix" placeholder="金额时，可配置后缀为 元"
            @change="value => proxy.update('suffix', true, value)" />
        <FieldLikeBoolean title="转大写" :readonly="readonly" :value="field.settings.upper" help="如金额时，转换为 壹仟壹佰壹拾壹元叁角叁分"
            @change="value => proxy.update('upper', true, value)" />
        <div class="setting-item">
            <div class="item-title" v-text="'千分'" :class="'question'"
                title="格式化输入数值为千分位格式：【默认】在控件下方显示；【行内】在输入框中直接格式化显示" />
            <div class="item-detail right">
                <Choose :readonly="readonly" :type="'checkbox'" :mode="'beautiful'" :multi="false"
                    :items="[{ text: '禁用', value: 'disabled' }, { text: '默认', value: 'below' }, { text: '行内', value: 'inline' }]"
                    v-model="thousandsRef" @change="value => proxy.update('thousands', true, value)" />
            </div>
        </div>
        <div class="setting-item">
            <div class="item-title" v-text="'步长控制器'" :class="'question'"
                title="是否启用 + - 控制按钮调整数值：【默认】控件左侧 — 右侧 +；【右侧】+ - 都在右侧" />
            <div class="item-detail right">
                <Choose :readonly="readonly" :type="'checkbox'" :mode="'beautiful'" :multi="false"
                    :items="[{ text: '禁用', value: 'disabled' }, { text: '默认', value: 'default' }, { text: '右侧', value: 'right' }]"
                    v-model="controlsRef" @change="value => proxy.update('controls', true, value)" />
            </div>
        </div>
        <FieldLikeNumber v-show="controlsRef != 'disabled'" title="步长值" :readonly="readonly"
            :value="field.settings.step" :precision="0" :abs-value="true" help="点击 + - 时调整的单位值；默认值1"
            placeholder="仅支持正整数" @change="value => proxy.update('step', true, value)" />
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
/**     数值控制器配置项 */
const thousandsRef = ref<NumberControlSettings["thousands"]>(field.settings.thousands || "disabled");
const controlsRef = shallowRef<NumberControlSettings["controls"]>(field.settings.controls || "disabled");

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