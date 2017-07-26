"use strict";

const chalk         = require('chalk');
const copy          = require('recursive-copy');
const fs            = require('fs');
const sh            = require('shelljs');
const rimraf        = require('rimraf');

const root          = process.cwd();
const config        = require(`${root}/angular-library.config.json`);

var distDir     = null,
    srcDir      = null,
    aotCfg      = null,
    rollupOut   = null;

function init() {

    distDir     = `./dist/${config.package}`;
    srcDir      = `./src`;

    aotCfg      = `./tsconfig-aot.json`;
    rollupOut   = `${distDir}/@${config.scope}/${config.package}`;

    copy(`${srcDir}`, `${distDir}/src`, { filter: [ 'lib/**/*.html', 'lib/**/*.scss', 'lib/**/*.css' ], overwrite: true })
        .catch(onError)
        .then(lint);
}

function onError(error) {
    sh.echo(chalk.red(`${config.package} build fail: ${error}`));
    exit(1);
}

function lint(){
    /* TSLint with Codelyzer */
    // https://github.com/palantir/tslint/blob/master/src/configs/recommended.ts
    // https://github.com/mgechev/codelyzer
    // sh.echo(`Start TSLint`);
    // sh.exec(`tslint --project ${srcDir}/tsconfig.json --type-check ${srcDir}/**/*.ts`);
    // sh.echo(chalk.green(`TSLint completed`));
    compile();
}

function compile() {
    sh.cd(root);
    sh.echo(chalk.yellow(`AoT compilation started for ${config.package}`));
    if(sh.exec(`ngc --prod --aot -p ${aotCfg}`).code !== 0) {
        sh.echo(chalk.red(`Error: AoT compilation failed for ${config.package}`));
        exit(1);
    }
    sh.echo(chalk.green(`AoT compilation completed for ${config.package}`));
    rollup();
}

function rollup() {
    sh.cd(root);
    
    // create es2015 module file
    sh.echo(chalk.yellow('rollup es2015 started'));
    sh.exec(`rollup -c rollup.es2015.config.js`, { silent: false });
    sh.echo(chalk.green('rollup es2015 completed'));

    // create es5 module file
    sh.echo(chalk.yellow('rollup es5 started'));
    sh.exec(`rollup -c rollup.es5.config.js`);
    sh.exec(`tsc ${rollupOut}.es5.ts --target es5 --module es2015 --sourceMap --sourceRoot .`, { silent: true });
    sh.echo(chalk.green('rollup es5 completed'));

    // create umd file
    sh.echo(chalk.yellow('rollup umd started'));
    sh.exec(`rollup -c rollup.umd.config.js`, { silent: false });
    sh.echo(chalk.green('rollup umd completed'));

    cleanup();
}

function cleanup() {
    sh.cd(root);
    sh.echo(chalk.yellow(`Cleanup started for ${config.package}`));
    var toRemove = [
        `./dist/${config.package}/src/**/*.css`,
        `./dist/${config.package}/src/**/*.html`,
        `./dist/${config.package}/src/**/*.js`,
        `./dist/${config.package}/src/**/*.map`
    ];
    sh.rm(`-rf`, toRemove);
    sh.echo(chalk.green(`Cleanup completed for ${config.package}`));
}

init();
