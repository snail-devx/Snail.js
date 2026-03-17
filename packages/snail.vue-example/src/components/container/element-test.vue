<!-- 组件介绍写到这里 -->
<template>
    <article>
        <section>
            <Element :show="showRef" :show-mode="'vShow'" class="test-11" @click="console.log('ddd')">
                :show="showRef" :show-mode="'vShow'"
            </Element>
        </section>
        <section>
            <Element :tag="'div'" :show="showRef" :show-mode="'vShow'" :transition="{ effect: 'scale' }">
                :tag="'div'" :show="showRef" :show-mode="'vShow'" :transition="{ effect: 'scale' }"
            </Element>
        </section>
    </article>
    <article>
        <section>
            <Element :tag="'span'" :show="showRef" :show-mode="'vIf'">
                :tag="'span'" :show="showRef" :show-mode="'vIf'"
            </Element>
        </section>
        <section>
            <Element :tag="'span'" :show="showRef" :show-mode="'vIf'" :children="{ group: false, effect: 'down' }">
                <div>:tag="'span'" :show="showRef" :show-mode="'vIf'" :children="{ group: false, effect: 'down' }"</div>
            </Element>
        </section>
    </article>
    <button @click="showRef = !showRef">切换显隐</button>
</template>

<script setup lang="ts">
import { ref, ShallowRef, shallowRef, } from "vue";
import { components } from "../../libraries/snail.vue";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const { Element } = components;
//  2、组件交互变量、常量
const showRef: ShallowRef<boolean> = shallowRef(false);


// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应

</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";
</style>