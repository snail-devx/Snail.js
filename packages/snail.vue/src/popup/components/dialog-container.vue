<!-- 对话框弹窗容器：支持外部传入动画，不转则使用默认的 -->
<template>
    <Transition :name="props.transition || 'snail-dialog'">
        <div class="snail-dialog" v-if="loading && props.dialogStatus.value != 'close'" :class="props.rootClass"
            v-bind:class="props.dialogStatus.value" @click.self="props.closeOnMask && props.closeDialog();">
            <Dynamic class="dialog-body" :name="props.name" :component="props.component" :url="props.url"
                :in-dialog="props.inDialog" :close-dialog="props.closeDialog" :on-dialog-close="props.onDialogClose"
                v-bind="props.props" />
        </div>
    </Transition>
</template>

<script setup lang="ts">
import { onMounted, shallowRef } from "vue";
import { DialogOptions, DialogHandle, DailogExtend } from "../models/dialog-model";
import { PopupFlagOptions } from "../models/popup-model";
import Dynamic from "../../container/dynamic.vue";
import { useObserver } from "snail.view";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const props = defineProps<DialogOptions & DialogHandle<any> & DailogExtend & PopupFlagOptions>();
/** 监听器 */
const observer = useObserver();
/** 是否进行组件加载：为了让 Transition 生效，在 onMounted 设置为 true */
const loading = shallowRef<boolean>(false);
//  2、可选配置选项
defineOptions({ name: "DialogContainer", inheritAttrs: true, });

// *****************************************   👉  组件渲染    *****************************************
onMounted(() => {
    loading.value = true;
    observer.onEvent(window, "keyup", (event: KeyboardEvent) => {
        event.key === "Escape" && props.dialogStatus.value == "active"
            && props.closeOnEscape && props.closeDialog();
    });
});
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/base-mixins.less";

.snail-dialog {
    position: fixed;
    // x、y起始位置：left:0,top:0
    .left-right-start();
    // width:100%；height:100%
    .wh-fill();
    // flex 布局：display: flex，align-items、justify-content 都为center
    .flex-center();

    &::before {
        content: "";
        background-color: rgba(24, 27, 33, 0.45);
        position: absolute;

        // width:100%；height:100%
        .wh-fill();
    }

    //  弹窗展示组件：给个背景色，避免透明
    >.dialog-body {
        background-color: white;
        position: relative;
        border-radius: 4px;
        box-sizing: border-box;
        //  私有添加阴影，增强显示效果
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
    }
}

// *****************************************   👉  特殊状态    *****************************************
//  非激活状态时
.snail-dialog.unactive {
    &::before {
        display: none !important;
    }

    &>.dialog-body {
        box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
    }
}

// *****************************************   👉  组件动画    *****************************************
//  默认动画效果：弹窗显示、销毁时的
.snail-dialog-enter-active,
.snail-dialog-leave-active {
    // transition: opacity 0.5s ease-in-out;
    transition: scale 0.1s ease-in-out, opacity 0.1s ease;
}

.snail-dialog-enter-from {
    opacity: 0;
    scale: 0.4;
}

.snail-dialog-leave-to {
    opacity: 0;
    scale: 0;
}
</style>