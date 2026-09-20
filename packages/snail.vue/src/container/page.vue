<!-- 页面组件：兼容App打开、桌面端弹窗、嵌入等模式打开
    1、提供 桌面端、移动端两个插槽，进行分别逻辑实现
    2、desktop 桌面客户端模式下，支持弹窗方式时，支持Header和Footer配置
        1、弹窗模式下使用时，给个默认大小，并支持根据内容区域自适应
        2、支持配置内容区域的滚动模式等
    3、mobile 移动端模式下
        1、支持Footer配置，指定操作按钮，先默认确定和取消，后期看情况在增加
        2、支持内容区域配置滚动模式等
-->
<template>
    <div class="snail-page" :class="pageMode">
        <!-- 桌面客户端模式 -->
        <template v-if="pageMode != 'mobile'">
            <Header class="header-area" v-if="desktop && desktop.header && desktop.header.disabled != true"
                :="desktop.header" @close="emits('cancel')" />
            <Scroll class="main-area flex-1" :="desktop ? desktop.main : Object.create(null)">
                <slot name="desktop">
                    <Empty :message="'未实现桌面端渲染'" />
                </slot>
            </Scroll>
            <Footer class="footer-area" v-if="desktop && desktop.footer && desktop.footer.disabled != true"
                :="desktop.footer" @confirm="emits('confirm')" @cancel="emits('cancel')" />
        </template>
        <!-- 移动端模式 -->
        <template v-else>
            <Scroll class="main-area flex-1" :="mobile ? mobile.main : Object.create(null)">
                <slot name="mobile">
                    <Empty :message="'未实现移动端渲染'" />
                </slot>
            </Scroll>
            <Footer class="footer-area" v-if="mobile && mobile.footer && mobile.footer.disabled != true"
                :="mobile.footer" @confirm="emits('confirm')" @cancel="emits('cancel')" />
        </template>
    </div>
</template>
<script setup lang="ts">
import Footer from '../base/footer.vue';
import Header from '../base/header.vue';
import { setPageMode } from '../base/utils/app-util';
import Empty from '../prompt/empty.vue';
import { PageEvents, PageOptions } from './models/page-model';
import Scroll from './scroll.vue';

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const props = defineProps<PageOptions>();
const emits = defineEmits<PageEvents>();
//  2、组件交互变量、常量
/** 页面模式 */
const pageMode: PageOptions["mode"] = setPageMode(props.mode);

// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-page {
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    >div.main-area {
        position: relative;
    }

    // 桌面端
    &.desktop {

        // 弹窗打开时
        &.dialog-body {
            width: 80%;
            max-width: 1000px;
            height: 70%;

            >div.main-area {
                margin: 0 40px;
            }
        }
    }

    // 移动端渲染
    &.mobile {
        width: 100%;
        height: 100%;
        background: #F7F8F9;

        >.footer-area {
            margin-top: 8px;
            height: 55px;
            padding: 0 12px;
            box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
            background: white;

            >div {
                flex: 1;
                font-size: 16px;
            }
        }
    }
}
</style>