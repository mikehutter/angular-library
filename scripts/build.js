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
    process.exit(1);
}

function lint(){
    sh.echo(chalk.yellow(`Lint check started for ${config.package}`));
    const results = sh.exec(`tslint --project tsconfig.json --type-check ${srcDir}/lib/**/*.ts`);
    if(results.code !== 0){
        sh.echo(chalk.red(`Lint check completed with errors.`));
        process.exit(1);
    }
    sh.echo(chalk.green(`Lint check completed successfully.`));
    compile();
}

function compile() {
    sh.cd(root);
    sh.echo(chalk.yellow(`AoT compilation started for ${config.package}`));
    if(sh.exec(`ngc --prod --aot -p ${aotCfg}`).code !== 0) {
        sh.echo(chalk.red(`Error: AoT compilation failed for ${config.package}`));
        process.exit(1);
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

    makePackageJson();
}

function makePackageJson() {
    var _commonPackageJson = [ 'name', 'version', 'description', 'license', 'author', 'repository', 'peerDependencies' ],
        _rootPackageJson = JSON.parse(fs.readFileSync(`${root}\\package.json`, 'utf8')),
        _distPackageJson = {
            'name': '',
            'version': '',
            'description': '',
            'main': `./bundles/${config.package}.umd.js`,
            'module': `./@${config.scope}/${config.package}.es5.js`,
            'es2015': `./@${config.scope}/${config.package}.js`,
            'typings': `./${config.package}.d.ts`
        };

    Object.keys(_rootPackageJson).forEach(function(key) {
        if(_commonPackageJson.indexOf(key) != -1){
            _distPackageJson[key] = _rootPackageJson[key];
        }
    });
    
    fs.writeFileSync(`${distDir}\\package.json`, JSON.stringify(_distPackageJson, null, 2), 'utf8');
}

init();
