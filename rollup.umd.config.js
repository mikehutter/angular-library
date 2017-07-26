import * as config from './rollup.base.config.js';

var _config = config.base({
    dest: `./dist/${config.pkg}/bundles/${config.pkg}.umd.js`,
    entry: `./dist/${config.pkg}/@${config.scope}/${config.pkg}.es5.js`,
    exports: 'named',
    format: 'umd',
    moduleName: `${config.scope}.${config.pkg}`,
    sourceMap: true,
    sourceMapFile: `./dist/${config.pkg}/@${config.scope}/${config.pkg}.umd.js`
});

export default _config;