<!-- 闪动数字组件
    1、自动识别传入的数值，拆分成多个数字，从0开始闪动到最终目标值
  -->
<template>
    <div class="snail-flash-number">
        <span v-for="item in itemsRef" :key="item.id" v-text="item.text"
            :class="isNullish(item.number) ? '' : 'number-item'" />
        <span style="color: red;">-----还没实现，别用</span>
    </div>
</template>

<script setup lang="ts">
import { onMounted, Ref, ref, ShallowRef, shallowRef, } from "vue";
import { ValueOptions } from "../base/models/base-model";
import { isArrayNotEmpty, isNullish, isStringNotEmpty, newId } from "snail.core";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const props = defineProps<ValueOptions<string | number>>();
//  2、组件交互变量、常量
/** 构建出来的选项 */
const itemsRef: Ref<{ id: string, text: string, number?: number }[]> = ref();

// *****************************************   👉  方法+事件    ****************************************
/**
 * 构建数值选项集合
 */
function buildNumberItems() {
    itemsRef.value = [];
    const value = isNullish(props.value) ? null : String(props.value);
    if (isStringNotEmpty(value) == true) {
        for (const item of value) {
            const number: number = parseInt(item);
            const isNumber: boolean = 0 <= number && number <= 9;
            itemsRef.value.push({
                id: newId(),
                text: item,
                number: isNumber ? number : undefined,
            });
        }
    }
    if (isArrayNotEmpty(itemsRef.value) == true) {
        // //  是数字时，进行值跳动变化
        // if (flashItem.isNumber == true && number > 0) {
        //     flashItem.text = "0";
        //     flashItem.number = 0;
        //     const timeId = setInterval(function () {
        //         if (flashItem.number == number) {
        //             clearInterval(timeId);
        //             return;
        //         }
        //         flashItem.number++;
        //         flashItem.text = String(flashItem.number);
        //     }, 50);
        // }
    }
}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应
onMounted(() => {
    buildNumberItems();
});

</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-flash-number {}
</style>