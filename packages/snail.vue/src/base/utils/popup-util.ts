import { correctNumber, correctString, FlatPromise, isArrayNotEmpty, IScope, isFunction, isNumberNotNaN, isObject, isStringNotEmpty, mustFunction, mustObject, throwIfFalse } from "snail.core";
import { Component, readonly, shallowRef } from "vue";
import { AppEnv } from "../models/app-model";
import { MotionEffectOptions } from "../models/motion-model";
import { DialogOptions, FollowElectResult, FollowExtendOptions, FollowOptions, FollowStrategy, PopupAppDescriptor, PopupContext, PopupExtendOptions, PopupHandle, PopupOptions, PopupStatus, PopupType } from "../models/popup-model";
import { newApp } from "./app-util";

//#region ***************************************************************** 通用弹窗 助手方法 *****************************************************************
/** 弹窗默认配置 */
const DEFAULT: PopupExtendOptions = Object.create(null);
/** 弹窗字典：key为弹窗id，value为构建的app实例 */
const POPUPMAPS: Map<string, PopupAppDescriptor> = new Map();
/** 弹窗的z-index值队列 */
const QUEUE_ZINDEX: number[] = [];
/**
 * 配置弹窗默认配置
 * - 注意：`z-index`尽量在站点启动时初始化，避免已使用弹窗后再配置，否则容器导致层级混乱
 * @param options 配置选项
 */
export function configPopup(options: PopupExtendOptions) {
    if (options != undefined) {
        options.zIndex > 0 && (DEFAULT.zIndex = options.zIndex);
        options.motion && (DEFAULT.motion = options.motion);
        options.motionDuration > 0 && (DEFAULT.motionDuration = options.motionDuration)
    }
}

/**
 * 检测弹窗配置选项
 * @param options 弹窗配置选项
 * @returns 检测结果：为空则检测通过，否则返回错误信息
 */
export function checkPopup(options: PopupOptions): string | undefined {
    try {
        mustObject(options, "checkPopup: options");
        throwIfFalse(
            isStringNotEmpty(options.name) || isObject(options.component) || isStringNotEmpty(options.url),
            "checkPopup: options.name/component/url cannot be invalid at same time."
        );
    }
    catch (ex: any) {
        return ex.message;
    }
}
/**
 * 打开弹窗
 * @param container 
 * @param container 弹窗根容器，无效则自动使用 PopupContainer
 * @param options 弹窗配置选项，将直接挂载到容器属性上
 * @param extend 外部可通过此参数自定义弹窗关闭方法等
 * @returns 弹窗上下文
 */
export function openPopup<T, Options extends PopupOptions<any, any>>(env: AppEnv, container: Component, options: Options, extend: Pick<PopupHandle<T>, "inPopup" | "closePopup">): Readonly<PopupContext<T>> {
    //  基础验证，若这都错了，那说明传入参数有问题，开发级别需要排查出来
    mustObject(options, "openPopup: options");
    mustObject(extend, "openPopup: extend");
    mustFunction(extend.closePopup, "openPopup: extend.closePopup");
    const popupType: PopupType = extend.inPopup || "popup";
    const duration = [options.motionDuration, DEFAULT.motionDuration, 200].find(item => item > 0);
    const motion = options.motion;
    const statusRef = shallowRef<PopupStatus>("open");
    const motionRef = shallowRef<string>(correctPopupMotion(popupType, "open", options.motion));
    //  构建上下文：状态和动画，使用只读副本对外共享
    const context: PopupContext<T> = {
        inPopup: popupType,
        popupId: `popup-${getPopupId()}`,
        zIndex: correctZIndex(options.zIndex),
        popupStatus: readonly(statusRef),
        motion: readonly(motionRef),
        closePopup: extend.closePopup,
    };
    // 构建弹窗app实例，并做绑定
    {
        //  弹窗打开后，超时将动画值清空
        setTimeout(() => motionRef.value = undefined, duration);
        //  对options进行复制，并剔除掉[PopupOptions]一些属性，这些属性无需往下传递，或者需要加工后共享到context中
        const props = { ...options, context };
        ["motion", "motionDuration", "zIndex"].forEach(key => delete props[key]);
        //  构建app做绑定，并缓存app实例相关数据
        const app = newApp("popup", env, container, props);
        app.mount(getPopupAppElement(context.popupId));
        POPUPMAPS.set(context.popupId, Object.freeze<PopupAppDescriptor>({
            statusRef,
            motionRef,
            destroy() {
                //  强制将动画值设置为【关闭】，先设置为null，再设置为新的动画名，避免 in和out都是同一个动画名时，动画不执行的问题
                statusRef.value = "closed";
                motionRef.value = undefined;
                setTimeout(() => motionRef.value = correctPopupMotion(popupType, "closed", motion), 0);
                POPUPMAPS.delete(context.popupId);
                //  延迟销毁，实现销毁动画
                setTimeout(() => {
                    app._container.remove();
                    app.unmount();
                }, duration);
            }
        }));
    }

    return context;
}
/**
 * 销毁弹窗
 * @param popupId 弹窗Id
 * @param task 弹窗任务，若不处于关闭状态，则先resolve此task
 */
