module.exports = (es6 = false) => {
    let head = `const fs = require('fs')
const path = require('path')

const registeredEnvironments = {
    dev: require('./../env.dev'),
    prod: require('./../env.prod')
}
`

    if (es6 === true) {
        head = `import fs from 'fs'
import path from 'path'
import dev from './../env.dev.js'
import prod from './../env.prod.js'
const __dirname = path.resolve();
const registeredEnvironments = {dev, prod}`
    }

    return `${head}

main();

function main() {
    const environment = getEnv();
    const env = registeredEnvironments[environment] ?? null;

    if (env === null) {
        console.error('Environment not registered');

        process.exit(1);
    }

    Promise.all([
        writeReactEnv(env),
    ])
        .then(() => {
            console.log(\`Config was setted to $\{environment}\`);
            process.exit(0);

        })
        .catch(error => {
            console.log(error);
            process.exit(0);
        })
}

function writeReactEnv(env) {
    return new Promise((resolve, reject) => {
        const template = \`export default {
    env:"$\{env.env}",
    api:"$\{env.api}",
};\`;

        fs.writeFile(\`${es6 === true ? "${__dirname}/" : "${__dirname}/../"}src/env.js\`, template, error => {
            if (error) {
                return reject(error);
            }

            resolve(true);
        })
    });
}

function getEnv() {
    const args = process.argv;
    let next   = false;
    let givenEnv = null;

    for (var i=0, length = args.length; i<length; i++) {
        if (args[i].indexOf('setEnv.js') !== -1) {
            next = true;
            continue;
        }

        if (next === true) {
            givenEnv = args[i];
            break;
        }
    }

    return givenEnv;
}
`
}
