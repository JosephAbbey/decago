const tempy = import('tempy');
const { readFileSync, writeFileSync } = require('fs');
const ts = require('typescript');

module.exports = function extract(file, operations, compilerOptions) {
    return new Promise((resolve, reject) => {
        tempy.then(({ temporaryFileTask }) => {
            temporaryFileTask(async (p) => {
                writeFileSync(
                    p,
                    ts.transpile(
                        operations(readFileSync(file).toString()),
                        compilerOptions
                    )
                );
                const data = require(p);
                resolve(data);
            });
        });
    });
};
