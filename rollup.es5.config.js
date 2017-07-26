import * as config from './rollup.base.config.js'

var _config = config.base({
    dest: `./dist/${config.pkg}/@${config.scope}/${config.pkg}.es5.ts`,
    entry: `./dist/${config.pkg}/index.js`,
    format: 'es',
    sourceMap: false
});

export default _config;