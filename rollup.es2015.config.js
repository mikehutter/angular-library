import * as config from './rollup.base.config.js';

var _config = config.base({
    dest: `./dist/${config.pkg}/@${config.scope}/${config.pkg}.js`,
    entry: `./dist/${config.pkg}/${config.pkg}.js`,
    format: 'es',
    sourceMap: true,
    sourceMapFile: `./dist/${config.pkg}/@${config.scope}/${config.pkg}.js`
});

export default _config;