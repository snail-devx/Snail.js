/**
 * 滚动组件的助手方法
 * - 方便 Scroll.vue 和 Elastic.vue 组件的滚动区域公用
 */

import { IScrollManager, ScrollStatus, useObserver } from "snail.view";
import { ScrollEvents, ScrollOptions } from "../models/scroll-model";
import { EmitterType, EventsType } from "../models/component-model";
import { IScope, useScope, useTimer } from "snail.core";
import { useReactive } from "../../base/reactive";
import { ref, Ref, shallowRef, ShallowRef } from "vue";

/**
 * 监听滚动视图
 * - 监听滚动条是否出现、是否发生变化，是否到顶部、底部
 * - 变化时，自动进行事件触发
 * @param manager 滚动视图管理器
 * @param root 滚动视图容器根元素
 * @param options 滚动视图配置选项
 * @param emiter 事件触发器
 * @param classStyleRef 自定义类样式引用，内部计算出来的自定义样式，进行.value重置值
 * @returns 作用域实例
 */
export function monitScroll(manager: IScrollManager, root: HTMLElement, options: ScrollOptions, emiter: EmitterType<ScrollEvents>, classStyleRef: ShallowRef<string[]>): IScope {
    const scope: IScope = useScope();
    let preStatus: ScrollStatus = undefined;
    //  定义监听变量
    const observer = useObserver();
    const timer = useTimer();
    const reactive = useReactive();

    /**
     * 构建自定义类样式
     */
    function buildClassStyle() {
        // 强制保留样式 `x-bar` `y-bar`；这是滚动条的状态样式，交给 refreshScrollInfo 管理
        const array: string[] = (classStyleRef.value ? [...classStyleRef.value] : [])
            .filter(item => item == "x-bar" || item == "y-bar");
        array.push(...manager.buildClassStyle(options));
        classStyleRef.value = array;
    }
    /**
     * 刷新滚动信息
     */
    function refreshScrollInfo() {
        //  计算滚滚动条状态，并冻结：计算左、右、顶、底时，对应方向需要有滚动条
        const status: ScrollStatus = Object.freeze<ScrollStatus>(manager.getStatus(root));
        //  计算触发事件：如没缓存上字状态
        const events: Partial<ScrollEvents> = Object.create(null);
        if (preStatus != undefined) {
            preStatus.xbar != status.xbar && (events.xbar = [status.xbar]);
            preStatus.ybar != status.ybar && (events.ybar = [status.ybar]);
            // 计算左侧、右侧、顶部、底部变化事件。仅在上次也有滚动条时处理（为避免滚动条从无到有时，顶部、左侧事件误报）
            if (preStatus.xbar == true && status.xbar == true) {
                status.left && preStatus.left !== status.left && (events.left = []);
                status.right && preStatus.right !== status.right && (events.right = []);
            }
            if (preStatus.ybar == true && status.ybar == true) {
                status.top && preStatus.top !== status.top && (events.top = []);
                status.bottom && preStatus.bottom !== status.bottom && (events.bottom = []);
            }
        }
        //  缓存本次状态；按需触发事件
        preStatus = status;
        events.xbar && emiter("xbar", ...events.xbar);
        events.left && emiter("left");
        events.right && emiter("right");
        events.ybar && emiter("ybar", ...events.ybar);
        events.top && emiter("top");
        events.bottom && emiter("bottom");
        //  增加样式标记，减少外部适配：水平、垂直滚动条；水平位置、垂直位置等
        {
            const array: string[] = (classStyleRef.value ? [...classStyleRef.value] : [])
                .filter(item => item != "x-bar" && item != "y-bar");
            status.xbar && array.push("x-bar");
            status.ybar && array.push("y-bar");
            classStyleRef.value = array;
        }
    }

    //  初始化+变化监听+事件监听
    buildClassStyle();
    refreshScrollInfo();
    reactive.watcher(() => options.scroll, buildClassStyle);
    reactive.watcher(() => options.barSize, buildClassStyle);
    observer.onSize(root, refreshScrollInfo);
    observer.onEvent(root, "scroll", refreshScrollInfo);
    //      定时器，监听滚动条的显隐状态：如内部内容变化导致的滚动条显隐
    timer.onInterval(() => {
        const isChange = (preStatus.scrollWidth != root.scrollWidth)
            || (preStatus.scrollHeight != root.scrollHeight);
        isChange && refreshScrollInfo();
    }, 100);
    //  监听销毁时机，进行自动销毁
    scope.onDestroy(() => {
        observer.destroyed || observer.destroy();
        timer.destroyed || timer.destroy();
        reactive.destroyed || reactive.destroy();
    });

    return scope;
}