export function destroyPopup(popupId: string, task: FlatPromise<any>): void {
    const descriptor = POPUPMAPS.get(popupId);
    //  任务保底：若状态不是“close”，则是外部执行 scope.destroy() 强制销毁；维护弹窗状态
    if (descriptor != undefined) {
        if (descriptor.statusRef.value != "closed") {
            console.warn("force close after scope.destroy called.");
            task.resolve(undefined);
        }
        descriptor.destroy();
    }
}
/**
 * 更新弹窗状态
 * - 满足模态弹窗时的遮罩层只在最新弹窗显示
 * @param popupId 
 * @param status 
 */
export function updatePopupStatus(popupId: string, status: PopupStatus): void {
    const descriptor = POPUPMAPS.get(popupId);
    descriptor && (descriptor.statusRef.value = status);
}

/**
 * 获取弹窗Id
 * - 自执行函数构建一个闭包，内部维护id值
 */
const getPopupId: () => number = (function () {
    var popupId = 0;
    return () => (++popupId);
})();
/**
 * 校正弹窗动画类样式
 * @param type 弹窗类型
 * @param status 弹窗状态，关闭还是打开
 * @param motion 动画配置
 * @returns 动画类样式名
 */
function correctPopupMotion(type: PopupType, status: PopupStatus, motion?: PopupOptions["motion"]): string {
    let motionName: string = undefined;
    for (const item of [motion, DEFAULT.motion, "fade"]) {
        if (item != undefined) {
            if (isObject(item) == true) {
                motionName = status == "closed"
                    ? (item as MotionEffectOptions).out
                    : (item as MotionEffectOptions).in;
            }
            else if (isStringNotEmpty(item) == true) {
                motionName = status == "closed" ? "out" : "in";
                motionName = `${item}-${motionName}`
            }
            else if (isFunction(item) == true) {
                motionName = (item as (popupType: PopupType, status: PopupStatus) => string)(type, status);
                motionName = correctString(motionName, undefined, true);
            }

            if (motionName != undefined) {
                break;
            }
        }
    }
    return motionName;
}
/**
 * 校正弹窗的z-index值
 * @param zIndex 
 * @returns 新的z-index值，确保新弹窗在最前面
 */
function correctZIndex(zIndex: number): number {
    // const globalZIndex = DEFAULT.zIndex > 0 ? DEFAULT.zIndex : 2000;
    // zIndex > globalZIndex || (zIndex = globalZIndex);
    {
        zIndex = correctNumber(zIndex, undefined);
        DEFAULT.zIndex > 0 && (zIndex >= DEFAULT.zIndex || (zIndex = DEFAULT.zIndex));
        zIndex > 0 || (zIndex = 2000);
    }
    // 确保新的弹窗在最前面
    QUEUE_ZINDEX.length && (zIndex = Math.max(QUEUE_ZINDEX[QUEUE_ZINDEX.length - 1], zIndex));
    QUEUE_ZINDEX.push(zIndex);
    return zIndex;
}
/**
 * 构建挂载弹窗App实例dom元素
 * @param popupId 弹窗Id
 * @returns
 */
function getPopupAppElement(popupId: string): HTMLElement {
    //  创建通义根元素
    var rootEl = document.getElementById("snail-popup-apps");
    if (rootEl == undefined) {
        rootEl = document.createElement("div");
        rootEl.id = "snail-popup-apps";
        rootEl.style = "height:0 !important; width:0 !important;";
        document.body.appendChild(rootEl);
    }
    //  构建当前弹窗实例元素
    const appEle = document.createElement("div");
    appEle.id = popupId;
    appEle.classList.add("snail-app", "popup-app");
    return rootEl.appendChild(appEle);
}
//#endregion

//#region ***************************************************************** 模态弹窗 助手方法 *****************************************************************
/**
 * 检测弹窗配置选项
 * @param options 弹窗配置选项
 * @returns 检测结果：为空则检测通过，否则返回错误信息
 */
export function checkDialog(options: DialogOptions): string | undefined {
    var message = checkPopup(options);
    if (isStringNotEmpty(message) == false) {
        //  目前没啥可必须检测的
    }
    return message;
}

