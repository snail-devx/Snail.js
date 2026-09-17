/**
 * 接口：作用域
 * - 约束资源销毁方法
 */
export interface IScope {
    /**
     * 是否是全局作用域
     * - 为true时：标记为全局作用域，不要随意销毁，应该在程序全生命周期中存在
     * - 为false时：表示临时作用域，调用结束后，即时销毁
     */
    global: Readonly<boolean>;
    /**
     * 【作用域】是否已经销毁了
     * - 外部只读，不可修改
     */
    destroyed: Readonly<boolean>;

    /**
     * 监听【作用域】销毁
     * - destroy方法执行时触发
     * @param fn 回调方法
     * @returns 【作用域】自身，方便链式调用
     */
    onDestroy(fn: () => void): IScope;

    /**
     * 销毁【作用域】
     */
    destroy(): void;
}
/**
 * 作用域配置选项
 * - 在useXXX、mountScope构建作用域时传入
 */
export type ScopeOptions = {
    /**
     * 是否是全局作用域
     * - 为true时：标记为全局作用域，不要随意销毁，应该在程序全生命周期中存在
     * - 为false时：表示临时作用域，调用结束后，即时销毁
     */
    global?: IScope["global"];
    /**
     * 作用域的类型
     * - 自定义作用域类型，作为Object.prototype.toString.call(target) 的返回值
     * - 不传入则忽略
     */
    type?: string;
}

/**
 * 接口：作用域组
 * - 内部管理多个子作用域
 * - 在作用域destroy时，自动销毁子作用域
 */
export interface IScopes extends IScope {
    /**
     * 添加【子作用域】
     * - 当前作用域销毁时，自动执行【子作用域】的destroy方法
     * @param child 【子作用域】对象 
     * @returns 传入的child对象，方便链式调用
     */
    add<T extends IScope>(child: T): T;
    /**
     * 移除【子作用域】
     * - 不再由 当前作用域 管理
     * @param child 子作用域对象
     */
    remove(child: IScope): void;
    /**
     * 获取【子作用域】
     * - 内部执行add加入当前【作用域组】
     * @returns 全新的【子作用域】
     */
    get(): IScope;
}

/**
 * 接口：异步作用域
 * - 异步任务完成后，自动执行destroy方法销毁作用域
 * - 基于Promise实现异步
 */
export interface IAsyncScope<T> extends Promise<T>, IScope { }

/**
 * 【唯一作用域】use结果
 */
export type KeyScopeUseResult = {
    /**
     * 作用域对象
     */
    scope: IScope;

    /**
     * scope是复用的吗
     * - true 复用已存在的
     * - false 新创建的
     */
    reuse: boolean;
}