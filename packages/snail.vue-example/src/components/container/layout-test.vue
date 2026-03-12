<!-- 组件介绍写到这里 -->
<template>
    <div class="snail-layout-test">
        左中右布局：<br />
        <Layout :mode="'horizontal'" style="width: 100%;height: 30%;" :top="{ height: '40px' }">
            <template #main>main</template>
            <template #top>top</template>
            <template #bottom>bottom</template>
            <template #left>left</template>
            <template #right>right</template>
        </Layout>
        <br />上中下布局：<br />
        <Layout :mode="'vertical'" style="width: 100%;height: 30%;"
            :top="{ height: '40px', scroll: { scrollY: true } }">
            <template #main>main</template>
            <template #top>top</template>
            <template #bottom>bottom</template>
            <template #left>left</template>
            <template #right>right</template>
        </Layout>
        <br />上中下，再嵌套左中右布局：<br />
        <Layout :mode="'vertical'" style="width: 100%;height: 30%;margin-top: 10px;"
            :top="{ height: '40px', maxHeight: '200px', scroll: { scrollY: true } }">
            <template #main>
                <Layout :mode="'horizontal'" style="height: 100%;"
                    :top="{ height: '20px', maxHeight: '200px', scroll: { scrollY: true } }">
                    <template #main>main</template>
                    <template #top>top</template>
                    <template #bottom>bottom</template>
                    <template #left>left</template>
                    <template #right>right</template>
                </Layout>
            </template>
            <template #top>top</template>
            <template #bottom>bottom</template>
            <template #left>left</template>
            <template #right>right</template>
        </Layout>
        <br />左中右，再嵌套上中下布局：<br />
        <Layout :mode="'horizontal'" style="width: 100%;height: 30%;margin-top: 10px;"
            :top="{ height: '40px', maxHeight: '200px', scroll: { scrollY: true } }">
            <template #main>
                <Layout :mode="'vertical'" style="height: 100%;"
                    :top="{ height: '40px', maxHeight: '200px', scroll: { scrollY: true } }">
                    <template #main>main</template>
                    <template #top>top</template>
                    <template #bottom>bottom</template>
                    <template #left>left</template>
                    <template #right>right</template>
                </Layout>
            </template>
            <template #top>top</template>
            <template #bottom>bottom</template>
            <template #left>left</template>
            <template #right>right</template>
        </Layout>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, shallowRef, } from "vue";
import { components } from "../../libraries/snail.vue";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const { Layout } = components;
//  2、组件交互变量、常量


// *****************************************   👉  方法+事件    ****************************************


// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应
onMounted(() => {
});

</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-layout-test {
    padding: 2px;
    //  width:100%；height:100%
    .wh-fill();
    overflow-y: auto;

    .snail-layout {
        background-color: white;
        border: 1px solid red;

        >* {
            // border: 1px solid gray;
            margin: 2px;
            padding: 4px;
            background-color: gray;
        }
    }
}
</style>