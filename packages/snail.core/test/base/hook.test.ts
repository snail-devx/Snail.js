import { beforeEach, afterEach, describe, expect, it, vi, test } from 'vitest';
import { useHook } from "../../src/base/hook";
import { HookFunction, IHookManager } from '../../src/base/models/hook-model';
import { throwError } from '../../src/base/error';
import { delay } from '../../src/base/promise';
import { IScope } from '../../src/base/scope';

const flag: string[] = [];
beforeEach(() => flag.splice(0));

//  定义用到方方法
const hook1 = () => (flag.push("hook1"), undefined),
    hook2 = () => (flag.push("hook2"), undefined),
    hook3 = () => (flag.push("hook3"), undefined),
    hookF1: HookFunction = () => (flag.push("hookF1"), false),
    hookF2: HookFunction = () => (flag.push("hookF2"), false),
    hookE1: HookFunction = () => (flag.push("hookE1"), throwError("hookE1"), undefined),
    hookE2: HookFunction = () => (flag.push("hookE2"), throwError("hookE2"), undefined);
const hookA1 = async () => (await delay(10), flag.push("hookA1"), undefined),
    hookA2 = async () => (await delay(10), flag.push("hookA2"), Promise.resolve(undefined)),
    hookA3 = async () => (await delay(10), flag.push("hookA3"), Promise.resolve(undefined)),
    hookAF1: HookFunction = async () => (await delay(10), flag.push("hookAF1"), Promise.resolve(false)),
    hookAF2: HookFunction = async () => (await delay(10), flag.push("hookAF2"), Promise.resolve(false)),
    hookAE1: HookFunction = async () => (await delay(10), flag.push("hookAE1"), throwError("hookAE1"), undefined),
    hookAE2: HookFunction = async () => (await delay(10), flag.push("hookAE2"), throwError("hookAE2"), undefined);