/** 
 * 模态弹窗信息
 * - 记录弹窗Scope，在前面弹窗销毁后，它之后的弹窗全部强制销毁，它前面的谭庄激活
 * - 记录弹窗主键Id，用于更新弹窗状态
 */
const DIALOGS: { id: string, scope: IScope }[] = [];
/**
 * 监听弹窗
 * - 将之前的弹窗 设置为 非激活状态
 * - 关闭弹窗时，将它和之后的弹窗强制关闭，上一个弹窗设置为激活
 * @param popupId 弹窗主键id
 * @param scope 弹窗作用域
 * @param task 弹窗任务，在外部通过destroy销毁时，同步任务状态用
 */
export function monitorDialog<T>(popupId: string, scope: IScope, task: FlatPromise<T>) {
    //  当前弹窗激活，之前的所有弹窗全部 失焦
    updatePopupStatus(popupId, "active");
    const index = DIALOGS.push(Object.freeze({ id: popupId, scope })) - 1;
    index > 0 && (updatePopupStatus(DIALOGS[index - 1].id, "unactive"));
    //  响应弹窗销毁操作：
    scope.onDestroy(function () {
        //  激活上一个弹窗
        if (index > 0) {
            const pre = DIALOGS[index - 1];
            pre && pre.scope.destroyed == false && updatePopupStatus(pre.id, "active");
        }
        //  清理之后的所有弹窗
        DIALOGS.splice(index).forEach((item, index) => {
            if (index > 0 && item.scope.destroyed == false) {
                updatePopupStatus(item.id, "closed");
                item.scope.destroy();
            }
        });
        //  清理自己
        destroyPopup(popupId, task);
    });
}
//#endregion

//#region ***************************************************************** 跟随弹窗 助手方法 *****************************************************************
/**
 * 检测弹窗配置选项
 * @param options 弹窗配置选项
 * @returns 检测结果：为空则检测通过，否则返回错误信息
 */
export function checkFollow(options: FollowOptions): string | undefined {
    //  暂无可检测配置项
    return undefined;
}
/**
 * 计算x轴方向的【跟随效果】
 * @param options 跟随配置选项
 * @param target 目标元素的矩形信息
 * @param width 跟随组件的宽度
 * @returns 水平方向的跟随效果：left标记坐标位置，width标记组件新的宽度；undefined表示不设置，
 */
export function calcFollowX(options: FollowExtendOptions, target: DOMRectReadOnly, width: number): FollowElectResult {
    const space = isNumberNotNaN(options.spaceX) ? options.spaceX : 0;
    const spaceClient = isNumberNotNaN(options.spaceClient) ? options.spaceClient : 0;
    /* 若target已经显示不全了，则不再显示follow；部分情况下，展示不全也需要展示出来，这里先忽略掉；后期通过配置约束溢出时是否显示
    if ((target.left < spaceClient) || (target.right + spaceClient > window.innerWidth)) {
        return { strategy: undefined, start: -width };
    }
    */
    return electPosition(
        getFollowStrategy(options.followX) || ["start", "end", "after", "before", "center", "ratio"],
        target.left, target.right, width, window.innerWidth, space, spaceClient
    );
}
/**
 * 计算y轴方向的【跟随效果】
 * @param options 跟随配置选项
 * @param target 目标元素的矩形信息
 * @param height 跟随组件的高度
 * @returns 水平方向的跟随效果：top、bottom标记坐标位置，height标记组件新的高度；undefined表示不设置，
 */
export function calcFollowY(options: FollowExtendOptions, target: DOMRectReadOnly, height: number): FollowElectResult {
    const space = correctNumber(options.spaceY, 0);
    const spaceClient = correctNumber(options.spaceClient, 0);
    /* 若target已经显示不全了，则不再显示follow；部分情况下，展示不全也需要展示出来，这里先忽略掉；后期通过配置约束溢出时是否显示
    if ((target.top < spaceClient) || (target.bottom + spaceClient > window.innerHeight)) {
        return { strategy: undefined, start: -height };
    }*/
    return electPosition(
        getFollowStrategy(options.followY) || ["after", "before", "start", "end", "center", "ratio"],
        target.top, target.bottom, height, window.innerHeight, space, spaceClient
    );
}

/**
 * 获取跟随策略
 * @param strategy 
 * @returns 策略数组，未传入则返回undefined
 */
function getFollowStrategy(strategy?: FollowStrategy | FollowStrategy[]): FollowStrategy[] | undefined {
    return isStringNotEmpty(strategy)
        ? [strategy as FollowStrategy]
        : isArrayNotEmpty(strategy)
            ? strategy as FollowStrategy[]
            : undefined;
}
/**
 * 选举跟随位置
 * @param strategy 跟随策略数组
 * @param targetStart 目标元素起始位置，left、top
 * @param targetEnd 目标元素结束位置，right、bottom
 * @param contentSize 当前内容元素大小，width、height
 * @param clientSize 客户端大小：window.innerWidth、window.innerHeight
 * @param space 留白空间：offsetX、offsetY
 * @param spaceClient 边缘位置
 * @returns 
 */
