
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