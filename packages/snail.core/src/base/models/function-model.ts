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
     * - 运行发生异常时则为 ex.message 
     * - 否则为失败原因自身对象
     */
    reason?: any;
}