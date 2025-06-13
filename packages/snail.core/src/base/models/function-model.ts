/**
 * 运行结果
 */
export type RunResult<T> = {
    /**
     * 是否成功
     */
    success: boolean,
    /**
     * 返回数据
     */
    data?: T,
    /**
     * 运行失败时的异常
     */
    ex?: Error;
    /**
     * 运行失败的原因
     */
    reason?: any;
}