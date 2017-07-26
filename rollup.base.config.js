import angularInline from 'rollup-plugin-angular-inline';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';

const config = require('./angular-library.config.json');

export const pkg = config.package;
export const scope = config.scope;

export function base(options) {

    var globals = {
        '@angular/common': 'ng.common',
        '@angular/core': 'ng.core',
        '@angular/http': 'ng.http',
        '@angular/router': 'ng.router'        
    };

    const ignored = [
        // list of paths to treat as internal when using rollupOptions.external(id)
        './',
        'C:\\'
    ];

    var _options = {
        external:  (id) => {
            id = id.trim();
            if(ignored.some(i => id.indexOf(i) === 0)) {
                return false;
            };
            var isExternal = Object.keys(globals).indexOf(id) > -1;
            if(!isExternal) {
                console.warn('WARNING: External code is probably being bundled for:', id);
            }
            return isExternal;
        },
        globals: globals,
        onwarn: function (warning) {
            if (warning.code === 'THIS_IS_UNDEFINED') {
                return;
            }
            console.warn(warning.message);
        },
        plugins: [
            angularInline({
                include: './**/*.component.js'
            }),
            commonjs({
                include: [
                    'node_modules/rxjs/**'
                ]
            }),
            nodeResolve()
        ]
    };

    Object.keys(options).forEach((o) => {
        _options[o] = options[o];
    });

    return _options;
};