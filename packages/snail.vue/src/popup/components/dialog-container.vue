<!-- 模态弹窗容器组件 -->
<template>
    <div :class="['snail-dialog', context.popupStatus.value, rootClass]" :style="{ 'z-index': context.zIndex }"
        @mousedown.self="onDialogRootMouseDown" @click.self="onDialogRootClick">
        <Dynamic :class="['dialog-body', context.motion.value]" :name="name" :component="component" :url="url"
            :props="props.props" v-model="model" :="handle" />
    </div>
</template>

<script setup lang="ts">
import { useObserver } from 'snail.view';
import { onMounted, shallowRef } from 'vue';
import Dynamic from '../../base/dynamic.vue';
import { DialogExtendOptions } from '../models/dialog-model';
import { PopupContainerOptions, PopupHandle } from '../models/popup-model';

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const props = defineProps<PopupContainerOptions<any, any, any> & DialogExtendOptions>();
const { context, model = shallowRef(undefined) } = props;
const { onEvent } = useObserver();
//  2、组件交互变量、常量
/**     弹窗句柄，下放给业务组件使用 */
const handle: PopupHandle<any> = Object.freeze<PopupHandle<any>>({
    inPopup: context.inPopup,
    popupStatus: context.popupStatus,
    closePopup: context.closePopup,
});
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
    evt.target === mousedownTarget && props.closeOnMask && context.closePopup();
    mousedownTarget = undefined;
}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应
onMounted(() => {
    onEvent(window, "keyup", (event: KeyboardEvent) => {
        event.key === "Escape" && context.popupStatus.value == "active"
            && props.closeOnEscape && context.closePopup();
    });
    //  监听全局的click事件，重置 mousedownTarget 对象
    onEvent(window, "click", () => mousedownTarget = undefined);
});

</script>

<style lang="less">
.snail-dialog {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    // flex布局，居中
    display: flex;
    justify-content: center;
    align-items: center;

    &::before {
        position: absolute;
        content: "";
        background-color: rgba(24, 27, 33, 0.45);
        width: 100%;
        height: 100%;
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