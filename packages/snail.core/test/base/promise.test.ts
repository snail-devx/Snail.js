import { assert, describe, expect, test } from 'vitest'
import { awaitx, defer, delay } from "../../src/base/promise"
import { getMessage } from '../../src/base/error';

test("defer", async () => {

    let deferred = defer<number>();
    setTimeout(deferred.resolve, 3, 100);
    await expect(deferred.promise).resolves.toEqual(100);

    deferred = defer<number>();
    setTimeout(deferred.reject, 3, 100);
    await expect(deferred.promise).rejects.toEqual(100);
});

test("delay", async () => {
    await expect(delay(100)).resolves.toStrictEqual(true);
});

//  使用通义灵码生成的单元测试
describe('awaitx', async () => {
    // 模拟值和函数
    const mockData = 'success-data';
    const mockError = new Error('mock-error');
    const mockReasonStr = 'custom-reason-string';

    /** TC01: 输入不是 Promise */
    test('should reject with error if input is not a Promise', async () => {
        const result = await awaitx<any>('not-a-promise' as any);
        expect(result.success).toBe(false);
        expect(result.reason).toBe("promise is not a Promise");
        expect(result.ex).toBeUndefined();
    });
    /** TC02: Promise 成功 resolve */
    test('should return success result when promise resolves', async () => {
        const promise = Promise.resolve(mockData);
        const result = await awaitx(promise);
        expect(result.success).toBe(true);
        expect(result.data).toBe(mockData);
        expect(result.ex).toBeUndefined();
        expect(result.reason).toBeUndefined();
    });

    /** TC03: Promise reject with Error */
    test('should return error result with ex when promise rejects with Error', async () => {
        const promise = Promise.reject(mockError);

        const result = await awaitx(promise);

        expect(result.success).toBe(false);
        expect(result.ex).toBe(mockError);
        expect(result.reason).toBe("mock-error");
    });

    /** TC04: Promise reject with non-Error */
    test('should return error result with reason when promise rejects with non-Error', async () => {
        const rejectReason = 'string-reject-reason';
        const promise = Promise.reject(rejectReason);

        const result = await awaitx(promise);

        expect(result.success).toBe(false);
        expect(result.ex).toBeUndefined();
        expect(result.reason).toBe(getMessage(rejectReason)); // 应与 getMessage 返回一致
    });
});