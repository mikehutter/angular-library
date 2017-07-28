const sh = require('shelljs');

const result = sh.exec(`node-sass --importer=node_modules/node-sass-tilde-importer --recursive --output src/lib src/lib`);
if(result.code !== 0 && result.stderr.trim() !== 'No input file was found.') {
    process.exit(1);
}