describe("runHook", () => {
    const manager: IHookManager<string> = useHook<string>();
    test("none-registed", () => {
        let rt = manager.runHook("A");
        expect(rt.success).toBe(true);
    });
    {
        manager.register("A", hook1);
        manager.register("A", hook2);
        manager.register("A", hook3);
    }
    test("one-asc", () => {
        manager.runHook("A", { mode: "one", order: "asc" });
        expect(flag.length).toBe(1);
        expect(flag[0]).toBe("hook1");
    });
    test("one-desc", () => {
        manager.runHook("A", { mode: "one", order: "desc" });
        expect(flag.length).toBe(1);
        expect(flag[0]).toBe("hook3");
    });
    test("all-asc", () => {
        manager.runHook("A", { mode: "all", order: "asc" });
        expect(flag.length).toBe(3);
        expect(flag).toEqual(["hook1", "hook2", "hook3"]);
    });
    test("all-desc", () => {
        manager.runHook("A", { mode: "all", order: "desc" });
        expect(flag.length).toBe(3);
        expect(flag).toEqual(["hook1", "hook2", "hook3"].reverse());
    });

});
describe("runHook-false", () => {
    const manager: IHookManager<string> = useHook();
    manager.register("A", hook1);
    manager.register("A", hookF1);
    manager.register("A", hook2);
    manager.register("A#", hook1);
    manager.register("A#", hookE2);
    manager.register("A#", hook2);

    test("runHook-return false", () => {
        var rt = manager.runHook("A", { mode: "all", order: "asc" });
        expect(rt.success).toBe(false);
        expect(rt.reason).toBe('interrupted: hook function[1] return false.');
        expect(flag).toEqual(["hook1", "hookF1"]);
    });
    test("runHook-return false desc", () => {
        const rt = manager.runHook("A", { mode: "all", order: "desc" });
        expect(rt.success).toBe(false);
        expect(rt.reason).toBe('interrupted: hook function[1] return false.');
        expect(flag).toEqual(["hook2", "hookF1"]);
    });
    test("runHook-Exception", () => {
        var rt = manager.runHook("A#", { mode: "all", order: "asc" });
        expect(rt.success).toBe(false);
        expect(rt.reason).toBe('interrupted: hook function[1] run failed. reason: hookE2');
        expect(flag).toEqual(["hook1", "hookE2"]);
    });
    test("runHook-Exception desce", () => {
        const rt = manager.runHook("A#", { mode: "all", order: "desc" });
        expect(rt.success).toBe(false);
        expect(rt.reason).toBe('interrupted: hook function[1] run failed. reason: hookE2');
        expect(flag).toEqual(["hook2", "hookE2"]);
    });
});
describe("runHookAsync", () => {
    const manager: IHookManager<string> = useHook();
    test("none-registed", async () => {
        const rt = await manager.runHookAsync("A");
        expect(rt.success).toBe(true);
    });
    {
        manager.register("A", hookA1);
        manager.register("A", hookA2);
        manager.register("A", hookA3);
    }
    test("one-asc", async () => {
        await manager.runHookAsync("A", { mode: "one", order: "asc" });
        expect(flag.length).toBe(1);
        expect(flag[0]).toBe("hookA1");
    });
    test("one-desc", async () => {
        await manager.runHookAsync("A", { mode: "one", order: "desc" });
        expect(flag.length).toBe(1);
        expect(flag[0]).toBe("hookA3");
    });
    test("all-asc", async () => {
        await manager.runHookAsync("A", { mode: "all", order: "asc" });
        expect(flag.length).toBe(3);
        expect(flag).toEqual(["hookA1", "hookA2", "hookA3"]);
    });
    test("all-desc", async () => {
        await manager.runHookAsync("A", { mode: "all", order: "desc" });
        expect(flag.length).toBe(3);
        expect(flag).toEqual(["hookA1", "hookA2", "hookA3"].reverse());
    });
});
describe("runHookAsync-false", async () => {
    const manager: IHookManager<string> = useHook();
    manager.register("A", hookA1);
    manager.register("A", hookAF1);
    manager.register("A", hookA2);
    manager.register("A#", hookA1);
    manager.register("A#", hookAE2);
    manager.register("A#", hookA2);

    test("runHookAsync-return false", async () => {
        var rt = await manager.runHookAsync("A", { mode: "all", order: "asc" });
        expect(rt.success).toBe(false);
        expect(rt.reason).toBe('interrupted: hook function[1] return false.');
        expect(flag).toEqual(["hookA1", "hookAF1"]);
    });
    test("runHookAsync-return false desc", async () => {
        const rt = await manager.runHookAsync("A", { mode: "all", order: "desc" });
        expect(rt.success).toBe(false);
        expect(rt.reason).toBe('interrupted: hook function[1] return false.');
        expect(flag).toEqual(["hookA2", "hookAF1"]);
    });
    test("runHook-Exception", async () => {
        var rt = await manager.runHookAsync("A#", { mode: "all", order: "asc" });
        expect(rt.success).toBe(false);
        expect(rt.reason).toBe('interrupted: hook function[1] run failed. reason: hookAE2');
        expect(flag).toEqual(["hookA1", "hookAE2"]);
    });
    test("runHook-Exception desce", async () => {
        const rt = await manager.runHookAsync("A#", { mode: "all", order: "desc" });
        expect(rt.success).toBe(false);
        expect(rt.reason).toBe('interrupted: hook function[1] run failed. reason: hookAE2');
        expect(flag).toEqual(["hookA2", "hookAE2"]);
    });
});
//  注册、移除、销毁
describe("register-remove-destroy", () => {
    const manager: IHookManager<string> & IScope = useHook();
    test("remove", () => {
        manager.register("A", hook1);
        manager.register("A", hook2);
        manager.register("A", hook3);

        manager.runHook("A", { mode: "all", order: "desc" });
        expect(flag.length).toBe(3);
        expect(flag).toEqual(["hook1", "hook2", "hook3"].reverse());
        flag.splice(0);
        manager.remove("A");
        manager.runHook("A");
        expect(flag.length).toBe(0);
        expect(flag).toEqual([]);
    });
    test("destroy", async () => {
        manager.register("A", hookA1);
        manager.register("A", hookA2);
        manager.register("A", hookA3);

        await manager.runHookAsync("A", { mode: "all", order: "desc" });
        expect(flag.length).toBe(3);
        expect(flag).toEqual(["hookA1", "hookA2", "hookA3"].reverse());
        flag.splice(0);
        manager.destroy();
        await expect(() => manager.runHookAsync("A")).rejects.toThrow("runHookAsync: hook manager destroyed.");
        expect(flag.length).toBe(0);
        expect(flag).toEqual([]);

        expect(manager.runHook("A")).contain({ success: false, reason: "runHook: hook manager destroyed." });
        expect(() => manager.register("A", hook1)).toThrow("register: hook manager destroyed.");
        expect(() => manager.remove("A")).toThrow("remove: hook manager destroyed.");

    });
});