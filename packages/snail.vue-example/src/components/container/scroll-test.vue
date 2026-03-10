<!-- 组件介绍写到这里 -->
<template>
    <Scroll style="width: 100%;height: 100%;" :scroll-y="true">
        <section>
            <Scroll class="scroll-test" :scroll-x="false" :scroll-y="false">
                <div>
                    x、y都不滚动
                    <code>:scroll-x="false" :scroll-y="false"</code>
                </div>
            </Scroll>
        </section>
        <section>
            <Scroll class="scroll-test" :scroll-x="true" :scroll-y="false">
                <div>
                    x轴滚动
                    <code>:scroll-x="true" :scroll-y="false"</code>
                </div>
            </Scroll>
        </section>
        <section>
            <Scroll class="scroll-test" :scroll-x="false" :scroll-y="true">
                <div>
                    y轴滚动
                    <code>:scroll-x="false" :scroll-y="true"</code>
                </div>
            </Scroll>
        </section>
        <!-- 滚动条大小、样式等-->
        <section style="width: 100%;height: 2px;">滚动条大小、样式等</section>
        <section>
            <Scroll class="scroll-test" :scroll-x="true" :scroll-y="true" :bar-size="'normal'">
                <div>
                    都滚动，滚动条尺寸 ：normal
                    <code>:scroll-x="true" :scroll-y="true" :bar-size="'normal'"</code>
                </div>
            </Scroll>
        </section>
        <section>
            <Scroll class="scroll-test" :scroll-x="true" :scroll-y="true" :bar-size="'small'">
                <div>
                    都滚动，滚动条尺寸 ：small
                    <code>:scroll-x="true" :scroll-y="true" :bar-size="'small'"</code>
                </div>
            </Scroll>
        </section>
        <section>
            <Scroll class="scroll-test" :scroll-x="true" :scroll-y="true" :bar-size="'mini'">
                <div>
                    都滚动，滚动条尺寸 ：mini
                    <code>:scroll-x="true" :scroll-y="true" :bar-size="'mini'"</code>
                </div>
            </Scroll>
        </section>
        <section>
            <Scroll class="scroll-test" :scroll-x="true" :scroll-y="true" :bar-size="'none'">
                <div>
                    都滚动，滚动条尺寸 ：none
                    <code>:scroll-x="true" :scroll-y="true" :bar-size="'none'"</code>
                </div>
            </Scroll>
        </section>
        <section>
            <Scroll class="scroll-test" :scroll-x="true" :scroll-y="true" :bar-size="'mini'" :bar-mode="'hover'">
                <div>
                    都滚动，滚动条尺寸 ：mini，鼠标移入才显示滚动条
                    <code>:scroll-x="true" :scroll-y="true" :bar-size="'mini'" :bar-mode="'hover'"</code>
                </div>
            </Scroll>
        </section>
        <section>
            <Scroll class="scroll-test" :scroll-x="true" :scroll-y="true" :bar-size="'small'" :bar-mode="'hover'">
                <div>
                    都滚动，滚动条尺寸 ：small，鼠标移入才显示滚动条
                    <code>:scroll-x="true" :scroll-y="true" :bar-size="'small'" :bar-mode="'hover'"</code>
                </div>
            </Scroll>
        </section>
        <section>
            <Scroll class="scroll-test" :scroll-x="true" :scroll-y="true" :bar-mode="'hover'" :debounce="true">
                <div>
                    都滚动，鼠标移入才显示滚动条；防抖效果
                    <code>:scroll-x="true" :scroll-y="true"  :bar-mode="'hover'" :debounce="true</code>
                </div>
            </Scroll>
        </section>
        <section>
            <Scroll class="scroll-test" :scroll-x="true" :scroll-y="true" :debounce="true">
                <div>
                    都滚动，防抖效果
                    <code>:scroll-x="true" :scroll-y="true"  :debounce="true</code>
                    <code>:scroll-x="true" :scroll-y="true"  :debounce="true</code>
                </div>
            </Scroll>
        </section>
        <!-- 事件相关 -->
        <section style="width: 100%;height: 2px;">事件相关：看控制台输出</section>
        <section>
            <Scroll class="scroll-test" :scroll-x="true" :scroll-y="true" @xbar="console.log" @ybar="console.log"
                @left="console.log('滚动到最左侧')" @right="console.log('滚动到最右侧')" @top="console.log('滚动到最顶部')"
                @bottom="console.log('滚动到最底部')">
                <div style="background-color: gray;">
                    200px;
                    顶顶顶顶
                </div>
            </Scroll>
        </section>
    </Scroll>
</template>

<script setup lang="ts">
import { ref, shallowRef, watch, onActivated, onDeactivated } from "vue";
import { components } from "../../libraries/snail.vue"

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const { Scroll } = components;
//  2、可选配置选项
defineOptions({ name: "ScrollTest", inheritAttrs: true, });

// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应

//      监听组件激活和卸载，适配KeepAlive组件内使用
onActivated(() => console.log("onActivated"));
onDeactivated(() => console.log("onDeactivated"));
</script>

<style lang="less">
// 引入Mixins样式
@import "snail.view/dist/styles/mixins.less";

.scroll-test {
    width: 100%;
    height: 100px;

    >div {
        width: 120%;
        height: 120%;
        background-color: gray;

        >code {
            word-break: break-all;
            white-space: keep-all;
        }
    }
}
</style>