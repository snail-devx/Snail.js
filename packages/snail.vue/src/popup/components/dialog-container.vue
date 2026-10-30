<!-- 对话框弹窗容器：支持外部传入动画，不转则使用默认的 -->
<template>
    <div :class="['snail-dialog', options.rootClass, popupStatus.value]" :style="{ 'z-index': zIndex }"
        @mousedown.self="onDialogRootMouseDown" @click.self="onDialogRootClick">
        <Dynamic class="dialog-body" :class="motion.value" :name="options.name" :component="options.component"
            :url="options.url" :props="props" :="dialogExtend" :popup-status="popupStatus.value" v-model="model" />
    </div>
</template>

<script setup lang="ts">
import { useObserver } from "snail.view";
import { onMounted, shallowRef } from "vue";
import Dynamic from "../../base/dynamic.vue";
import { DialogHandle, DialogOptions } from "../models/dialog-model";
import { PopupDescriptor } from "../models/popup-model";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
defineOptions({ name: "DialogContainer", inheritAttrs: true, });
const { options, extOptions, popupStatus, zIndex, motion } = defineProps<PopupDescriptor<DialogOptions, DialogHandle<any>>>();
const { props, model = shallowRef(undefined) } = options;
const { closePopup, onBeforeClose } = extOptions;
/** 监听器 */
const { onEvent } = useObserver();
//  2、组件交互变量
/** 对话框扩展配置，传递给【内容组件】使用 */
const dialogExtend = Object.freeze<DialogHandle<any>>({
    inPopup: 'dialog',
    closePopup: closePopup,
    onBeforeClose: onBeforeClose
});
/** onBuildData 句柄方法 */
let fn_onBuildData: () => any | Promise<any> = undefined;
/** 鼠标按下时的目标元素：*/
let mousedownTarget: EventTarget = undefined;

// *****************************************   👉  方法+事件    ****************************************
/**
 * 对话框根元素鼠标按下时
 * @param evt 
 */
function onDialogRootMouseDown(evt: MouseEvent) {
    //  之前直接在 template 中写的，但是vue插件报错，MouseEvent无 value 属性，所以迁移成独立方法做赋值
    mousedownTarget = evt.target
}
/**
 * 鼠标点击时
 * @param evt 
 */
function onDialogRootClick(evt: MouseEvent) {
    //  必须是在自己触发的鼠标按下事件，否则不关闭；解决“在子元素按下鼠标，然后移动到容器元素上松开鼠标，此时click.self被触发了，导致弹窗关了”问题
    evt.target === mousedownTarget && options.closeOnMask && closePopup();
    mousedownTarget = undefined;
}

// *****************************************   👉  组件渲染    *****************************************
onMounted(() => {
    onEvent(window, "keyup", (event: KeyboardEvent) => {
        event.key === "Escape" && popupStatus.value == "active"
            && options.closeOnEscape && closePopup();
    });
    //  监听全局的click事件，重置 mousedownTarget 对象
    onEvent(window, "click", () => mousedownTarget = undefined);
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
.snail-dialog {

    //  非激活、关闭状态时，遮罩层透明度0
    &.unactive::before,
    &.closed::before {
        opacity: 0;
    }

    // 非激活状态时，做一点阴影效果做区分
    &.unactive {
        >.dialog-body {
            box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
        }
    }

}
</style>