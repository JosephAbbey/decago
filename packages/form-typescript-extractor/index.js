const tempy = import('tempy');
const { readFileSync, writeFileSync } = require('fs');
const ts = require('typescript');
const { inspect } = require('util');

module.exports = function extract(file, operations) {
    return new Promise((resolve, reject) => {
        tempy.then(({ temporaryFileTask }) => {
            temporaryFileTask(async (p) => {
                writeFileSync(
                    p,
                    ts.transpile(operations(readFileSync(file).toString()))
                );
                const data = require(p);
                console.log(`data:\n${inspect(data, undefined, 20, true)}\n`);
                resolve(data);
            });
        });
    });
};
