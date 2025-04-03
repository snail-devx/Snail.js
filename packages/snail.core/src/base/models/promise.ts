/**
 * Promise展开对象
 */
export type FlatPromise<T> = {
    /**
     * promise对象，可then接收执行结果
     */
    promise: Promise<T>;
    /**
     * 通知promise执行成功
     * @param data 执行结果数据
     * @returns 
     */
    resolve: (data: T) => any;
    /**
     * 通知Promise执行失败
     * @param reason 执行失败的原因
     * @returns 
     */
    reject: <T>(reason: T) => any;
};

/**
 * 异步操作结果；如http请求，dialog弹窗、、
 */
export type AsyncResult<T> = Promise<T> & {
    /**
     * 调用方，终止操作执行
     */
    stop(): void;
}