<!-- 弹窗容器对象 
    1、负责加载弹窗展示的组件
    2、负责处理弹窗的关闭逻辑
    3、每个弹窗容器就是一个app实例，实现互不干扰
-->
<template>
    <Dynamic class="snail-popup" v-if="loadingRef && props.popupStatus.value != 'close'" :name="props.name"
        :component="props.component" :url="props.url" :in-popup="props.inPopup" :close-popup="props.closePopup"
        v-bind="props.props" />
</template>

<script setup lang="ts">
import { ref, shallowRef, onMounted } from "vue";
import Dynamic from "../../container/dynamic.vue";
import { PopupExtend, PopupFlagOptions, PopupHandle, PopupOptions } from "../models/popup-model";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const props = defineProps<PopupOptions & PopupHandle<any> & PopupExtend & PopupFlagOptions>();
/** 是否加载组件：模拟出动画效果 */
const loadingRef = shallowRef<boolean>(false);
//  2、可选配置选项
defineOptions({ name: "PopupContainer", inheritAttrs: true, });

// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
onMounted(() => {
    loadingRef.value = true;
    //  监听点击和keyup事件，进行弹窗关闭
});
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/base-mixins.less";

.snail-popup {
    position: fixed;
    // x、y起始位置：left:0,top:0
    .left-right-start();
}
</style>