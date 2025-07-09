/**
 * 开关 配置选项
 */
export type SwitchOptions = {
    /**
     * 是否只读
     */
    readonly?: boolean;
}

/**
 * 开关 事件
 */
export type SwitchEvents = {
    /**
     * 开关 状态变化时
     * @param value 开启、还是关闭
     */
    change: [value: boolean];
}