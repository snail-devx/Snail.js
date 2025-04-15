import { configDefaults, defineConfig } from 'vitest/config'

// 参照：https://cn.vitest.dev/config/#include

//  先使用默认的配置；后期再研究，如进行mock
export default defineConfig({
    test: {
        //  如果要完整模拟dom，则加上
        // environment: "jsdom",
        testTimeout: 1000 * 100,
        exclude: [
            ...configDefaults.exclude,
        ],
        include: [
            // "packages/*/__test__/**",
            "tests/**/*.test.ts"
        ]
    },
})