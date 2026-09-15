/**
 * 视图观察者
 *  
 * 注意事项：
 *  1、不提供全局【观察者】对象；这个涉到不少子scope的销毁，在全局挂着始终不好
 */
import { checkScope, IScope, IScopes, mountScope, mustFunction, mustString, run, throwIfFalse, useScopes } from "snail.core";
import { ElementSize, IObserver, TouchDetail, TouchDistance, TouchOptions, ElementPosition, TouchStatus } from "../models/observer-model";

// 把自己的类型共享出去
export * from "../models/observer-model";

/**
 * 使用【观察者】
 * - 观察元素尺寸、位置变化
 * - 观察事件，scope销毁时自动清理事件监听
 * @returns 全新的【观察者】+作用域
 */
export function useObserver(): IObserver & IScope {
    /** 作用域组：管理【观察者】子作用域 */
    const scopes: IScopes = useScopes();

    //#region ************************************* 接口方法：IObserver具体实现 *************************************
    /**
     * 监听指定事件
     * - scope销毁时自动移除监听
     * - 内部使用addEventListener 方法监听事件，销毁时自动执行removeEventListener
     * @param target 监听元素
     * @param name 事件名称
     * @param fn 事件处理方法
     * @param useCapture 是否使用捕获模式
     * @returns 作用域，可销毁监听
     */
    function onEvent(target: Element | Window, name: string, fn: (...args: any[]) => void, useCapture?: boolean): IScope {
        checkScope(manager, "onEvent: observer destroyed.");
        throwIfFalse(target instanceof Element || target === window, "onEvent: target must be a Element or Window");
        mustString(name, "onEvent: name");
        mustFunction(fn, "onEvent: fn");
        target.addEventListener(name, fn, useCapture);
        return scopes.get().onDestroy(() => target.removeEventListener(name, fn, useCapture));
    }

    /**
     * 监听元素触摸事件
     * - 支持 touch 相关事件
     * - 兼容 mouse 相关事件
     * @param el 元素对象
     * @param options 配置选项
     * @param fn 触摸回调，回调时告知当前触摸详细信息
     * @returns 作用域，可销毁监听
     */
    function onTouch(el: Element, options: TouchOptions, fn: (detail: TouchDetail) => void): IScope {
        checkScope(manager, "onEvent: observer destroyed.");
        throwIfFalse(el instanceof Element, "onEvent: target must be a Element");
        mustFunction(fn, "onTouch: fn");
        //  1、进行触摸事件处理的相关方法，变量
        /**     触摸开始时间，用于计算耗时和速度 */
        let startDate: number = undefined;
        /**     触摸启动位置，用于计算距离和速度 */
        let startPosition: ElementPosition = undefined;
        /**     上一次时间：执行fn时的时间 */
        let preDate: number = undefined;
        /**     上一次位置：执行fn时的位置 */
        let prePosition: ElementPosition = undefined;
        /**     执行fn回调
         *      @param status 当前状态
         *      @param position 当前位置，若为空，表示娶不到位置，复用上一个位置 */
        function runFn(status: TouchStatus, position?: ElementPosition) {
            const nowDate: number = Date.now();
            position && Object.freeze(position);
            if (status == "start") {
                startDate = nowDate;
                startPosition = position;
            }
            //  默认值处理，方便后续计算值
            preDate == undefined && (preDate = startDate);
            prePosition == undefined && (prePosition = startPosition);
            position == undefined && (position = prePosition);
            //  计算触摸详情
            const detail: TouchDetail = {
                status,
                start: startPosition,
                now: position,
                //  move状态，计算移动间距
                move: status == "move"
                    ? buildMoveDistance(nowDate, nowDate - preDate, position, prePosition)
                    : undefined,
                //  非 status 状态时计算整体位移
                total: status != "start"
                    ? buildMoveDistance(nowDate, nowDate - startDate, position, startPosition)
                    : undefined,
            };
            //  当前信息，保留为上次状态
            preDate = nowDate;
            prePosition = position;
            //  触摸结束后，重置变量
            if (status == "cancel" || status == "end") {
                startDate = undefined;
                startPosition = undefined;
                preDate = undefined;
                prePosition = undefined;
            }
            //  执行回调
            try { fn(Object.freeze<TouchDetail>(detail)); }
            catch (ex: any) {
                console.error("onTouch: run fn error. message:", ex.message, ex);
            }
        }
        //  2、初始化作用域，开始监听触摸事件，需要是 touch 启动时，才做后续触摸事件处理
        const scope = useScopes();
        {
            /** 触摸启动类型，避免PC触摸屏下touchstart和mousedown同时触发 */
            let startType: "mouse" | "touch" = undefined;
            //  触摸相关事件监听
            ("ontouchstart" in window) && scope.add(onEvent(el, "touchstart", (evt: TouchEvent) => {
                if (startType == undefined) {
                    startType = "touch";
                    runFn("start", { x: evt.touches[0].clientX, y: evt.touches[0].clientY });
                }
            }));
            ("ontouchmove" in window) && scope.add(onEvent(window, "touchmove", (evt: TouchEvent) => {
                if (startType == "touch") {
                    runFn("move", { x: evt.touches[0].clientX, y: evt.touches[0].clientY });
                }
            }));
            ("ontouchend" in window) && scope.add(onEvent(window, "touchend", (evt) => {
                if (startType == "touch") {
                    startType = undefined;
                    runFn("end", undefined);
                }
            }));
            ("ontouchcancel" in window) && scope.add(onEvent(window, "touchcancel", () => {
                if (startType == "touch") {
                    startType = undefined;
                    runFn("cancel", undefined);
                }
            }));
            // 鼠标相关事件监听
            ("onmousedown" in window) && scope.add(onEvent(el, "mousedown", (evt: MouseEvent) => {
                if (startType == undefined) {
                    startType = "mouse";
                    runFn("start", { x: evt.clientX, y: evt.clientY });
                }
            }));
            ("onmousemove" in window) && scope.add(onEvent(window, "mousemove", (evt: MouseEvent) => {
                if (startType == "mouse") {
                    runFn("move", { x: evt.clientX, y: evt.clientY });
                }
            }));
            ("onmouseup" in window) && scope.add(onEvent(window, "mouseup", () => {
                if (startType == "mouse") {
                    startType = undefined;
                    runFn("end", undefined);
                }
            }));
        }
        //  3、返回作用域；父级作用域销毁时，自动销毁自身作用域
        scopes.onDestroy(() => scope.destroy());
        return scope;
    }

    /**
     * 监听元素尺寸变化
     * - scope销毁时自动移除监听
     * @param el 监听元素
     * @param fn 变化时的回调方法
     * @returns 作用域，可销毁监听
     */
    function onSize(el: Element, fn: (size: Readonly<ElementSize>) => void): IScope {
        checkScope(manager, "onSize: observer destroyed.");
        throwIfFalse(el instanceof Element, "onSize: el must be a Element.");
        const scope = scopes.get();
        //  计算元素的size值；优先ResizeObserver ，否则定时器100ms计算一次（requestAnimationFrame浪费性能）
        var preSize: Readonly<ElementSize> = undefined;
        function calcSize() {
            if (scope.destroyed == false) {
                const rect = el.getBoundingClientRect();
                const isChange: boolean = preSize == undefined
                    || preSize.width != rect.width || preSize.height != rect.height;
                if (isChange == true) {
                    preSize = Object.freeze({ width: rect.width, height: rect.height });
                    run(fn, preSize);
                }
            }
        }
        const resizeObserver = "ResizeObserver" in window ? new ResizeObserver(calcSize) : undefined;
        const timer = resizeObserver ? resizeObserver.observe(el) : setInterval(calcSize, 100);
        setTimeout(calcSize);
        //  scope销毁时，移除监听
        return scope.onDestroy(() => {
            resizeObserver && resizeObserver.disconnect();
            timer && clearInterval(timer);
        });
    }

    /**
     * 监听元素客户端位置、大小变化
     * - 位置计算规则：相对window屏幕
     * - scope销毁时自动移除监听
     * @param el 监听元素
     * @param fn 变化时的回调方法
     * @returns 作用域，可销毁监听
     */
    function onClient(el: Element, fn: (rect: DOMRectReadOnly) => void): IScope {
        checkScope(manager, "onClient: observer destroyed.");
        throwIfFalse(el instanceof Element, "onClient: el must be a Element.");
        const scope = scopes.get();
        //  监听rect变化，并尝试自动销毁：使用requestAnimationFrame有点浪费性能，采用定时器100ms执行一次
        var preRect: DOMRectReadOnly = undefined;
        const timer = setInterval(function () {
            if (scope.destroyed == false) {
                const rect = el.getBoundingClientRect();
                const isChange: boolean = preRect == undefined
                    || rect.x != preRect.x || rect.y != preRect.y
                    || rect.width != preRect.width || rect.height != preRect.height;
                if (isChange == true) {
                    preRect = DOMRectReadOnly.fromRect(rect);
                    run(fn, preRect);
                }
            }
        }, 100);
        //  scope销毁时，移除监听
        return scope.onDestroy(() => clearInterval(timer));
    }

    /**
     * 监听元素的突变
     *  - 通过options配置支持元素自身属性、子元素、子元素属性等；如支持子元素发生变化时（添加、删除、属性变化）等
     *  - 内部通过 MutationObserver 实现；详细参照：https://developer.mozilla.org/zh-CN/docs/Web/API/MutationObserver
     * - scope销毁时自动移除监听
     * @param el 监听元素
     * @param options  配置选项，监听元素的哪些变化
     * @param fn 回调方法
     * @returns 作用域，可销毁监听
     */
    function onMutation(el: Element, options: MutationObserverInit, fn: (record: MutationRecord[], observer: MutationObserver) => void): IScope {
        checkScope(manager, "onClient: observer destroyed.");
        throwIfFalse(el instanceof Element, "onClient: el must be a Element.");
        mustFunction(fn, "onMutation: fn")
        const observe = new MutationObserver(fn);
        observe.observe(el, options);
        //  构建作用域并销毁方法
        return scopes.get().onDestroy(() => observe.disconnect());
    }
    //#endregion


    //#region ************************************* 内部方法：辅助结构实现的方法 *************************************
    /**
     * 构建移动距离信息
     * @param timestamp 当前时间戳
     * @param time 时长
     * @param end 结束位置
     * @param start 开始位置
     * @returns 
     */
    function buildMoveDistance(timestamp: number, time: number, end: ElementPosition, start: ElementPosition): TouchDistance {
        const x: number = end.x - start.x;
        const y: number = end.y - start.y;
        return Object.freeze<TouchDistance>({
            timestamp,
            time,
            x,
            vx: x / time,
            y,
            vy: y / time
        });
    }
    //#endregion

    //  构建管理器实例，挂载scope作用域
    const manager = mountScope<IObserver>({
        onEvent, onTouch, onSize,
        onClient, onMutation
    }, "IObserver");
    manager.onDestroy(scopes.destroy);
    return Object.freeze(manager);
}