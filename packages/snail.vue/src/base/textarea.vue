<!-- 文本输入框，支持单行和多行文本框效果 
    1、对外属性和事件，先仅支持用得上的，其余属性、事件外部需要时，通过属性绑定即可，内部通过  :="$attrs" 做绑定
 -->
<template>
    <textarea class="snail-textarea" ref="textarea" :="$attrs" :readonly="readonly" :placeholder="placeholder"
        :rows="rowsRef" v-model="valueModel" @focus="emits('focus')" @input="emits('input', textareaDom.value)"
        @blur="emits('blur', textareaDom.value)" @change="emits('change', textareaDom.value)" />
</template>

<script setup lang="ts">
import { nextTick, onMounted, ShallowRef, shallowRef, useTemplateRef, } from "vue";
import { TextareaEvents, TextareaOptions } from "./models/textarea-model";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
defineOptions({ name: "Textarea" });
const props = defineProps<TextareaOptions>();
const emits = defineEmits<TextareaEvents>();
const valueModel = defineModel<string>({ default: undefined });
const textareaDom = useTemplateRef('textarea');
//  2、组件交互变量、常量
const minRows = props.minRows > 0 ? props.minRows : 4;
const maxRows = props.maxRows > 0 ? props.maxRows : 10;
const rowsRef: ShallowRef<number> = shallowRef(minRows);

// *****************************************   👉  方法+事件    ****************************************
/**
 * 根据内容计算行数值
 */
async function calcRows() {
    if (textareaDom.value) {
        rowsRef.value = 1;
        await nextTick();
        const style = window.getComputedStyle(textareaDom.value);
        // 1. 获取单行高度 (处理 'normal' 情况)；如果是 normal，用 font-size * 1.2 估算，或者强制设置为具体数值
        let lineHeight = parseFloat(style.lineHeight);
        isNaN(lineHeight) && (lineHeight = parseFloat(style.fontSize) * 1.2);
        // 2. 获取垂直方向的内边距和边框
        const vPadding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
        // const vBorder = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
        //  3、计算所需行数（求整数值）求值
        const rows = Math.trunc((textareaDom.value.scrollHeight - vPadding) / lineHeight);
        rowsRef.value = Math.max(minRows, Math.min(maxRows, rows));
    }
    requestAnimationFrame(calcRows);
}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应
//      组件挂载完成后，计算行数；requestAnimationFrame 计算，是最精确的方式，只是性能上会有点损耗，问题不大
props.autoHeight == true && onMounted(calcRows);
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

textarea.snail-textarea {
    width: 100%;
    resize: none;
    overflow-x: hidden;
    overflow-y: auto;
    //  给默认的字体大小和line-height
    font-size: 14px;
    line-height: 1.5em;
}
</style>