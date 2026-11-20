<!-- 页面组件：兼容App打开、桌面端弹窗、嵌入等模式打开
    1、提供 桌面端、移动端两个插槽，进行分别逻辑实现
    2、desktop 桌面客户端模式下，支持弹窗方式时，支持Header和Footer配置
        1、弹窗模式下使用时，给个默认大小，并支持根据内容区域自适应
        2、支持配置内容区域的滚动模式等
    3、mobile 移动端模式下
        1、支持Footer配置，指定操作按钮，先默认确定和取消，后期看情况在增加
        2、支持内容区域配置滚动模式等
    4、支持 default 插槽，实现各端共享主内容区域渲染，如表单
    5、bottom区域支持完全自定义
-->
<template>
    <Layout :class="['snail-page', mode]" :direction="'vertical'" :top="topLayoutRef" :main="mainLayoutRef"
        :bottom="bottomLayoutRef" :loading="loading">
        <!-- 头部区域渲染，支持PC、移动端，支持header插槽进行自定义渲染 -->
        <template #top v-if="topLayoutRef != undefined">
            <!-- 移动端：返回、关闭图标；标题；右侧插槽；图标使用全新的，不用icon中的 arrow 和 plus ；效果上有点差异 -->
            <template v-if="mode == 'mobile'">
                <div class="left-buttons">
                    <svg class="back-icon" v-if="pageAreaRef.header.backDisabled != true" viewBox="0 0 24 24" width="34"
                        height="34" @click="emits('back')">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                    <svg class="close-icon" v-if="pageAreaRef.header.closeDisabled != true" viewBox="0 0 24 24"
                        width="32" height="32" @click="emits('close')">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </div>
                <div class="header-title ellipsis" :class="pageAreaRef.header.align || 'center'"
                    v-if="isStringNotEmpty(pageAreaRef.header.title)" v-text="pageAreaRef.header.title" />
                <div class="righ-slot" v-if="$slots['header']">
                    <slot name="header" :="slotHandle" />
                </div>
            </template>
            <!-- PC端：标题、插槽、关闭按钮 -->
            <template v-else>
                <div class="header-title ellipsis" :class="pageAreaRef.header.align || 'center'"
                    v-if="isStringNotEmpty(pageAreaRef.header.title)" v-text="pageAreaRef.header.title" />
                <slot name="header" :="slotHandle" />
                <Icon class="close-icon" v-if="pageAreaRef.header.closeDisabled != true" button :type="'close'"
                    :size="24" :padding="'4px'" :title="'关闭'" @click="emits('close')" />
            </template>
        </template>
        <!-- 主内容区域渲染：不支持的mode，给出提示；插槽支持 [mode] > default -->
        <template #main>
            <template v-if="mainLayoutRef != undefined">
                <slot v-if="$slots[mode]" :name="mode" :="slotHandle" />
                <slot v-else-if="$slots.default" :="slotHandle" />
                <Empty v-else :message="`未实现[${mode}]端渲染`" />
            </template>
            <Empty v-else :message="`未实现[${mode}]端渲染`" />
        </template>
        <!-- 渲染底部区域：有操作按钮时才渲染：可以完全自定义 -->
        <template #bottom v-if="bottomLayoutRef != undefined">
            <slot v-if="$slots['footer']" name="footer" :="slotHandle" />
            <template v-else>
                <Button v-for="button in pageAreaRef.footer.buttons || []" :key="button.id"
                    v-show="button.disabled != true" :type="button.type" :size="button.size || 'max'"
                    :title="button.name" v-text="button.name" @click="evt => onFooterButtonClick(button, evt)" />
            </template>
        </template>
    </Layout>
</template>
<script setup lang="ts">
import { isStringNotEmpty } from 'snail.core';
import { computed } from 'vue';
import Button from '../base/button.vue';
import Icon from '../base/icon.vue';
import { FooterButton } from '../base/models/header-footer-model';
import { useApp } from '../base/utils/app-util';
import { LayoutOptions } from '../container/models/layout-model';
import Empty from '../prompt/empty.vue';
import Layout from './layout.vue';
import { PageAreaOptions, PageEvents, PageOptions, PageSlotHandle } from './models/page-model';

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const props = defineProps<PageOptions>();
const emits = defineEmits<PageEvents>();
const { mode } = useApp();
//  2、组件交互变量、常量
/**     插槽句柄 */
const slotHandle: PageSlotHandle = Object.freeze<PageSlotHandle>({ mode });
/**     页面配置：基于mode动态计算出来，暂时仅支持desktop和mobile模式 */
const pageAreaRef = computed<PageAreaOptions>(() => mode == "mobile"
    ? (props.mobile || Object.create(null))
    : (mode == "desktop"
        ? (props.desktop || Object.create(null))
        : undefined
    )
);
//  3、顶部、主内容、底部区域布局配置：根据mode动态计算出来
/**     顶部区域布局配置 */
const topLayoutRef = computed<LayoutOptions["top"]>(() => {
    if (pageAreaRef.value && pageAreaRef.value.header && pageAreaRef.value.header.disabled != true) {
        const classes: string[] = [pageAreaRef.value.header.useTo || "page"];
        pageAreaRef.value.header.divider && classes.push('start-divider');
        return { class: classes };
    }
    return undefined;
});
/**     主内容区域：做一些默认配置处理*/
const mainLayoutRef = computed<LayoutOptions['main']>(() => pageAreaRef.value != undefined
    ? {
        scroll: { bar: "y", barSize: mode == 'mobile' ? 'mini' : 'small' },
        ...pageAreaRef.value.main
    }
    : undefined
);
/**     底部区域布局配置：默认选项梳理，移动端默认起始位置对齐 */
const bottomLayoutRef = computed<LayoutOptions['bottom']>(() => {
    const footer = pageAreaRef.value ? pageAreaRef.value.footer : undefined;
    if (footer && footer.disabled != true) {
        const classes: string[] = [];
        classes.push(footer.align || (mode == 'mobile' ? 'start' : 'end'));
        footer.divider && classes.push('start-divider');
        return { class: classes };
    }
    return undefined;
});

