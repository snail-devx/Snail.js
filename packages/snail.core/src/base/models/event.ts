/**
 * 事件管理器接口
 */
export interface IEventManager {
    /**
     * 监听事件
     * @param name 事件名称
     * @param handler 事件处理句柄
     * @returns  返回自身，方便链式调用
     */
    on<T>(name: string, handle: EventHandle<T>): IEventManager;
    /**
     * 监听事件；仅监听一次，触发一次后自动销毁监听
     * @param name 事件名称
     * @param handler 事件处理句柄
     * @returns  返回自身，方便链式调用
     */
    once<T>(name: string, handle: EventHandle<T>): IEventManager;
    /**
     * 销毁事件
     * @param name      事件名称
     * @param handler   要销毁的事件句柄；传null则清空此事件的所有句柄
     * @returns  返回自身，方便链式调用
     */
    off(name: string, handle?: EventHandle<any>): IEventManager;
    /**
     * 触发事件
     * @param name 事件名
     * @param data 事件数据
     * @param sync 是否同步触发，默认异步（setTimeout）
     * @returns  返回自身，方便链式调用
     */
    trigger<T>(name: string, data?: T, sync?: boolean): IEventManager;
}

/**
 * 事件处理句柄
 * @param data 
 * @param sender 
 */
export type EventHandle<T> = (data: T, sender: EventSender<T>) => void;

/** 事件对象信息 */
export type EventSender<T> = {
    /**
     * 事件唯一id值
     */
    id: string,

    /**
     * 事件名
     */
    type: string,
    /**
     * 事件数据
     */
    data: T,

    /**
     * 阻止事件冒泡；继续执行
     */
    stopPropagation(): void;
}