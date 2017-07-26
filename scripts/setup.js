"use strict";

// To run the setup script, add the following to the scripts section of package.json and then execute 'npm i'
// "postinstall": "node ./scripts/setup.js",

const chalk         = require('chalk');
const fs            = require('fs');
const sh            = require('shelljs');
const root          = process.cwd();

const configPath            = `${root}\\angular-library.config.json`;
const angularCliJsonPath    = `${root}\\.angular-cli.json`;
const packageJsonPath       = `${root}\\package.json`;
const rollupJsonPath        = `${root}\\rollup.base.config.json`;
const tsconfigAotJsonPath   = `${root}\\tsconfig-aot.json`;
const tsconfigAppJsonPath   = `${root}\\src\\demo\\tsconfig.app.json`;

const config = getJson(configPath);

if(config.scope.trim() === '' || config.package.trim() === '' || config.prefix.trim() === '') {
    sh.echo(chalk.red('You must provide values in angular-library.config.json before this project will build properly.'));
    exit(1);
}

// angular-cli
const angularCliJson = getJson(angularCliJsonPath);
    angularCliJson.project.name = `${config.scope}-${config.package}`;
    angularCliJson.apps[1].prefix = `${config.prefix}`;
putJson(angularCliJsonPath, angularCliJson);

// tsconfig-aot
const tsconfigAotJson = getJson(tsconfigAotJsonPath);
    tsconfigAotJson.compilerOptions.outDir = `./dist/${config.package}`;
    tsconfigAotJson.angularCompilerOptions.flatModuleId = `@${config.scope}/${config.package}`;
putJson(tsconfigAotJsonPath, tsconfigAotJson);

// tsconfig.app
const tsconfigAppJson = getJson(tsconfigAppJsonPath);
    tsconfigAppJson.compilerOptions.paths[`@${config.scope}/${config.package}`] = [ "../lib" ];
putJson(tsconfigAppJsonPath, tsconfigAppJson);

// package
const packageJson = getJson(packageJsonPath);
    packageJson.name = `@${config.scope}/${config.package}`;
    delete packageJson.scripts.postinstall;
putJson(packageJsonPath, packageJson);

function getJson(path) {
    return require(path);
}

function putJson(jsonPath, jsonContent) {
    fs.writeFile(jsonPath, JSON.stringify(jsonContent, null, 2), 'utf8');
}