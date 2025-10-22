import { newId } from "./data";
import { IKeyManager } from "./models/key-model";
import { checkScope, IScope, mountScope } from "./scope";

//  导出数据结构
export * from "./models/key-model";

/**
 * 使用Key管理器
 * @param idFunc 唯一id生成器，若无需自定义则忽略
 * @returns Key管理器+作用域对象
 */
export function useKey<T>(idFunc?: (data: T) => string): IKeyManager<T> & IScope {
    /** 
     * Key的缓存字典
     * - key为数据对象，value为数据对象的唯一key值
     */
    const keyCache: Map<T, string> = new Map();

    //#region *************************************实现接口：IKeyManager接口方法*************************************
    /**
     * 获取数据的唯一Key值
     * @param data 数据对象
     * @returns 唯一Key值对象
     */
    function getKey(data: T): string {
        checkScope(manager, "getKey: key manager destroyed.");
        let key: string = keyCache.get(data);
        if (key == undefined) {
            key = idFunc ? idFunc(data) : undefined;
            key || (key = newId());
            keyCache.set(data, key);
        }
        return key;
    }
    /**
     * 删除数据的key
     * @param data 数据对象
     */
    function deleteKey(data: T): void {
        checkScope(manager, "deleteKey: key manager destroyed.");
        keyCache.delete(data);
    }
    //#endregion

    //  构建管理器实例，挂载scope作用域
    const manager = mountScope<IKeyManager<T>>({ getKey, deleteKey }, "IKeyManager");
    manager.onDestroy(() => keyCache.clear());
    return Object.freeze(manager);
}