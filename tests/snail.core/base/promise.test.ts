import { assert, describe, expect, test } from 'vitest'


import { defer, delay } from "../../../packages/snail.core/src/base/promise"

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