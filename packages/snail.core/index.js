'use strict'

// 暂时都引入一个js，后期看情况调整，区分生产环境和开发环境；参照Vue
if (process.env.NODE_ENV === 'production') {
    module.exports = require('./dist/snail.core.js')
} else {
    module.exports = require('./dist/snail.core.js')
}

/**
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/vue.cjs.prod.js')
} else {
  module.exports = require('./dist/vue.cjs.js')
}
 */