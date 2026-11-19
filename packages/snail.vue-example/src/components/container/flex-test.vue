<!-- 组件介绍写到这里 -->
<template>
    <Flex class="flex-test" :main="'between'" :wrap="'wrap'" :gap="'10px'" :repairItem="true" :item-count="7"
        :item-class="'item'">
        <div class="item">1</div>
        <div class="item">2</div>
        <div class="item">3</div>
        <div class="item">4</div>
        <div class="item">5</div>
        <div class="item">6</div>
        <div class="item">7</div>
    </Flex>
    <hr />
    <Flex class="flex-test" :main="'around'" :wrap="'wrap'" :gap="'10px'" :repairItem="true" :item-count="7"
        :item-class="'item'">
        <div class="item">1</div>
        <div class="item">2</div>
        <div class="item">3</div>
        <div class="item">4</div>
        <div class="item">5</div>
        <div class="item">6</div>
        <div class="item">7</div>
    </Flex>
    <hr />
    <Flex class="flex-test" :main="'evenly'" :wrap="'wrap'" :gap="'10px'" :repairItem="true" :item-count="7"
        :item-class="'item'">
        <div class="item">1</div>
        <div class="item">2</div>
        <div class="item">3</div>
        <div class="item">4</div>
        <div class="item">5</div>
        <div class="item">6</div>
        <div class="item">7</div>
    </Flex>
    <hr />
    <Flex class="flex-test" :direction="'column'" :main="'evenly'" :wrap="'wrap'" :gap="'10px'" :repairItem="true"
        :item-count="7" :item-class="'item'">
        <div class="item">1</div>
        <div class="item">2</div>
        <div class="item">3</div>
        <div class="item">4</div>
        <div class="item">5</div>
        <div class="item">6</div>
        <div class="item">7</div>
    </Flex>
    <!-- 测试 -->
    <div class="flex-wrapper">
        <div class="flex-content">
            <Flex class="flex-test2" :direction="'row'" :main="'between'" :wrap="'wrap'" :gap="'8px'" :repairItem="true"
                :item-count="10" :item-class="'item'">
                <div class="item">1</div>
                <div class="item">2</div>
                <div class="item">3</div>
                <div class="item">4</div>
                <div class="item">5</div>
                <div class="item">6</div>
                <div class="item">7</div>
                <div class="item">8</div>
                <div class="item">9</div>
                <div class="item">10</div>
            </Flex>
        </div>
    </div>
</template>

<script setup lang="ts">
import { components } from "../../libraries/snail_vue";

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

.flex-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    // padding: 12px;
    border: 1px solid gray;

    >.flex-content {
        align-self: flex-start;
        flex-shrink: 0;
        min-height: 32px;
        min-width: 80px;
        position: relative;
        word-break: break-all;
        border-radius: 8px;
        overflow: hidden visible;
        padding: 12px;
        white-space: break-spaces;

        >.flex-test2 {
            // min-width: 100px;
            // flex-shrink: 0;
            // border: 1px solid gray;
            // align-self: flex-start;

            margin-top: 12px;
            margin-left: 0px;
            margin-right: 0px;



            >.item {
                min-width: 280px;
                max-width: 400px;
                background-color: #409eff;
                flex: 1;
            }
        }
    }
}
</style>