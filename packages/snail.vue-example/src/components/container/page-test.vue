<!-- 组件介绍写到这里 -->
<template>
    <button @click="loadingRef = !loadingRef">切换loading</button>
    <button @click="onPageShellTest">PageShell测试：{{ vModelTest }}</button>
    <br />
    <br />
    <!-- 桌面环境 测试 -->
    <Env :mode="'desktop'">
        桌面模式，默认：
        <button @click="loadingRef = !loadingRef">切换loading</button><br />
        <Page style="width: 100%;height: 200px;border: 1px solid gray;" :type="'page'" :desktop="{
            main: {
                scroll: { bar: 'y' }
            }
        }" :loading="loadingRef">
            <template #desktop>
                <div style="height: 300px;">
                    destktop区域
                </div>
            </template>
        </Page>
        <br />
        桌面：Page模式
        <Page class="no-xxx" style="width: 100%;height: 200px;border: 1px solid gray;" :type="'page'"
            :loading="loadingRef" :desktop="{
                header: { title: '测试', divider: true },
                footer: {
                    align: 'end',
                    divider: true,
                    buttons: [
                        { id: 'xx', name: '测试', size: 'max' },
                        { id: 'xx1', name: '测试2', type: 'primary', size: 'max' }
                    ]
                }
            }">
            <template #desktop>
                destktop区域:
            </template>
        </Page>
        <br />
        桌面：Dialog模式
        <Page class="no-xxx" style="width: 100%;height: 200px;border: 1px solid gray;" :type="'dialog'"
            :loading="loadingRef" :desktop="{
                header: { title: '测试', divider: true },
                footer: {
                    align: 'end',
                    divider: true,
                    buttons: [
                        { id: 'xx', name: '测试', size: 'max' },
                        { id: 'xx1', name: '测试2', type: 'primary', size: 'max' }
                    ]
                }
            }">
            <template #desktop>
                destktop区域:
            </template>
        </Page>
        <br />
        桌面模式，无实现
        <Page style="width: 100%;height: 200px;border: 1px solid gray;" :type="'page'" :loading="loadingRef" />
    </Env>
    <!-- 移动端环境测试 -->
    <br />
    <br />
    <Env :mode="'mobile'">
        移动端：Dialog模式
        <Page style="width: 100%;height: 200px;border: 1px solid gray;" :type="'dialog'" :loading="loadingRef" :mobile="{
            header: { title: '测试移动端头部' },
            footer: {
                divider: true,
                buttons: [
                    { id: 'xx', name: '测试', size: 'max' },
                    { id: 'xx1', name: '测试2', type: 'primary', size: 'max' }
                ]
            }
        }">
            <template #mobile>
                mobile区域:
            </template>
        </Page>
        <br />
        移动端：Page模式
        <Page style="width: 100%;height: 200px;border: 1px solid gray;" :type="'page'" :mobile="{
            header: { title: '测试移动端头部' },
            main: { scroll: { bar: 'y', barSize: 'mini' } },
            footer: {
                buttons: [
                    { id: 'xx', name: '测试', size: 'max' },
                    { id: 'xx1', name: '测试2', type: 'primary', size: 'max' }
                ]
            }
        }" :loading="loadingRef">
            <template #mobile>
                <div style="height: 300px;">
                    mobile区域
                </div>
            </template>
        </Page>
        <br />
        移动端：默认插槽
        <Page style="width: 100%;height: 200px;border: 1px solid gray;" :type="'page'">
            <div style="color: red;">默认插槽实现，PC、移动端共享一个插槽</div>
        </Page>
        移动端模式，无实现
        <Page style="width: 100%;height: 200px;border: 1px solid gray;" :type="'page'" />
    </Env>
</template>

<script setup lang="ts">
import { shallowRef, ShallowRef } from "vue";
import { components, MOTION, PageShellOptions, usePopup } from "../../libraries/snail_vue";
import PageShellContent from "./components/page-shell-content.vue";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const { Page, PageShell, Env } = components;
const popup = usePopup();
const vModelTest: ShallowRef<string> = shallowRef(String(Date.now()));
//  2、组件交互变量、常量
const loadingRef: ShallowRef<boolean> = shallowRef(true);

// *****************************************   👉  方法+事件    ****************************************
function onPageShellTest() {
    const dialog = popup.dialog<any, PageShellOptions<Record<string, any>>, string>({
        component: PageShell,
        motion: MOTION.scale,
        props: {
            // size: { width: "50%", height: "40%" },
            // header: { useTo: "dialog", title: "测试弹窗壳" },
            rootClass: "page-shell-test",
            component: PageShellContent,
            props: {
                //  接收自定义事件
                onCustomEvent(data: number) {
                    console.log("接收自定义事件：", data);
                }
            }
        },
        model: vModelTest,
    });
    dialog.then(data => console.log("返回数据：", data));
}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应
setTimeout(() => loadingRef.value = false, 1000);
</script>

<style lang="less"></style>