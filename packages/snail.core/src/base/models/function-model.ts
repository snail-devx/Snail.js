/**
 * 运行结果
 */
export type RunResult<T = void> = {
    /**
     * 是否成功
     */
    success: boolean;

    /**
     * 运行结果数据
     */
    data?: T;

    /**
     * 运行时发生的异常
     */
    ex?: Error;
    /**
     * 运行失败的原因
     */
    reason?: any;
}