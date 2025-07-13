<!-- 折叠面板组件：支持展开收起；
    1、定义v-model绑定展开收起属性 ；方便外部进行状态管理
    2、标题支持外部传入插槽做定制
    3、后续支持内容区域最大高度，从而支持滚动条
-->
<template>
    <div class="snail-fold" :class="status">
        <!-- 折叠面板头部：支持插槽，并做默认实现 -->
        <div class="fold-header">
            <slot name="header">
                <div class="title" v-text="props.title" />
                <div class="subtitle" v-if="!!props.subtitle" v-text="props.subtitle" />
                <div class="status" v-if="props.disabled != true">
                    <span :title="status == 'expand' ? '收起' : '展开'" ref="foldStatusSpan">
                        <Icon :type="'custom'" :draw="statusIcon" @click="onStatusClick" />
                    </span>
                </div>
            </slot>
        </div>
        <!-- 折叠面板内容区域：后续支持最大高度，然后垂直滚动 -->
        <div class="fold-body" ref="foldBody">
            <slot />
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, shallowRef, useTemplateRef, watch } from "vue";
import { FoldEvents, FoldOptions, FoldStatus } from "./models/fold-model";
import { getFoldStatusDraw } from "./utils/fold-util";
import { useAnimation } from "snail.view";
import { throwError, useScopes } from "snail.core";
import Icon from "../base/icon.vue";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const props = defineProps<FoldOptions>();
const emit = defineEmits<FoldEvents>();
/**     动画作用域：执行展开，折叠动画 */
const animationScope = useAnimation();
/**     折叠状态：默认展开 */
const status = defineModel<FoldStatus>("status", { default: "expand" });
/**     监听折叠状态，进行样式计算*/
const statusWatch = watch(status, updateFoldStyle);
/**     展开、收起图标绘制路径 */
const statusIcon: string = getFoldStatusDraw();
/**      折叠状态区域引用 */
const foldStatusSpanRef = useTemplateRef("foldStatusSpan");
/**     折叠面板内容区域引用 */
const foldBodyRef = useTemplateRef("foldBody");
//  2、可选配置选项
defineOptions({ name: "Fold", inheritAttrs: true, });

// *****************************************   👉  方法+事件    ****************************************
/**
 * 更新面板展示样式
 */
function updateFoldStyle() {
    /** 是否是展开状态 */
    const isExpand = status.value == "expand";
    //  折叠图标样式：这个可以用vue的响应式，配合class样式，这里纯粹是为了验证transition动画
    if (foldStatusSpanRef.value) {
        animationScope.transition(foldStatusSpanRef.value, {
            from: {
                transition: "transform 0.2s ease",
                transform: isExpand ? "rotateZ(180deg)" : "rotate(0)"
            },
            to: { transform: isExpand ? "rotate(0)" : "rotateZ(180deg)" },
            end: { transform: isExpand ? "" : "rotateZ(180deg)" }
        });
    }
    //  折叠内容样式：折叠时，动画完成后保留target样式，且此时overflow:hidden，否则折叠将失效
    if (foldBodyRef.value) {
        const minHeight = 32;
        const maxHeight = minHeight + foldBodyRef.value.getBoundingClientRect().height;
        animationScope.transition(foldBodyRef.value.parentElement, {
            from: {
                transition: "height 0.2s ease",
                overflow: "hidden",
                height: `${isExpand ? minHeight : maxHeight}px`
            },
            to: { height: `${isExpand ? maxHeight : minHeight}px` },
            end: {
                overflow: isExpand ? "" : "hidden",
                height: isExpand ? "" : `${minHeight}px`,
            }
        });
    }
}
/** 状态图标点击事件：切换展开、收起状态 */
function onStatusClick() {
    switch (status.value) {
        //  展开时，折叠
        case "expand":
            status.value = "fold";
            break;
        //  折叠时，展开
        case "fold":
            status.value = "expand";
            break;
        //  不支持的状态，强制报错
        default:
            throwError(`Fold not support status value: ${status.value}`);
    }
    emit("change", status.value);
}

// *****************************************   👉  组件渲染    *****************************************
//  生命周期响应
onUnmounted(() => {
    animationScope.destroy();
    statusWatch.stop();
});
</script>

<style lang="less">
.snail-fold {
    flex-shrink: 0;

    >div.fold-header {
        height: 32px;
        position: relative;
        display: flex;
        align-items: center;
        user-select: none;

        //  标题前的 标记
        &::before {
            position: absolute;
            content: "";
            height: 18px;
            top: 7px;
            width: 4px;
            left: 0;
            background-color: rgb(44, 151, 251);
        }

        //  标题、副标题，不换行，移除隐藏
        >.title,
        >.subtitle {
            white-space: nowrap;
            overflow: hidden;
        }

        >.title {
            font-size: 14px;
            font-weight: bold;
            color: #2e3033;
            padding-left: 20px;
        }

        >.subtitle {
            font-size: 13px;
            color: #8a9099;
        }

        //  状态图标：默认【收起】指示，增加动画效果
        >div.status {
            flex: 1;
            display: flex;
            justify-content: right;
            justify-self: right;
        }
    }

    >div.fold-body {
        padding-left: 20px;
    }
}
</style>