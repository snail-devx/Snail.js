<!-- dialog弹窗的包裹层
    1、将所有弹窗通义放到此组件中管理，外部传入需要dialog展示的内容即可 
    2、👋👋此组件不对外使用👋👋，外部若需要，通过 openDialog方法打开
-->
<template>
    <TransitionGroup name="snail-dialog">
        <div v-for="(dialog, $index) in descriptors" :key="dialog.id" class="snail-dialog"
            :class="dialog.options.rootClass" v-bind:class="{ 'unactive': descriptors.length - 1 !== $index }"
            :style="'z-index:' + dialog.options.zIndex" @click.self="onMaskClick(dialog)">
            <Dynamic class="dialog-body" :name="dialog.options.name" :component="dialog.options.component"
                :url="dialog.options.url" :class="dialog.options.class" :style="dialog.options.style"
                v-bind="dialog.options.props" :="dialog.handle" />
        </div>
    </TransitionGroup>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import { Dialog } from "../models/dialog-model";
import Dynamic from "../dynamic.vue";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data、event
const { descriptors } = defineProps({
    /** 弹窗描述器 */
    descriptors: {
        type: Array as PropType<Dialog[]>,
        required: true,
    },
});
//  2、可选配置选项
defineOptions({ name: "DialogWrapper", inheritAttrs: true, });

// *****************************************   👉  方法+事件    ****************************************
/**
 * 遮罩层点击时：判断是否是最新的弹窗，判断是否需要进行esc关闭事件处理
 * @param dialog 
 */
function onMaskClick(dialog: Dialog): void {
    const last = descriptors[descriptors.length - 1];
    last === dialog && dialog.options.closeOnMask && dialog.handle.closeDialog(dialog);
}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//      全局监听key事件：取到最新的弹窗，判断是否需要进行esc关闭事件处理
addEventListener("keyup", event => {
    if (event.key === "Escape" && descriptors.length > 0) {
        const dialog = descriptors[descriptors.length - 1];
        dialog.options.closeOnEscape && dialog.handle.closeDialog(dialog);
    }
});
//  2、生命周期响应
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/base-mixins.less";

.snail-dialog {
    position: fixed;
    // x、y起始位置：left:0,top:0
    .zero-position();
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

    //  弹窗非激活状态时
    &.unactive {
        &::before {
            display: none !important;
        }

        &>.dialog-body {
            box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
        }
    }
}

//  弹窗显示、销毁时的动画效果：后期考虑可以让外部全局配置
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