function electPosition(strategy: FollowStrategy[], targetStart: number, targetEnd: number, contentSize: number, clientSize: number, space: number, spaceClient: number)
    : FollowElectResult {
    var maxPosition: FollowElectResult = undefined;
    for (const fs of strategy) {
        const tmp = deducePosition(fs, targetStart, targetEnd, contentSize, clientSize, space, spaceClient);
        //  位置计算无效，继续尝试
        if (tmp == undefined) {
            continue;
        }
        //  无需调整尺寸，即可展示，则直接返回
        if (tmp.size == undefined) {
            return tmp;
        }
        //  记录最大尺寸展示位置
        if (maxPosition == undefined || maxPosition.size < tmp.size) {
            maxPosition = tmp;
        }
    }
    //  选择最大尺寸位置，若无则报错
    if (maxPosition == undefined) {
        const msg = `electPosition: invalid follow strategy, deduce position failed. strategy: ${strategy.join(",")}.`;
        throw new Error(msg);
    }
    return maxPosition;
}
/**
 * 位置推断：传入固定策略进行推断
 * @param strategy 位置类型；传入非支持值则返回undefined
 * @param targetStart 目标元素起始位置，left、top
 * @param targetEnd 目标元素结束位置，right、bottom
 * @param contentSize 当前内容元素大小，width、height
 * @param clientSize 客户端大小
 * @param space 留白空间：offsetX、offsetY
 * @param spaceClient 边缘位置
 * @returns 推断结果，undefined表示 strategy 值无效
 */
function deducePosition(strategy: FollowStrategy, targetStart: number, targetEnd: number, contentSize: number, clientSize: number, space: number, spaceClient: number)
    : FollowElectResult | undefined {
    //  计算一些变量，方便后面复用
    /**     最大的结束位置 */
    const maxEnd = clientSize - spaceClient;
    //  根据策略计算位置
    switch (strategy) {
        //  start：和target相同开始值；展示不全，则缩放尺寸
        //  after：target结束位置 之后展示；展示不全，则缩放尺寸 
        case "start":
        case "after": {
            const start = (strategy == "start" ? targetStart : targetEnd) + space;
            return {
                strategy,
                start,
                size: start + contentSize > maxEnd ? maxEnd - start : undefined,
            };
        }
        //  before：target开始位置 之前展示；展示不全，则缩放尺寸
        //  end   ：和target相同结束位置；展示不全，则缩放尺寸
        case "before":
        case "end": {
            const maxEnd = (strategy == "before" ? targetStart : targetEnd) - space;
            const start = maxEnd - contentSize;
            return {
                strategy,
                start: Math.max(spaceClient, start),
                size: start < spaceClient ? (maxEnd - spaceClient) : undefined,
            }
        }
        //  和target相同中心点；展示不全，则缩放尺寸；取消间距
        case "center": {
            const center = parseInt(targetStart + (targetEnd - targetStart) / 2 as any);
            //  起始位置，展示不全，则计算size偏移量，并强制起始位置为 spaceClient
            var tmp = parseInt(center - contentSize / 2 as any);
            var sizeOffset: number = Math.min(0, tmp - spaceClient);
            const start = sizeOffset < 0 ? spaceClient : tmp;
            //  结束位置是否能够展示全，展示不全，继续调整size偏移量
            tmp = parseInt(center + contentSize / 2 as any);
            sizeOffset += Math.min(0, maxEnd - tmp);
            return {
                strategy,
                start,
                size: sizeOffset < 0 ? contentSize + sizeOffset : undefined
            };
        }
        //  按比例（target中心点/窗口尺寸）锚定位置，动态计算位置；展示不全，则缩放尺寸
        case "ratio": {
            const maxSize = maxEnd - spaceClient;
            //  能展示全，则等比例微调start值：此时不考虑 space 间距值
            if (contentSize < maxSize) {
                const center = parseInt(targetStart + (targetEnd - targetStart) / 2 as any);
                const startSize = parseInt((center / clientSize) * contentSize as any);
                return {
                    strategy,
                    start: center - startSize,
                }
            }
            //  展示不全，直接贴边展示；等于最大值时，不调整size值
            return {
                strategy,
                start: spaceClient,
                size: contentSize != maxSize ? maxSize : undefined
            };
        }
        //  其他情况，不属于制式规则，返回undefined；后期考虑报错
        default: {
            return undefined;
        }
    }
}
//#endregion