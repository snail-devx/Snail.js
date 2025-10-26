<!-- 输入框
    1、支持设置标题、提示语、支持标题最大宽度和最小宽度等
    2、支持指定type值：text、number，password、
    3、【后续支持】：支持进行数据验证，并支持外部传入自定义验证方法
    4、【后续支持】：最大最小值，如果是number则范围验证，如果是文本则是长度验证
 -->
<template>
    <div class="snail-input" :class="{ 'readonly': readonly }">
        <!-- 标题区域：有标题时，才展示 -->
        <div class="input-title" :style="titleStyleRef" v-if="!!title">
            <span class="text" v-text="title" />
            <span class="required" v-text="'*'" v-if="readonly != true && required == true" />
        </div>
        <!-- 输入框区域：输入不做v-model绑定，只有验证通过后再绑定 -->
        <div class="input-body">
            <input ref="input-el" :type="type || 'text'" :value="inputModel" :readonly="readonly == true"
                :placeholder="placeholder" :title="inputModel" @change="onValueChange" @click="emits('click')" />
            <span class="validate" v-if="!!validateRef" :title="validateRef">
                <Icon :type="'error'" :size="16" :color="'red'" />
            </span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, nextTick, shallowRef, useTemplateRef } from "vue";
import { InputEvents, InputOptions } from "./models/input-model";
import Icon from "../base/icon.vue";
import { css } from "snail.view";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const props = defineProps<InputOptions>();
const emits = defineEmits<InputEvents>();
/**     输入框引用 */
const inputDom = useTemplateRef("input-el");
/**     输入框内容 */
const inputModel = defineModel<string>({ default: "" });
/**     验证结果：非空字符串表示验证失败的提示语 */
const validateRef = shallowRef<string>();
/**      标题区域样式 */
const titleStyleRef: Record<string, any> = computed(() => css.buildStyle(props.titleStyle));
//  2、可选配置选项
defineOptions({ name: "Input", inheritAttrs: true, });

// *****************************************   👉  方法+事件    ****************************************
/**
 * 输入框内容发生改变时
 */
function onValueChange() {
    // 验证通过后，设置到value上，并对外发送change事件
    const text: string = inputDom.value!.value || "";
    //  更新绑定值，延迟change事件；外部同时使用v-model和change事件时，valueModel.value修改不会立马生效
    inputModel.value = text;
    nextTick(() => emits("change", text));
}

// *****************************************   👉  组件渲染    *****************************************
console.warn("Input:还没实现 验证相关逻辑")
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-input {
    display: inline-flex;
    min-height: 34px;

    >.input-title {
        flex-shrink: 0;
        padding-top: 6px;

        >span.text {
            color: #2E3033;
        }

        >span.required {
            color: #f74b4b;
            margin-left: 2px;
        }
    }

    >.input-body {
        flex: 1;
        height: 32px;
        align-self: start;
        display: flex;

        >input {
            flex: 1;
        }

        >span {
            flex-shrink: 0;
            background-color: red;
        }
    }
}
</style>