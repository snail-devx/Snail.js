/**
 * 服务器模块：支持服务器器地址管理
 * - 支持全局服务器配置管理 addServer、
 * - 支持新作用域 newScope ，和全局配置隔离
 */

import { mustString, hasOwnProperty, isObject, isStringNotEmpty } from "../base/data";
import { throwError, throwIfNullOrUndefined } from "../base/error";
import { IServerManager, ServerOptions } from "./models/server-model";
import { checkScope, IScope, mountScope } from "../base/scope"

// 把自己的类型共享出去
export * from "./models/server-model"

/** 默认的服务器类型；后续支持configServer方法中做配置*/
const DEFAULT_ServerType: keyof (ServerOptions) = "api";
/**
 * 使用【服务器管理器】
 * @returns 全新的【服务器管理器】+作用域 
 */
export function useServer(): IServerManager & IScope {
    /** 注册的服务器：key为服务器编码code；value为对应的服务器配置选项 */
    const servers: { [key in string]: ServerOptions } = Object.create(null);

    //#region *************************************实现接口：IServerManager接口方法*************************************
    /**
     * 注册服务器
     * @param code 服务器编码；若已存在，则覆盖
     * @param server 服务器配置
     * @returns 管理器自身，方便链式调用
     */
    function register(code: string, server: ServerOptions): IServerManager {
        checkScope(manager, "register: server manager destroyed.");
        mustString(code, "code");
        isObject(server) || throwError("server must be a json");
        servers[code] = Object.freeze({ ...server });
        return manager;
    }
    /**
     * 是否存在指定服务器
     * @param code 服务器编码
     * @returns 存在返回true，否则false
     */
    function has(code: string): boolean {
        checkScope(manager, "has: server manager destroyed.");
        return hasOwnProperty(servers, code);
    }
    /**
     * 获取指定服务器
     * @param code 服务器编码
     * @returns 服务器配置选项；不存在返回undefined
     */
    function get(code: string): ServerOptions | undefined {
        checkScope(manager, "get: server manager destroyed.");
        return servers[code];
    }
    /**
     * 获取指定类型的服务器地址
     * @param code 服务器编码；若code对应服务器不存在报错
     * @param type 类型值，不传入则走默认的"DEFAULT_ServerType"；不存在报错
     * @returns 注册的服务器地址
     */
    function getUrl(code: string, type?: keyof (ServerOptions)): string {
        checkScope(manager, "getUrl: server manager destroyed.");
        const server = servers[code];
        throwIfNullOrUndefined(server, `the server[${code}] is not registered`);
        type = type || DEFAULT_ServerType;
        const url: string = server[type];
        isStringNotEmpty(url) || throwError(`the server[${code}] has not this type[${type}] server address`);
        return url;
    }
    /**
     * 移除指定服务器
     * @param code 服务器编码
     * @returns 管理器自身，方便链式调用
     */
    function remove(code: string): IServerManager {
        //  不检测管理器是否销毁，对服务器管理没有影响
        // checkScope(manager, "remove: server manager destroyed.");
        delete servers[code];
        return manager;
    }
    //#endregion

    //  构建管理器实例，挂载scope作用域
    const manager = mountScope<IServerManager>({ register, has, get, getUrl, remove });
    manager.onDestroy(() => Object.keys(servers).forEach(remove));
    return Object.freeze(manager);
}
/**
 * 全局【服务器管理器】
 */
export const server: IServerManager = useServer();