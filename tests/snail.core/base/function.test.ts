import { assert, describe, expect, it, test, vi } from 'vitest'
import { run, runAsync, debounce, polling } from "../../../packages/snail.core/src/base/function"

vi.mock("../../../packages/snail.core/src/base/function", { spy: true });


test("run", () => {
    var rt = run(undefined as any);
    expect(rt).toBeTypeOf("object");
    expect(rt.success).toStrictEqual(false);
    expect(rt.reason).toEqual("func must be a function.");

    rt = run(data => data, 100);
    expect(rt.success).toStrictEqual(true);
    expect(rt.data).toEqual(100);

    rt = run(data => { throw new Error(data) }, 100);
    expect(rt.success).toStrictEqual(false);
    expect(rt.reason).toStrictEqual("100");
    expect(rt.ex instanceof Error).toStrictEqual(true);
});

test("runAsync", async () => {
    function testFunc<T>(number: T): Promise<T> {
        if (number == -1) {
            throw new Error("测试Error");
        }
        return new Promise<T>((resolve, reject) => {
            number == 0
                ? reject(number)
                : resolve(number);
        })
    };

    var rt = await runAsync(testFunc, 100);
    expect(rt.success).toStrictEqual(true);
    expect(rt.data).toStrictEqual(100);
    rt = await runAsync(testFunc, 0);
    expect(rt.success).toStrictEqual(false);
    expect(rt.data).toStrictEqual(undefined);
    expect(rt.reason).toStrictEqual("0");
    rt = await runAsync(testFunc, -1);
    expect(rt.success).toStrictEqual(false);
    expect(rt.reason).toStrictEqual("测试Error");
    expect(rt.ex instanceof Error).toStrictEqual(true);

    rt = await runAsync(number => number, 100);
    expect(rt.success).toStrictEqual(true);
    expect(rt.data).toStrictEqual(100);

});


test("debounce", async () => {
    let x: number = 0;
    let count: number = 0;
    const delayFunc = (number: number) => {
        x = number;
        count += 1;
    }
    //  先测试调用情况
    expect(debounce(delayFunc, 1000)).toBeTypeOf("function");
    expect(debounce).toHaveBeenCalledWith(delayFunc, 1000);

    const debounceFunc = debounce(delayFunc, 1000);

    x = 0;
    count = 0;
    debounceFunc(1);
    debounceFunc(2);
    debounceFunc(3);
    //  等待，然后断言
    await new Promise((resolve: Function) => {
        setTimeout(() => {
            resolve();
        }, 100);
    });
    assert.isTrue(count == 0);
    assert.isTrue(x == 0);
    await new Promise((resolve: Function) => {
        setTimeout(() => {
            resolve();
        }, 1000);
    });
    assert.isTrue(count == 1);
    assert.isTrue(x == 3);
});

test("polling", async () => {
    var count: number = 0;

    function pFunc(number): number {
        count += number;
        return count;
    }
    function cFunc(data) {
        return data >= 10;
    }

    //  无效参数测试
    {
        //@ts-ignore
        expect(() => polling(null, null)).toThrowError();
        //@ts-ignore
        expect(() => polling(pFunc, null)).toThrowError();
        //@ts-ignore
        expect(() => polling(null, cFunc)).toThrowError();
    }

    //@ts-ignore  2s的超时时间，NaN轮询时间则默认5s轮询一次；每次自加1
    count = 0, await expect(polling(pFunc, cFunc, NaN, 2, 1)).rejects.eq("超时时间已到，强制停止");
    //@ts-ignore  2s的超时时间，1s轮询一次；每次自加1
    count = 0, await expect(polling(pFunc, cFunc, 1, 2, 1)).rejects.eq("超时时间已到，强制停止");
    //@ts-ignore  10s的超时时间，1s轮询一次；每次自加1
    count = 0, await expect(polling(pFunc, cFunc, 1, 10, 4)).resolves.greaterThanOrEqual(10);
    //  测试then方法，promise模式
    count = 0, await (expect(polling((number) => {
        return new Promise(resolve => {
            count = count + number;
            resolve(count);
        })
    }, cFunc, 1, 10, 4))).resolves.greaterThanOrEqual(10);
    //@ts-ignore  测试始终等待
    count = 0, await (expect(polling(pFunc, cFunc, 1, -1, 2))).resolves.greaterThanOrEqual(10);
});
