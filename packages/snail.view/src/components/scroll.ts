/**
 * 滚动相关组件
 */

import { correctFunction, correctNumber, correctString, IScope, isNumberInRange, isObject, mountScope, run, throwIfFalse, throwIfNullish, useScope } from "snail.core";
import { ElasticDetail, ElasticBaseOptions, IElasticManager, IScrollManager, ScrollbarOptions, ScrollStatus, ElasticStatus } from "../models/scroll-model";
import { ElementPosition, ElementSize, TouchDetail, TouchDistance, useObserver } from "./observer";

// 把自己的类型共享出去
export * from "../models/scroll-model";

/**
 * 使用滚动视图
 * @returns 滚动视图管理器+作用域实例
 */
export function useScroll(): IScrollManager & IScope {

    //#region ************************************* 接口方法：IScrollManager具体实现 *************************************
    /**
     * 是否到最左了
     * @param root 视图根节点
     * @returns 
     */
    function isLeft(root: HTMLElement): boolean {
        return root.scrollLeft == 0;
    }
    /**
     * 是否到最右了
     * @param root 视图根节点
     */
    function isRight(root: HTMLElement): boolean {
        //  不管是否存在滚动条，滚动条是否存在单独判断：移动端特定情况下，有些极端情况下存在小数位置，加起来微超过，没查具体原因，先兼容一下
        // return (root.scrollLeft + root.clientWidth) >= root.scrollWidth
        return Math.abs(root.scrollWidth - root.clientWidth - root.scrollLeft) < 1;
    }
    /**
     * 是否到最顶了
     * @param root 视图根节点
     * @returns 
     */
    function isTop(root: HTMLElement): boolean {
        return root.scrollTop == 0;
    }
    /**
     * 是否到最底了
     * @param root 视图根节点
     * @returns 
     */
    function isBottom(root: HTMLElement): boolean {
        //  不管是否存在滚动条，滚动条是否存在单独判断：移动端特定情况下，有些极端情况下存在小数位置，加起来微超过，没查具体原因，先兼容一下
        // return (root.scrollTop + root.clientHeight) >= root.scrollHeight;
        return Math.abs(root.scrollHeight - root.clientHeight - root.scrollTop) < 1;
    }

    /**
     * 获取滚动状态
     * @param root 视图根节点
     * @returns 
     */
    function getStatus(root: HTMLElement): ScrollStatus {
        const status: ScrollStatus = {
            xbar: root.scrollWidth > root.clientWidth,
            ybar: root.scrollHeight > root.clientHeight,
            left: false,
            right: false,
            top: false,
            bottom: false,
            //  滚动视图相关信息
            scrollWidth: root.scrollWidth,
            scrollHeight: root.scrollHeight,
            scrollLeft: root.scrollLeft,
            scrollTop: root.scrollTop,
        };
        if (status.xbar == true) {
            status.left = isLeft(root);
            status.right = isRight(root);
        }
        if (status.ybar == true) {
            status.top = isTop(root);
            status.bottom = isBottom(root);
        }
        return status;
    }

    /**
    * 构建滚动视图的自定义样式
    * @param options 滚动视图配置选项
    * @returns 类样式数组 
    */
    function buildClassStyle(options: ScrollbarOptions): string[] {
        const classes: string[] = [];
        //  scroll
        switch (options ? options.scroll : undefined) {
            case "x":
            case "y":
            case "none":
                classes.push(`scroll-${options.scroll}`);
                break;
            case "both":
                classes.push("scroll-xy");
                break;
        }
        //  barSize
        const barSize: string = options
            ? correctString(options.barSize, undefined, true)
            : undefined;
        barSize && classes.push(`${barSize}-scrollbar`);

        return classes;
    }
    //#endregion

    //  构建管理器
    return Object.freeze(mountScope<IScrollManager>({
        isLeft, isRight,
        isTop, isBottom,
        getStatus,
        buildClassStyle,
    }, "IScrollManager"));
}

/**
 * 使用弹性滚动
 * - 使用 transform 控制滚动效果
 * @param target 要实现弹性滚动的目标元素；在此元素的父元素上监听滚动相关事件
 * @param options 
 * @param fn 弹性滚动过程中的回调同步方法，如滚动结束，滚动开始、、、
 * @returns 弹性滚动管理器+作用域实例
 */
