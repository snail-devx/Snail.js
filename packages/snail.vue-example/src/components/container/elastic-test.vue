<!-- Scroll 滚动视图组件测试，测试弹簧效果和上拉加载、下拉刷新等功能 -->
<template>
    <!-- <div style="width: 300px;height: 300px;">
        <Scroll class="wh-fill" :bar-size="'mini'" :scroll-y="true" :elastic="'y'">
            <div class="scroll-content">
                <div class="header">头部</div>
                <div class="content">内容区域</div>
                <div class="footer">底部区域</div>
            </div>
            <div class="scroll-elastic">弹性区域</div>
        </Scroll>
    </div> -->
    <section style="height: 300px;margin-right: 10px;border: 1px solid red;">
        <Elastic class="wh-fill" :scroll="'both'" bar-size="small" :spring="'both'" :down-refresh="true">
            <template #>
                顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶 顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶 顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶 顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶 顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶
                顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶 顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶 顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶 顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶 顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶
                顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶 顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶 顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶 顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶 顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶
                顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶 顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶 顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶 顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶
                顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶 顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶 顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶 顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶 顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶
                顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶 顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶 顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶 顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶 顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶
                顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶 顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶 顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶 顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶 顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶
                顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶 顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶 顶顶顶顶顶顶顶顶顶顶顶顶顶
            </template>
        </Elastic>
    </section>
    <section style="height: 300px;margin-right: 10px;border: 1px solid red;">
        <Elastic class="wh-fill" :scroll="'both'" bar-size="small" :spring="'y'" :down-refresh="true">
            <template #>
                顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶 顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶 顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶 顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶 顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶
                顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶 顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶 顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶 顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶 顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶
                顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶 顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶 顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶 顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶 顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶
                顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶 顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶 顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶 顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶
                顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶 顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶 顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶 顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶 顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶
                顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶 顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶 顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶 顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶 顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶
                顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶 顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶 顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶 顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶 顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶
                顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶 顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶 顶顶顶顶顶顶顶顶顶顶顶顶顶
            </template>
        </Elastic>
    </section>

    <section style="height: 300px;margin-right: 10px;border: 1px solid red;overflow: hidden;">
        <Elastic class="wh-fill" :scroll="'both'" bar-size="small" :spring="'both'" :down-refresh="true">
            <template #>
                <div style="background-color: gray;width: 120%;height: 400px;" />
            </template>
        </Elastic>
    </section>


    <!-- 
    <div style="width: 300px;height: 300px;">
        <Scroll class="wh-fill" :bar-size="'mini'" :scroll-y="true" :elastic="'y'">
            <div style="height: 1000px;background-color: gray; margin: 10px;">内容区域</div>
        </Scroll>
    </div>
    <div style="width: 300px;height: 300px;">
        <Scroll class="wh-fill" :bar-size="'mini'" :scroll-x="true" :elastic="'x'">
            <div style="width: 1000px;height: 100%;background-color: gray; margin: 10px;">内容区域</div>
        </Scroll>
    </div> -->
</template>

<script setup lang="ts">
import { ref, shallowRef, } from "vue";
import { components } from "../../libraries/snail.vue";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const { Elastic } = components;

//  2、组件交互变量、常量


// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应

</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.scroll-content {
    display: flex;
    flex-direction: column;
    position: relative;

    >.header {
        position: sticky;
        top: 0;
        height: 10px;
        background-color: white;
    }

    >.content {
        min-height: 200px;
    }

    >.footer {
        background-color: white;
        position: sticky;
        bottom: 0;
        height: 20px;
    }
}

.snail-scroll {
    >.scroll-elastic {
        background-color: red;
        height: 20px;
    }
}
</style>