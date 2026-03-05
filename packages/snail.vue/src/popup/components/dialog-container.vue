<!-- 对话框弹窗容器：支持外部传入动画，不转则使用默认的 -->
<template>
    <div :class="['snail-dialog', options.rootClass, popupStatus.value, popupTransition.value]"
        :style="{ 'z-index': zIndex }" @click.self="options.closeOnMask && closePopup();">
        <Dynamic class="dialog-body" :name="options.name" :component="options.component" :url="options.url"
            :props="props" :="dialogExtend" :popup-status="popupStatus.value" v-model="model" />
    </div>
</template>

<script setup lang="ts">
import { onMounted, shallowRef } from "vue";
import { DialogOptions, DialogHandle } from "../models/dialog-model";
import { PopupDescriptor } from "../models/popup-model";
import Dynamic from "../../container/dynamic.vue";
import { useObserver } from "snail.view";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const { options, extOptions, popupStatus, zIndex, popupTransition } = defineProps<PopupDescriptor<DialogOptions, DialogHandle<any>>>();
const { props, model = shallowRef(undefined) } = options;
const { closePopup, onBeforeClose } = extOptions;
/** 监听器 */
const { onEvent } = useObserver();
/** 对话框扩展配置，传递给【内容组件】使用 */
const dialogExtend = Object.freeze<DialogHandle<any>>({
    inPopup: 'dialog',
    closePopup: closePopup,
    onBeforeClose: onBeforeClose
});
//  2、可选配置选项
defineOptions({ name: "DialogContainer", inheritAttrs: true, });

// *****************************************   👉  组件渲染    *****************************************
onMounted(() => {
    onEvent(window, "keyup", (event: KeyboardEvent) => {
        event.key === "Escape" && popupStatus.value == "active"
            && options.closeOnEscape && closePopup();
    });
});
</script>

<style lang="less">
// 引入Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-dialog {
    position: fixed;
    // x、y起始位置：left:0,top:0
    .left-top-start();
    // width:100%；height:100%
    .wh-fill();
    // flex 布局：display: flex，align-items、justify-content 都为center
    .flex-center();

    &::before {
        position: absolute;
        content: "";
        background-color: rgba(24, 27, 33, 0.45);
        // width:100%；height:100%
        .wh-fill();
        //  透明度动画，在非激活时，透明度0不显示
        opacity: 1;
        transition: opacity 0.4s ease-in-out;
    }

    //  弹窗展示组件：给个背景色，避免透明
    >.dialog-body {
        background-color: white;
        position: relative;
        border-radius: 4px;
        //  私有添加阴影，增强显示效果
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
    }
}

// *****************************************   👉  特殊状态    *****************************************
//  非激活状态时
.snail-dialog.unactive {
    &::before {
        opacity: 0;
    }

    &>.dialog-body {
        box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
    }
}
</style>