export function useElastic(target: HTMLElement, options: ElasticBaseOptions, fn?: (detail: ElasticDetail) => void): IElasticManager & IScope {
    //  临时变量
    // /**     当前禁用了弹性滚动 */
    // let isDisabled: boolean = false;
    /**     当前滚动位置*/
    let curPosition: ElementPosition = Object.freeze<ElementPosition>({ x: 0, y: 0 });
    /**     启动时的位置 */
    let startPosition: ElementPosition = Object.freeze<ElementPosition>({ x: 0, y: 0 });
    /**     上一次的触摸移动信息，用于最后结束时计算惯性使用 */
    let preTouch: TouchDistance = undefined;

    //#region ************************************* 接口方法：IObserver具体实现 *************************************
    // /**
    //  * 禁用弹性滚动
    //  * @param disabled 为true时禁用弹性滚动；否则启用弹性滚动
    //  */
    // function disable(disabled: boolean): void {
    //     isDisabled = disabled === true;
    // }
    /**
     * 滚动到指定位置
     * @param x x轴位置，为空不滚动x轴
     * @param y y轴位置，为空不滚动y轴
     */
    function scrollTo(x: number | undefined, y: number | undefined): void {
        x = correctNumber(x, undefined);
        y = correctNumber(y, undefined);
        ({ x, y } = calcEndPosition(x, y));
        updateTranslate(true, x, y);
    }
    /**
     * 刷新
     * - 重新计算位置，避免漂移出去
     * - 如在滚动区域大小发生变化时刷新位置
     */
    function refresh(): void {
        const position = calcEndPosition(curPosition.x, curPosition.y);
        updateTranslate(true, position.x, position.y);
    }
    //#endregion

    //#region ************************************* 内部方法：辅助结构实现的方法 *************************************
    /**
     * 更新滚动值
     * - 反应到target元素中
     * - 实时同步给 prePosition
     * @param animation 是否需要动画
     * @param translateX x轴的translate值
     * @param translateY y轴的translate值
     */
    function updateTranslate(animation: boolean, translateX: number, translateY: number) {
        const position: ElementPosition = { ...curPosition };
        translateX != undefined && (position.x = translateX);
        translateY != undefined && (position.y = translateY);
        target.style.transform = `translate(${position.x}px,${position.y}px)`;
        target.style.transition = animation == true ? "transform 0.2s ease-out" : "";

        curPosition = Object.freeze(position);
    }
    /**
     * 基于配置校正指定位置
     * - 基于 options 判断对应位置是否滚动，不滚动则对应位置设置为undefined
     * @param x x轴位置
     * @param y y轴位置
     * @returns
     */
    function correctPosition(x: number, y: number): ElementPosition {
        switch (options.elastic) {
            case "x":
                y = undefined;
                break;
            case "y":
                x = undefined;
                break;
        }
        return { x, y };
    }
    /**
     * 计算滚动位置
     * @param position 当前位置
     * @param scroll 滚动信息，滚动了多少距离
     * @returns 计算之后的新位置
     */
    function calScrollPosition(position: ElementPosition, scroll: ElementPosition): ElementPosition {
        /** 核心规则：超出起始、结束位置时，进行弹性系数效果；增加一个最大的滚动位置 */
        const rootRect = target.parentElement.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();

        /**
         * 计算x、y轴方向的滚动位置
         * @param rootSize 容器尺寸，高度/宽度
         * @param targetSize 内容尺寸，高度/宽度
         * @param curValue 当前位置，x/y轴
         * @param moveValue 当前移动值，x/y轴
         * @returns 
         */
        function calculate(rootSize: number, targetSize: number, curValue: number, moveValue: number) {
            let tmpValue = curValue + moveValue;
            //  向下、向右移动；且到头了（最左侧，最顶部）：增加弹簧效果
            if (moveValue > 0 && tmpValue > 0) {
                tmpValue = Math.pow(tmpValue, options.factor);
                tmpValue = Math.min(tmpValue, options.distance);
            }
            //  向上、向左移动，且目前位置上滚了：判断是否到底了，若到了，则增加弹簧效果
            else if (moveValue < 0 && tmpValue < 0) {
                //  内容没填充满容器时，始终算到底了
                if (rootSize >= targetSize) {
                    tmpValue = Math.pow(-tmpValue, options.factor);
                    tmpValue = -Math.min(tmpValue, options.distance);
                }
                //  内容撑满容器了：计算超过多少位置了，限定在 distance 位置
                else {
                    const minValue = rootSize - targetSize;
                    if (minValue > tmpValue) {
                        const offset = Math.min(minValue - tmpValue, options.distance);
                        tmpValue = minValue - Math.pow(offset, options.factor);
                    }
                }
            }

            return tmpValue;
        }

        //  计算位置
        const x: number = calculate(rootRect.width, targetRect.width, position.x, scroll.x);
        const y: number = calculate(rootRect.height, targetRect.height, position.y, scroll.y);
        return correctPosition(x, y);
    }
    /**
     * 计算结束位置，确保滚动元素不飘移到容器元素外面
     * - 基于当前位置做校验
     * @param x x轴位置
     * @param y y轴位置
     * @returns 
     */
    function calcEndPosition(x: number, y: number): ElementPosition {
        // 核心规则：不能超过起始位置；不能超过结束位置
        const rootRect = target.parentElement.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        if (x != undefined) {
            x = x > 0 || rootRect.width >= targetRect.width
                ? 0
                : Math.max(x, rootRect.width - targetRect.width);
        }
        if (y != undefined) {
            y = y > 0 || rootRect.height >= targetRect.height
                ? 0
                : Math.max(y, rootRect.height - targetRect.height);
        }

        //  校验位置后范围        
        return correctPosition(x, y);
    }

    /**
     * 运行回调方法
     * @param status 
     * @param position 
     */
    function runFn(status: ElasticStatus, position: ElementPosition, touch: TouchDetail) {
        if (fn != undefined) {
            const detail: ElasticDetail = Object.freeze<ElasticDetail>({ status, position, touch });
            try { fn(detail); }
            catch (ex: any) {
                console.error(`run fn error where elastic ${status}. message:${ex.message}`, ex);
            }
        }
    }

    /**
     * 响应处理滚动相关事件
     * @param detail 
     */
    function onTouching(detail: TouchDetail) {
        switch (detail.status) {
            //  开始时，进行位置初始化；
            case "start": {
                //  清理掉现有的end动画，并重置位置：避免上次的end延迟还没执行完，这次就开始了。后期再做

                //  开始时，强制无动画，备份当前位置为起点坐标
                target.style.transition = "";
                startPosition = curPosition;
                runFn("start", curPosition, detail);
                break;
            }
            //  触摸移动过程中：计算滚动位置
            case "move": {
                //  后期把这个做成  requestAnimationFrame ,实现更精细的动画控制
                preTouch = detail.move;
                const { x, y } = calScrollPosition(startPosition, detail.total);
                updateTranslate(false, x, y);
                runFn("scroll", curPosition, detail);
                break;
            }
            //  结束时，进行惯性补偿
            default: {
                let needInertia: boolean = false;
                //  计算惯性滚动位置：看结束时间和上次move的时间戳，避免上时间停留时计算
                if (Date.now() - preTouch.timestamp < 10) {
                    needInertia = true;
                    const inertia = calScrollPosition(curPosition, { x: preTouch.vx * 100, y: preTouch.vy * 100 });
                    updateTranslate(true, inertia.x, inertia.y);
                    runFn("inertia", curPosition, detail);
                }
                //  计算结束位置，100ms延迟后更新
                const end = calcEndPosition(curPosition.x, curPosition.y);
                setTimeout(() => {
                    updateTranslate(true, end.x, end.y);
                    runFn("end", curPosition, detail);
                }, needInertia ? 200 : 0);
                //  结束后，对数据做重置
                startPosition = undefined;
                preTouch = undefined;

                break;
            }
        }
    }

    //#endregion

    //  初始化+数据验证
    {
        throwIfFalse(target instanceof Element, "onEvent: target must be a Element");
        fn = correctFunction(fn, undefined);
        //  配置选项校验，给默认值，整理完之后，锁定，避免改动
        options = isObject(options) ? { ...options } : Object.create(null);
        options.elastic = correctString(options.elastic, "both", true) as any;
        options.distance = Math.abs(correctNumber(options.distance, 100));
        options.factor = isNumberInRange(options.factor, 0.1, 1) ? options.factor : 0.8;
        Object.freeze(options);
    }
    //  初始化，构建管理器，并触摸事件监听
    {
        const manager = Object.freeze(mountScope<IElasticManager>({
            // disable, 后期提供
            scrollTo,
            refresh,
        }, "IElasticManager"));
        //  监听触摸事件，并自动销毁
        const observer = useObserver();
        observer.onTouch(target.parentElement, {}, onTouching);
        manager.onDestroy(() => observer.destroy());

        return manager;
    }
}