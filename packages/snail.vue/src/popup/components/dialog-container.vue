<!-- 对话框弹窗容器：支持外部传入动画，不转则使用默认的 -->
<template>
    <div :class="['snail-dialog', options.rootClass, popupStatus.value, popupTransition.value]"
        :style="{ 'z-index': zIndex }" @click.self="options.closeOnMask && closePopup();">
        <template v-if="options.wrapper == undefined" :key="'no-wrapper'">
            <Dynamic class="dialog-body" :name="options.name" :component="options.component" :url="options.url"
                :props="props" :="dialogExtend" :popup-status="popupStatus.value" v-model="model" />
        </template>
        <!-- 启用Wrapper模式时，强制注入【onBuildData】 -->
        <Wrapper v-else class="dialog-body" :in-popup="true" :="options.wrapper" @cancel="closePopup()"
            @confirm="onWrapperConfirm">
            <Dynamic :name="options.name" :component="options.component" :url="options.url" :props="props"
                :="dialogExtend" :popup-status="popupStatus.value" v-model="model"
                :on-build-data="registerBuildDataFunc" />
        </Wrapper>
    </div>
</template>

<script setup lang="ts">
import { onMounted, shallowRef } from "vue";
import { DialogOptions, DialogHandle, DialogWrapperHandle } from "../models/dialog-model";
import { PopupDescriptor } from "../models/popup-model";
import Dynamic from "../../container/dynamic.vue";
import { useObserver } from "snail.view";
import Wrapper from "../../container/wrapper.vue";
import { mustFunction, runAsync, wait } from "snail.core";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
defineOptions({ name: "DialogContainer", inheritAttrs: true, });
const { options, extOptions, popupStatus, zIndex, popupTransition } = defineProps<PopupDescriptor<DialogOptions, DialogHandle<any>>>();
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

// *****************************************   👉  方法+事件    ****************************************
/**
 * 注册【构建数据】方法
 * - 使用变量，方便复用类型
 * @param fn 
 */
const registerBuildDataFunc: DialogWrapperHandle<any>["onBuildData"] = fn => {
    mustFunction(fn, "fn");
    fn_onBuildData = fn;
};
/**
 * 包裹器【确认】按钮点击时
 */
async function onWrapperConfirm() {
    if (fn_onBuildData != undefined) {
        const rt = await runAsync(fn_onBuildData);
        console.log("onBuildData result：", rt);
        rt.success !== false && closePopup(rt.data);
    }
    else {
        closePopup();
    }
}

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

    // 启用包裹组件时，特殊样式：默认不制定高度和宽度，由内容组件自己决定
    >.snail-wrapper {
        min-width: auto;
        width: fit-content;
        min-height: auto;
        height: fit-content;

        >.wrapper-body {
            padding: 0 40px;
        }
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