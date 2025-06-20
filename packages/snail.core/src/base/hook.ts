import { mustFunction } from "./data";
import { RunResult, run, runAsync } from "./function";
import { HookFunction, HookRunOptions, IHookManager } from "./models/hook-model";
import { IScope } from "./models/scope-model";

/** 把自己的类型共享出去 */
export * from "./models/hook-model";

/** 
 * 钩子函数模块：用于在不同的阶段执行一些操作
 */
export namespace hook {
    /** 后续支持全局钩子管理，做一些控制性质的工作，如【主题变化】、【消息推送】、、、 */

    /**
     * 创建一个新的钩子管理器
     * @param options 
     */
    export function newScope<HookCodes>(): IHookManager<HookCodes> {
        /** 注册的钩子函数信息：key为钩子编码，value为钩子处理函数集合 */
        const hookMap: Map<HookCodes, HookFunction[]> = new Map();

        //#region *************************************实现接口：IHookManager接口方法*************************************
        /**
         * 注册钩子处理函数
         * @param code 钩子编码
         * @param fn 钩子处理函数；处理函数返回false时，终止钩子处理函数执行
         * @returns 返回scope作用域，支持销毁处理函数
         */
        function register(code: HookCodes, fn: HookFunction): IScope {
            /* 销毁时进行undefined处理，避免外部fn多次注册时被一次清理的情况 */
            mustFunction(fn, "fn");
            hookMap.has(code) == false && hookMap.set(code, []);
            const hooks: HookFunction[] = hookMap.get(code);
            const index = hooks.push(fn) - 1;
            return { destroy: () => hooks[index] = undefined };
        }
        /**
         * 执行已注册的钩子
         * - 钩子处理函数无异步逻辑时，使用此方法
         * @param code 钩子编码
         * @param options 执行时的配置选项
         * @param args 运行时传递参数
         * @returns 执行结果，不同情况返回值不一样，注意区分：
         * - 处理函数返回false： { success: false, data: false, reason }
         * - 处理函数发生异常：  { success: false, reason, ex};
         * - 其他情况正常执行：  { success: true };
         */
        function runHook(code: HookCodes, options?: HookRunOptions, ...args: any[]): RunResult<false | undefined> {
            console.log(`start to run hook function. code: ${code}`);
            const hooks = voteHooks(code, options);
            for (let index = 0; index < hooks.length; index++) {
                const rt = run(hooks[index], ...args);
                const hRT = buildHookRunResult(rt, index);
                if (hRT != undefined) {
                    return hRT;
                }
            }
            return { success: true };
        }
        /**
         * 执行已注册的钩子
         * - 当钩子处理函数有异步逻辑时，等待结束再返回
         * - 不确定钩子函数是否异步时，推荐使用此方法，内部兼容同步、异步钩子处理函数
         * @param code 钩子编码
         * @param options 执行时的配置选项
         * @param args 运行时传递参数
         * @returns 执行结果，不同情况返回值不一样，注意区分：
         * - 处理函数返回false： { success: false, data: false, reason }
         * - 处理函数发生异常：  { success: false, reason, ex};
         * - 其他情况正常执行：  { success: true };
         */
        async function runHookAsync(code: HookCodes, options?: HookRunOptions, ...args: any[]): Promise<RunResult<false | undefined>> {
            console.log(`async start to run hook function. code: ${code}`);
            const hooks = voteHooks(code, options);
            for (let index = 0; index < hooks.length; index++) {
                const rt = await runAsync(hooks[index], ...args);
                const hRT = buildHookRunResult(rt, index);
                if (hRT != undefined) {
                    return hRT;
                }
            }
            return { success: true };
        }

        /**
         * 销毁指定的钩子
         * @param code 钩子编码
         */
        function remove(code: HookCodes) {
            hookMap.delete(code);
        }
        /**
         * 销毁当前钩子管理器
         */
        function destroy(): void {
            hookMap.clear();
        }
        //#endregion


        //#region *************************************私有方法*************************************
        /**
         * 选举出需要执行的钩子处理函数
         * @param code 钩子编码
         * @param options 钩子运行配置选项，确定处理函数的选举规则
         * @returns 处理函数数组；100%为数组，无处理函数则返回空数组
         */
        function voteHooks(code: HookCodes, options?: HookRunOptions): HookFunction[] {
            //  获取处理函数，清理掉undefined数据
            let hooks = hookMap.get(code) || [];
            hooks.length && (hooks = hooks.filter(fn => fn != undefined));
            //  超过1个钩子处理函数，进行执行顺序和数量选举：0、1时选举没有意义
            if (options && hooks.length > 1) {
                options.order == "desc" && (hooks = hooks.reverse());
                options.mode === "one" && (hooks = [hooks[0]]);
            }
            return hooks;
        }
        /**
         * 构建钩子处理函数的运行结果
         * @param rt 
         * @param index 
         * @returns 有运行结果值，则返回中断执行
         */
        function buildHookRunResult(rt: RunResult<any>, index: number): RunResult<false | undefined> | undefined {
            //  运行失败：发生错误了
            if (rt.success === false) {
                const reason: string = `interrupted: hook function[${index}] run failed. reason: ${rt.reason}`;
                console.error(reason, rt.ex);
                return { success: false, reason, ex: rt.ex };
            }
            //  运行成功，返回false时，则中断执行
            if (rt.data === false) {
                const reason: string = `interrupted: hook function[${index}] return false.`;
                console.warn(reason);
                return { success: false, data: false, reason };
            }
            //  其他情况，继续执行
            return undefined;
        }
        //#region 

        //  返回管理器对象
        return Object.freeze({ register, runHook, runHookAsync, remove, destroy });
    }
}