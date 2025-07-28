<!-- 折叠面板组件：支持展开收起；
    1、定义v-model绑定展开收起属性 ；方便外部进行状态管理
    2、标题支持外部传入插槽做定制
    3、后续支持内容区域最大高度，从而支持滚动条
-->
<template>
    <div class="snail-fold" :class="statusModel">
        <!-- 折叠面板头部：支持插槽，并做默认实现 -->
        <div class="fold-header">
            <slot name="header">
                <div class="title" v-text="props.title" />
                <div class="subtitle" v-if="!!props.subtitle" v-text="props.subtitle" />
                <div class="status" v-if="props.disabled != true">
                    <span :title="statusModel == 'expand' ? '收起' : '展开'" ref="foldStatusSpan">
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
import { throwError } from "snail.core";
import { useAnimation } from "snail.view";
import { useTemplateRef } from "vue";
import Icon from "../base/icon.vue";
import { FoldEvents, FoldOptions, FoldStatus } from "./models/fold-model";
import { getFoldStatusDraw } from "./utils/fold-util";
import { useReactive } from "../base/reactive";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const props = defineProps<FoldOptions>();
const emits = defineEmits<FoldEvents>();
const { transition } = useAnimation();
const { watcher } = useReactive();
/**     折叠状态：默认展开 */
const statusModel = defineModel<FoldStatus>("status", { default: "expand" });
//      监听折叠状态，进行样式计算
watcher(statusModel, updateFoldStyle);
/**     展开、收起图标绘制路径 */
const statusIcon: string = getFoldStatusDraw();
/**     折叠状态区域引用 */
const statusDom = useTemplateRef("foldStatusSpan");
/**     折叠面板内容区域引用 */
const foldBodyDom = useTemplateRef("foldBody");
//  2、可选配置选项
defineOptions({ name: "Fold", inheritAttrs: true, });

// *****************************************   👉  方法+事件    ****************************************
/**
 * 更新面板展示样式
 */
function updateFoldStyle() {
    /** 是否是展开状态 */
    const isExpand = statusModel.value == "expand";
    //  折叠图标样式：这个可以用vue的响应式，配合class样式，这里纯粹是为了验证transition动画
    if (statusDom.value) {
        transition(statusDom.value, {
            from: {
                transition: "transform 0.2s ease",
                transform: isExpand ? "rotateZ(180deg)" : "rotate(0)"
            },
            to: { transform: isExpand ? "rotate(0)" : "rotateZ(180deg)" },
            end: { transform: isExpand ? "" : "rotateZ(180deg)" }
        });
    }
    //  折叠内容样式：折叠时，动画完成后保留target样式，且此时overflow:hidden，否则折叠将失效
    if (foldBodyDom.value) {
        const minHeight = 32;
        const maxHeight = minHeight + foldBodyDom.value.getBoundingClientRect().height;
        transition(foldBodyDom.value.parentElement, {
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
    switch (statusModel.value) {
        //  展开时，折叠
        case "expand":
            statusModel.value = "fold";
            break;
        //  折叠时，展开
        case "fold":
            statusModel.value = "expand";
            break;
        //  不支持的状态，强制报错
        default:
            throwError(`Fold not support status value: ${statusModel.value}`);
    }
    emits("change", statusModel.value);
}
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/base-mixins.less";

.snail-fold {
    flex-shrink: 0;

    >div.fold-header {
        position: relative;
        height: 32px;
        user-select: none;
        // flex 布局：display: flex，align-items 为center
        .flex-cross-center();

        //  标题前的 标记
        &::before {
            position: absolute;
            left: 0;
            top: 7px;
            width: 4px;
            height: 18px;
            content: "";
            background-color: rgb(44, 151, 251);
        }

        //  标题、副标题
        >.title,
        >.subtitle {
            // 文本溢出时出省略号
            .text-ellipsis();
        }

        >.title {
            padding-left: 20px;
            font-size: 14px;
            font-weight: bold;
            color: #2e3033;
        }

        >.subtitle {
            font-size: 13px;
            color: #8a9099;
        }

        //  状态图标：默认【收起】指示，增加动画效果
        >div.status {
            flex: 1;
            // flex 布局：display: flex，align-items、justify-content 都为right
            .flex-right();
        }
    }

    >div.fold-body {
        padding-left: 20px;
    }
}
</style>