// *****************************************   👉  方法+事件    ****************************************
/**
 * 底部按钮点击事件
 * @param button 
 * @param evt 
 */
function onFooterButtonClick(button: FooterButton, evt: MouseEvent | TouchEvent | PointerEvent) {
    emits("button", button.id, evt);
    button.click && button.click();
}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

// 基础架构：通用样式
.snail-page {

    // 顶部导航条区域
    >div.top-area {
        position: relative;
        background-color: white;
        display: flex;
        align-items: center;

        &.start-divider {
            border-bottom: 1px solid #dddfed;
        }

        //  标题区域
        >.header-title {
            color: #2e3033;
            line-height: 48px;
            flex: 1;
            padding: 0 30px;

            // 标题区域的文本对齐方式
            & {
                &.start {
                    text-align: left;
                }

                &.center {
                    text-align: center;
                }

                &.end {
                    text-align: right;
                }
            }
        }
    }

    // 主内容区域
    >div.main-area {
        position: relative;
    }

    // 底部操作按钮区域
    >div.bottom-area {
        position: relative;
        background-color: white;
        display: flex;
        align-items: center;
        gap: 20px;

        &.start-divider {
            border-top: 1px solid #dddfed;
        }

        // 对齐方式
        & {
            &.start {
                justify-content: flex-start;
            }

            &.center {
                justify-content: center;
            }

            &.end {
                justify-content: flex-end;
            }
        }
    }
}

//  PC适配：适配弹窗等地方
.snail-page.desktop {

    // 顶部导航条区域
    >div.top-area {

        //  Page模式时：高度、字体差异；关闭按钮右边距
        &.page {
            height: 48px;

            >.header-title {
                font-size: 16px;
                font-weight: bold;
            }

            >.close-icon {
                margin-right: 18px;
            }
        }

        //  Dialog模式时：高度差异、字体；关闭按钮做绝对定位
        &.dialog {
            height: 64px;
            padding-top: 16px;

            >.header-title {
                font-size: 20px;
            }

            >.close-icon {
                position: absolute;
                top: 8px;
                right: 8px;
            }
        }
    }

    // 底部操作按钮区域
    >div.bottom-area {
        height: 72px;
        padding: 0 40px;
    }
}

//  移动端适配
.snail-page.mobile {
    //  默认全屏，多用于独立完整html页面，后期看情况再调整
    width: 100%;
    height: 100%;
    background: #F7F8F9;

    // 顶部导航条区域：全屏浏览器下的兼容适配，留出状态栏的空间出来
    >div.top-area {
        padding-top: calc(env(safe-area-inset-top, 0));
        user-select: none;
        color: #000000;
        gap: 8px;

        // 左右两边，强制固定100px；剩余的给中间区域
        >div.left-buttons,
        >div.righ-slot {
            flex: none;
            width: 100px;
            overflow: hidden;
            padding: 0 6px;
        }

        // 左侧的返回、关闭按钮
        >div.left-buttons {
            display: flex;
            align-items: center;
            gap: 10px;

            >svg {
                cursor: pointer;
                fill: none;
                stroke: currentColor;
                stroke-width: 2;
                stroke-linecap: round;
                stroke-linejoin: round;
            }
        }

        // 主内容区域：显示标题，文本居中加粗
        .header-title {
            flex: 1;
            text-align: center;
            font-size: 18px;
            font-weight: 500;
        }
    }

    // 底部操作按钮区域
    >div.bottom-area {
        height: 56px;
        padding: 0 12px;
        z-index: 1;
        box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);

        // 按钮 均分宽度
        >div.snail-button {
            flex: 1;
            min-width: fit-content;
            font-size: 16px;
        }
    }
}
</style>