"use strict";

// To run the setup script, add the following to the scripts section of package.json and then execute 'npm i'
// "postinstall": "node ./scripts/setup.js",

const chalk = require('chalk');
const fs = require('fs');
const sh = require('shelljs');
const rimraf = require('rimraf');

const root = process.cwd();

const configPath = `${root}\\angular-library.config.json`;
const angularCliJsonPath = `${root}\\.angular-cli.json`;
const packageJsonPath = `${root}\\package.json`;
const rollupJsonPath = `${root}\\rollup.base.config.json`;
const tsconfigAotJsonPath = `${root}\\tsconfig-aot.json`;
const tsconfigAppJsonPath = `${root}\\src\\demo\\tsconfig.app.json`;

const config = getJson(configPath);

function ensureConfig() {
    sh.echo(chalk.yellow('Checking config...'));
    Object.keys(config).forEach((key) => {
        if (config[key].trim() === '') {
            sh.echo(chalk.red(`You must provide a value in angular-library.config.json for '${key}' before this project will build properly.`));
            process.exit(1);
        }
    });
}

function configGit() {
    sh.echo(chalk.yellow('Configure GIT...'));
    rimraf(`${root}\\.git`, (err) => {
        if (err) {
            console.log(err);
            process.exit(5);
        } else {
            if (sh.exec(`git init`).code !== 0) {
                process.exit(2);
            }
            if (sh.exec(`git remote add origin ${config.origin}${config.scope}-${config.package}`).code !== 0) {
                process.exit(3);
            }
            if (sh.exec(`git push -u origin --all`).code !== 0) {
                process.exit(4);
            }
        }
    });
}

function configProject() {
    sh.echo(chalk.yellow('Apply settings...'));

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
    tsconfigAppJson.compilerOptions.paths[`@${config.scope}/${config.package}`] = ["../lib"];
    putJson(tsconfigAppJsonPath, tsconfigAppJson);

    // package
    const packageJson = getJson(packageJsonPath);
    packageJson.name = `@${config.scope}/${config.package}`;
    delete packageJson.scripts.postinstall;
    putJson(packageJsonPath, packageJson);
}

function getJson(path) {
    return require(path);
}

function putJson(jsonPath, jsonContent) {
    fs.writeFile(jsonPath, JSON.stringify(jsonContent, null, 2), 'utf8');
}

ensureConfig();
configGit();
configProject();