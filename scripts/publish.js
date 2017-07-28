'use strict';

const fs = require('fs');
const sh = require('shelljs');
const argv  = require('yargs')
    .alias('b', 'bump')
    .choices('b', ['patch', 'minor', 'major'])
    .default('b', 'patch')
    .demandOption(['b'])
    .argv;

const root      = process.cwd();
const config    = require(`${root}/angular-library.config.json`);
const distDir   = `${root}\\dist\\${config.package}`;

sh.cd(root);
if(sh.exec(`npm run build`, { silent: false }).code === 0) {
    if(sh.exec(`npm version ${argv.b}`).code === 0) {
        makePackageJson();
        sh.cd(distDir);
        sh.exec(`npm publish`);
    }
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
