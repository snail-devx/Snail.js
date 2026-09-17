
/**
 * 唯一标记管理器
 */
export interface IKeyManager<T> {
    /**
     * 获取数据的唯一Key值
     * @param data 数据对象
     * @returns 唯一Key值对象
     */
    getKey(data: T): string;
    /**
     * 删除数据的key
     * @param data 数据对象
     */
    deleteKey(data: T): void;
    /**
     * 清空所有的key
     */
    clear(): void;
}

/**
 * 唯一标记配置选项
 */
export type KeyOptions<T> = {
    /**
     * idFunc 唯一id生成器，若无需自定义则忽略
     * @param data 外部获取key、删除key时传入的数据
     * @returns 基于`data`生成的唯一Id之
     */
    idFunc?: (data: T) => string
}