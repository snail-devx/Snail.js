<!-- 组件介绍写到这里 -->
<template>
    <div class="popup-test">
        <button @click="openPopup">popup</button>
        <button @click="openDialog">打开弹窗</button>
        <button @click="onOpenInShell">使用弹窗壳</button>
        <hr />
        vModelTest值双向绑定到弹窗中：{{ vModelTest }}

        <!-- followX -->
        <button @click="onFollow($event, { followX: 'start' })"
            style="position: absolute;left: 0;top: 100px;">FollowX：start</button>
        <button @click="onFollow($event, { followX: 'end' })"
            style="position: absolute;right: 10px;top: 0;">FollowX：end</button>
        <button @click="onFollow($event, { followX: 'center' })"
            style="position: absolute;right: 150px;top: 10px;">FollowX：center</button>
        <button @click="onFollow($event, { followX: 'center' })"
            style="position: absolute;right: 50%;top: 50%;transform: translate(-50%,-50%);">FollowX：center</button>
        <!-- followWidth -->
        <div style="width: 1000px;height: 200px;line-height: 200px;border: 1px solid red;"
            @click="onFollow($event, { followWidth: true })">
            followWidth</div>
    </div>

</template>

<script setup lang="ts">
import { shallowRef } from 'vue';
import { components, FollowOptions, MOTION, PopupShellOptions, usePopup } from '../../libraries/snail_vue';
import ChildContent from './components/child-content.vue';


// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const popup = usePopup();
const vModelTest = shallowRef<boolean>(true);
const { PopupShell } = components;
//  2、组件交互变量、常量
const followOpitions: FollowOptions = Object.freeze<FollowOptions>({
    component: ChildContent,
    closeOnEscape: true,
    closeOnMask: true,
    closeOnResize: true,
    closeOnTarget: true,
});

// *****************************************   👉  方法+事件    ****************************************
function openPopup() {
    popup.popup({
        component: ChildContent,
        props: {

        },
        zIndex: 4000,
    });
}
/**
 * 打开弹窗
 */
function openDialog() {
    const dialog = popup.dialog<any, Record<string, any>, boolean>({
        component: ChildContent,
        closeOnEscape: true,
        closeOnMask: true,
        motion: MOTION.bottom,
        props: {
            //  接收自定义事件
            onCustomEvent(data: number) {
                console.log("接收自定义事件：", data);
            }
        },
        model: vModelTest,
    });
    dialog.then(data => console.log("返回数据：", data));
    // 测试弹窗自动关闭
    // setTimeout(() => dialog.close(), 4000);
}
/**
 * 在弹窗壳中打开弹窗
 */
function onOpenInShell() {
    const dialog = popup.dialog<any, PopupShellOptions<Record<string, any>>, boolean>({
        component: PopupShell,
        closeOnEscape: true,
        closeOnMask: true,
        motion: MOTION.scale,
        props: {
            size: { width: "50%", height: "40%" },
            header: { useTo: "dialog", title: "测试弹窗壳" },
            main: {
                component: ChildContent,
                props: {
                    //  接收自定义事件
                    onCustomEvent(data: number) {
                        console.log("接收自定义事件：", data);
                    }
                }
            }
        },
        model: vModelTest,
    });
    dialog.then(data => console.log("返回数据：", data));
}
/**
 * 启动跟随
 * @param data 
 */
function onFollow(evt: Event, data: Partial<FollowOptions>): void {
    const options = Object.assign({}, followOpitions, data);
    popup.follow(evt.target as HTMLElement, options);
}


// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应

</script>

<style lang="less">
.popup-test {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    position: relative;
}
</style>