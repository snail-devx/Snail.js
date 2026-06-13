<!-- 组件包裹层：将实际的内容组件包裹起来
    1、用于包裹内容组件，实现在dialog模式下使用时，自动添加头部和底部
    2、只读模式下，禁用底部组件
    3、对外提供：关闭事件、确认点击事件
-->
<template>
    <div class="snail-wrapper" :class="inPopup ? 'in-popup' : 'in-normal'">
        <Header v-if="header && header.disabled != true" :="header || { useTo: 'dialog', title: '对话框' }"
            @close="emits('cancel')" />
        <Scroll class="wrapper-body" :="content || { scroll: 'none' }">
            <slot />
        </Scroll>
        <Footer v-if="footer && readonly != true && footer.disabled != true" :="footer || {}" @cancel="emits('cancel')"
            @confirm="emits('confirm')" />
    </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, } from "vue";
import { WrapperEvents, WrapperOptions } from "./models/wrapper-model";
import Header from "../base/header.vue";
import Footer from "../base/footer.vue";
import Scroll from "./scroll.vue";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
defineProps<WrapperOptions>();
const emits = defineEmits<WrapperEvents>();

//  2、组件交互变量、常量


// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应

</script>

<style lang="less">
// 引入Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-wrapper {
    background-color: white;
    //  flex布局，列 为主轴：display: flex，flex-direction: column;
    .flex-column();

    >.snail-scroll {
        flex: 1;
    }
}

// *****************************************   👉  特殊样式适配    *****************************************
//  正常模式下使用
.snail-wrapper.in-normal {
    flex: 1;
    //  width:100%；height:100%；overflow: hidden
    .wh-fill-hidden();
}

//  弹窗模式下下样式
.snail-wrapper.in-popup {
    width: 60%;
    min-width: 800px;
    height: 80%;
    overflow: hidden;
}
</style>
