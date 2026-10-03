<!-- Scroll 滚动视图组件测试，测试弹簧效果和上拉加载、下拉刷新等功能 -->
<template>
    <!-- <section style="height: 300px;margin-right: 10px;border: 1px solid red;">
        <div style="max-height: 100%;">
            <div style="height: fit-content;max-height: 100%;overflow: auto;">
                <div style="height: 500px;">ddddddddddddddddddd</div>
            </div>
        </div>

    </section>

    <section style="height: 300px; overflow: hidden;">
        <div style="max-height: 100%; overflow: hidden;">
            <div id="x" style="height: fit-content; max-height: 300px; overflow: auto;">
                <div style="height: 500px;">ddddddddddddddddddd</div>
            </div>
        </div>
    </section> -->
    <div style="display: flex; flex-wrap: wrap;gap: 20px;overflow-y: visible;">
        <section style="flex: none;width: 300px;  height: 400px;border: 1px solid red; ">
            <Elastic class="wh-fill" :elastic="'both'" :bar="true">
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
        <section style="flex: none;width: 300px;  height: 400px;border: 1px solid red; ">
            <Elastic class="wh-fill" :elastic="'y'" :bar="true" :distance="400" :dock="{ top: 40, bottom: 40 }">
                <ElasticTestBody style="width: 100%;" />
                <!-- 启用此插件 -->
                <template #plugin="handle">
                    <ElasticUpdown :="handle" up :down="true" :load="loadData" @ready="onUpdownReady" />
                </template>
            </Elastic>
        </section>
        <section style="flex: none;width: 300px;  height: 400px;border: 1px solid red; ">
            <Elastic class="wh-fill" :elastic="'both'" :bar="true">
                <div style="height: 200px;width: 50%;background-color: gray;">
                    测试内容视图小于容器时
                </div>
            </Elastic>
        </section>
    </div>
</template>

<script setup lang="ts">
import { delay } from "snail.core";
import { onMounted } from "vue";
import { components, ElasticUpdownHandle } from "../../libraries/snail_vue";
import ElasticTestBody from "./components/elastic-test-body.vue";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const { Elastic, ElasticUpdown } = components;
//  2、组件交互变量、常量


// *****************************************   👉  方法+事件    ****************************************
async function loadData(mode: "refresh" | "more"): Promise<any> {
    await delay(1000 * 1);
}

/**
 * 上拉加载、下拉刷新组件准备就绪后，测试操作句柄
 * @param handle 
 */
async function onUpdownReady(handle: ElasticUpdownHandle) {
    setTimeout(handle.refresh, 1000);
}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应
onMounted(() => {

    // console.log = function (...args) {
    //     const log_panel = document.getElementById("log_panel");
    //     log_panel.innerHTML = `${args.join(" xh ")}---<br />` + log_panel.innerHTML;
    // }
});

function onLoadData(done) {
    //  延迟一秒后，通知完成
    setTimeout(done, 10000);
}

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