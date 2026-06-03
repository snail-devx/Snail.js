<!-- 组件介绍写到这里 -->
<template>
    <Flex class="flex-test" :justify-content="'space-between'" :wrap="'wrap'" :gap="'10px'" :repairItem="true"
        :item-count="7" :item-class="'item'">
        <div class="item">1</div>
        <div class="item">2</div>
        <div class="item">3</div>
        <div class="item">4</div>
        <div class="item">5</div>
        <div class="item">6</div>
        <div class="item">7</div>
    </Flex>
    <hr />
    <Flex class="flex-test" :justify-content="'space-around'" :wrap="'wrap'" :gap="'10px'" :repairItem="true"
        :item-count="7" :item-class="'item'">
        <div class="item">1</div>
        <div class="item">2</div>
        <div class="item">3</div>
        <div class="item">4</div>
        <div class="item">5</div>
        <div class="item">6</div>
        <div class="item">7</div>
    </Flex>
    <hr />
    <Flex class="flex-test" :justify-content="'space-evenly'" :wrap="'wrap'" :gap="'10px'" :repairItem="true"
        :item-count="7" :item-class="'item'">
        <div class="item">1</div>
        <div class="item">2</div>
        <div class="item">3</div>
        <div class="item">4</div>
        <div class="item">5</div>
        <div class="item">6</div>
        <div class="item">7</div>
    </Flex>
</template>

<script setup lang="ts">
import { components } from "../../libraries/snail.vue";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const { Flex } = components;

//  2、组件交互变量、常量

// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应

</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.flex-test {
    border: 1px solid gray;

    >.item {
        // flex: 1;
        flex-shrink: 0;
        min-width: 300px;
        height: 100px;
        background-color: #409eff;
    }
}
</style>