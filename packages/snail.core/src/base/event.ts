import { mustFunction, mustString, hasAny, hasOwnProperty, isFunction, isObject, newId, tidyString } from "./data";
import { run } from "./function";
import { EventHandle, EventSender, IEventManager } from "./models/event-model";
import { checkScope, IScope, mountScope } from "./scope";

// 把自己的类型共享出去
export * from "./models/event-model";

/**
 * 使用【事件管理器】
 * - 全新作用域，和其他【事件管理器】实例隔离
 * @returns 全新的管理器+作用域 
 */
export function useEvent(): IEventManager & IScope {
    /** 为什么不采用class：
     *      采用class类，即使属性约束为private的属性，编译为js后，也会挂载到this上，不安全（外部可直接操作定义的事件数组）
     *      采用这种方式；确保定义的事件监听100%不会对外暴露，确保安全性
     */
    /** 事件监听信息：key为事件名，value为监听的事件集合 */
    const events: { [key in string]: EventHandle<any>[] } = Object.create(null);

    //#region *************************************实现接口：IEventManager接口方法*************************************
    /**
     * 监听事件
     * @param name 事件名称
     * @param handle 事件处理句柄
     * @remarks name+handle 组成唯一key，若重复以第一次on为准
     * @returns  返回自身，方便链式调用
     */
    function on<T>(name: string, handle: EventHandle<T>): IEventManager {
        checkScope(manager, "on: event manager destroyed.");
        mustString(name = tidyString(name), "name")
        mustFunction(handle, "handle");
        //  若name为第一次添加，直接赋值；否则判断是否存在相同 handle
        const handles = events[name] || [];
        if (handles.length == 0 || handles.indexOf(handle) == -1) {
            handles.push(handle);
            events[name] = handles;
        }
        return manager;
    }
    /**
     * 监听事件；仅监听一次，触发一次后自动销毁监听
     * @param name 事件名称
     * @param handle 事件处理句柄
     * @returns  返回自身，方便链式调用
     */
    function once<T>(name: string, handle: EventHandle<T>): IEventManager {
        checkScope(manager, "once: event manager destroyed.");
        const origin: EventHandle<T> = handle;
        var hasCalled: boolean = false;
        handle = (sender, data) => {
            if (hasCalled === false) {
                hasCalled = true;
                manager.off(name, handle);
                origin(sender, data); // origin.call(manager, sender, data);
            }
        };
        on(name, handle);
        return manager;
    }
    /**
     * 销毁事件
     * @param name      事件名称
     * @param handle   要销毁的事件句柄；传null则清空此事件的所有句柄
     * @returns  返回自身，方便链式调用
     */
    function off(name: string, handle?: EventHandle<any>): IEventManager {
        checkScope(manager, "once: event manager destroyed.");
        name = tidyString(name);
        if (hasOwnProperty(events, name) == true) {
            const handles: EventHandle<any>[] = isFunction(handle)
                ? events[name].filter(func => func !== handle)
                : undefined;
            //  若此事件已无监听程序，则强制从事件集合中移除
            hasAny(handles)
                ? (events[name] = handles)
                : (delete events[name]);
        }
        return manager;
    }
    /**
     * 触发事件
     * @param name 事件名
     * @param data 事件数据
     * @param sync 是否同步触发，默认异步（setTimeout）
     * @returns  返回自身，方便链式调用
     */
    function trigger<T>(name: string, data?: T, sync?: boolean): IEventManager {
        checkScope(manager, "trigger: event manager destroyed.");
        mustString(name = tidyString(name), "name");
        const handles = events[name] || [];
        handles.length > 0 && (sync === true
            ? runHandles(name, handles, data)
            : setTimeout(runHandles, 0, name, handles, data)
        );
        return manager;
    }
    //#endregion

    //#region ************************************* 私有方法 *************************************
    /**
     * 执行事件句柄
     * @param name     事件名
     * @param handles 句柄集合
     * @param data     事件数据
     */
    function runHandles<T>(name: string, handles: EventHandle<T>[], data?: T): void {
        var isStop: boolean;
        const sender: EventSender<T> = Object.freeze({
            id: newId(),
            type: name,
            data: data,
            stopPropagation: () => (isStop = true)
        });
        for (var handle of handles) {
            const rt = run(handle, data, sender);
            rt.ex && console.error("trigger error;", "evtName:", sender.type, ";ex:", rt.ex);
            if (isStop === true) {
                break;
            }
        }
    }
    //#endregion

    //  构建管理器实例，挂载scope作用域
    const manager = mountScope<IEventManager>({ on, once, off, trigger }, "IEventManager");
    manager.onDestroy(() => Object.keys(events).forEach(key => delete events[key]));
    return Object.freeze(manager);
}
/**
 * 全局【事件管理器】
 */
export const event: IEventManager = useEvent();