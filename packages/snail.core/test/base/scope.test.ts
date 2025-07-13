import { assert, describe, expect, it, test } from 'vitest'
import { wait, defer, delay } from "../../src/base/promise"
import { getMessage, throwError } from '../../src/base/error';
import { IScope, useScope, useScopes, useAsyncScope, checkScope, useKeyScope } from '../../src/base/scope';

//  不用测试【mountScope】，在useScope等方法内部就是使用【mountScope】方法实现，附带就测试了

describe("useScope", () => {
    const sc = useScope();

    var destroyedCount = 0;

    test("property-set", () => {
        expect(sc.destroyed).toStrictEqual(false);
        expect(() => sc.destroyed = true).toThrow("Cannot set property destroyed of [object Object] which has only a getter");
        expect(sc.destroyed).toStrictEqual(false);

        expect(() => sc.onDestroy = undefined!).toThrow("Cannot assign to read only property 'onDestroy' of object '[object Object]'");
        expect(() => sc.destroy = undefined!).toThrow("Cannot assign to read only property 'destroy' of object '[object Object]'");
    });
    test("ondestroy", () => {
        sc.onDestroy(() => destroyedCount++);
        sc.onDestroy(() => throwError("throw error, but other handle can be called continue."))
        sc.onDestroy(() => destroyedCount++);

        expect(() => sc.onDestroy(undefined!)).toThrow("useScope.onDestroy: fn must be a function.");
    });

    test("before-destroy", () => expect(destroyedCount).toStrictEqual(0));
    test("destroy", () => {
        expect(checkScope(sc, '')).toStrictEqual(true);
        sc.destroy();
        expect(destroyedCount).toStrictEqual(2);
        expect(sc.destroyed).toStrictEqual(true);
        expect(() => checkScope(sc, 'sc destroyed')).toThrow("sc destroyed");
    });
    test("destroy-again", () => {
        sc.destroy();
        expect(destroyedCount).toStrictEqual(2);
        expect(sc.destroyed).toStrictEqual(true);
    });
    test("after-destroy", () => {
        sc.onDestroy(() => destroyedCount++);
        expect(destroyedCount).toStrictEqual(3);
        expect(sc.destroyed).toStrictEqual(true);
    });
});
//  scopes 内部使用的useScope，不用测试 destroyed onDestroy
describe("useScopes", () => {
    const scopes = useScopes();

    var childScopeDestroyed = 0;
    var removeScope: IScope;
    test("add", () => {
        expect(() => scopes.add(undefined!)).toThrow("useScopes.add: child must be an instance of IScope.");
        expect(() => scopes.add(1 as any)).toThrow("useScopes.add: child must be an instance of IScope.");
        scopes.add(useScope()).onDestroy(() => childScopeDestroyed++);
        scopes.add(useScope()).onDestroy(() => throwError("throw error, but other handle can be called continue."))

        removeScope = scopes.add(useScope());
        removeScope.onDestroy(() => childScopeDestroyed++);

        scopes.add(useScope()).onDestroy(() => childScopeDestroyed++);
    });
    test("remove", () => scopes.remove(removeScope));

    test("destroy", () => {
        var x = 1;
        const newScope = scopes.get();
        newScope.onDestroy(() => {
            debugger
            x = 2;
        });

        scopes.destroy();
        expect(childScopeDestroyed).toStrictEqual(2);
        expect(scopes.destroyed).toStrictEqual(true);
        expect(x).toStrictEqual(2);
    });

    test("after-destroy", () => {
        scopes.remove(undefined!);
        scopes.remove(removeScope);
    });
});
//  在promise的基础上添加IScope属性，需要测试一下会不会被set掉
describe("useAsyncScope", async () => {
    const success: Promise<number> = new Promise<number>(resolve => setTimeout(resolve, 2000, 12));

    var sc = useAsyncScope<number>(success);
    //  测试只读属性，不可修改；内部中转到了useScope的属性对象
    test("property-set", () => {
        expect(sc.destroyed).toStrictEqual(false);
        expect(() => sc.destroyed = true).toThrow("Cannot set property destroyed of #<Promise> which has only a getter");
        expect(sc.destroyed).toStrictEqual(false);

        expect(() => sc.onDestroy = undefined!).toThrow("Cannot assign to read only property 'onDestroy' of object '#<Promise>'");
        expect(() => sc.destroy = undefined!).toThrow("Cannot assign to read only property 'destroy' of object '#<Promise>'");
    });

    test("task-finished", async () => {
        var destroyCount = 0;
        sc.onDestroy(() => destroyCount++);
        sc.onDestroy(() => destroyCount++);
        const number = await sc;
        expect(sc.destroyed).toStrictEqual(true);
        expect(destroyCount).toStrictEqual(2);
    });

    test("faile-task", async () => {
        const failed: Promise<number> = Promise.reject('fail');
        const fsc = useAsyncScope<number>(failed);
        var fdestroyCount = 0;
        fsc.onDestroy(() => fdestroyCount++);
        fsc.onDestroy(() => fdestroyCount++);

        await expect(() => fsc).rejects.toThrow("fail");

        expect(fsc.destroyed).toStrictEqual(true);
        expect(fdestroyCount).toStrictEqual(2);
    });
});

test("useKeyScope", async () => {
    //  全新构建一个，复用一次
    var { reuse, scope } = useKeyScope("key", true);
    expect(reuse).toStrictEqual(false);
    var { reuse, scope } = useKeyScope("key", true);
    expect(reuse).toStrictEqual(true);
    ///  不复用，始终构建新的
    var { reuse, scope } = useKeyScope("key", false);
    expect(reuse).toStrictEqual(false);
    //  再次复用
    var { reuse, scope } = useKeyScope("key", true);
    expect(reuse).toStrictEqual(true);
    //  销毁掉，再次复用，此时仍然为新建
    scope.destroy();
    var { reuse, scope } = useKeyScope("key", true);
    expect(reuse).toStrictEqual(false);

    //  key唯一性验证
    var { reuse, scope } = useKeyScope("key", true);
    expect(reuse).toStrictEqual(true);
    var { reuse, scope } = useKeyScope("key2", true);
    expect(reuse).toStrictEqual(false);
});