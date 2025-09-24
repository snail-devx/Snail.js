/**
 * 基础事件实体
 *  1、把一些常用事件，封装为原子结构，方便复用
 *  2、不强制必须复用，根据自身情况
 */

/**
 * 事件：点击
 */
export type ClickEvents = {
    /**
     * 单击事件
     */
    click: [];
}

/**
 * 事件：值改变
 * - 描述值的改变过程，新值是什么，改变前的旧值是什么
 */
export type ChangeEvents<T> = {
    /**
     * 值改变；约束新旧值
     * @param newValue 新值
     * @param oldValue 旧值
     */
    change: [newValue: T, oldValue?: T];
}
/**
 * 事件：移动
 * - 可描述数据索引位置变化
 * - 可用于数组元素拖动排序，调整位置等逻辑
 */
export type MoveEvents = {
    /**
     * 移动事件
     * @param fromIndex 从哪个索引位置开始移动
     * @param toIndex 移动到的索引位置
     */
    move: [fromIndex: number, toIndex: number];
}

/**
 * 事件：删除数据
 * - 描述要删除的具体数据
 */
export type DeleteEvents<T> = {
    /**
     * 删除事件
     * @param value 要删除的数据
     */
    delete: [value?: T];
}
/**
 * 事件：关闭
 */
export type CloseEvents = {
    /**
     * 关闭事件
     */
    close: [];
}