/**
 * 样式预处理器；
 *    1、代码copy自@vue/compile-sfc；
 *      源码地址：https://github.com/vuejs/vue/blob/main/packages/compiler-sfc/src/stylePreprocessors.ts
 *    2、独立提取代码的目的
 *      1、尝试将style样式处理部分，从包中迁移出来，此包中还包含了vue代码打包逻辑，不划算
 *      2、后期考虑把style编译整理迁移出来
 */
import merge from 'merge-source-map'
import { RawSourceMap } from 'source-map'

export type StylePreprocessor = (
    source: string,
    map: RawSourceMap | undefined,
    options: {
        [key: string]: any
        additionalData?: string | ((source: string, filename: string) => string)
        filename: string
    }
) => StylePreprocessorResults

export interface StylePreprocessorResults {
    code: string
    map?: object
    errors: Error[]
    dependencies: string[]
}


/* v8 ignore next 130 copy自 @vue/compile-sfc ，不做源码覆盖率测试*/

// .scss/.sass processor
const scss: StylePreprocessor = (source, map, options) => {
    const nodeSass = require('sass')
    const finalOptions = {
        ...options,
        data: getSource(source, options.filename, options.additionalData),
        file: options.filename,
        outFile: options.filename,
        sourceMap: !!map
    }

    try {
        const result = nodeSass.renderSync(finalOptions)
        const dependencies = result.stats.includedFiles
        if (map) {
            return {
                code: result.css.toString(),
                map: merge(map, JSON.parse(result.map.toString())),
                errors: [],
                dependencies
            }
        }

        return { code: result.css.toString(), errors: [], dependencies }
    } catch (e: any) {
        return { code: '', errors: [e], dependencies: [] }
    }
}

const sass: StylePreprocessor = (source, map, options) =>
    scss(source, map, {
        ...options,
        indentedSyntax: true
    })

// .less
const less: StylePreprocessor = (source, map, options) => {
    const nodeLess = require('less')

    let result: any
    let error: Error | null = null
    nodeLess.render(
        getSource(source, options.filename, options.additionalData),
        { ...options, syncImport: true },
        (err: Error | null, output: any) => {
            error = err
            result = output
        }
    )

    if (error) return { code: '', errors: [error], dependencies: [] }
    const dependencies = result.imports
    if (map) {
        return {
            code: result.css.toString(),
            map: merge(map, result.map),
            errors: [],
            dependencies: dependencies
        }
    }

    return {
        code: result.css.toString(),
        errors: [],
        dependencies: dependencies
    }
}

// .styl
const styl: StylePreprocessor = (source, map, options) => {
    const nodeStylus = require('stylus')
    try {
        const ref = nodeStylus(source)
        Object.keys(options).forEach(key => ref.set(key, options[key]))
        if (map) ref.set('sourcemap', { inline: false, comment: false })

        const result = ref.render()
        const dependencies = ref.deps()
        if (map) {
            return {
                code: result,
                map: merge(map, ref.sourcemap),
                errors: [],
                dependencies
            }
        }

        return { code: result, errors: [], dependencies }
    } catch (e: any) {
        return { code: '', errors: [e], dependencies: [] }
    }
}

function getSource(
    source: string,
    filename: string,
    additionalData?: string | ((source: string, filename: string) => string)
) {
    if (!additionalData) return source
    if (typeof additionalData === "function") {
        return additionalData(source, filename)
    }
    return additionalData + source
}

export type PreprocessLang = 'less' | 'sass' | 'scss' | 'styl' | 'stylus'

export const processors: Record<PreprocessLang, StylePreprocessor> = {
    less,
    sass,
    scss,
    styl,
    stylus: styl
}

//#region 补充修改内容
/**
 * 强制重写require方法，进行文件路径优化
 * 在es module环境下，支持require方法
 */
import { createRequire } from 'node:module';
const _require = createRequire(import.meta.url);
const require = function (id: string, from?: string) {
    try {
        return from
            ? _require(_require.resolve(id, { paths: [from] }))
            : _require(id);
    } catch (e) { }
}
//#region 