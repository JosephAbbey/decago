const { readFileSync } = require('fs');
const ts = require('typescript');
const _eval = require('eval');

module.exports = function extract(file, operations, compilerOptions) {
    return new Promise((resolve, reject) => {
        const data = _eval(
            ts.transpile(
                operations(readFileSync(file).toString()),
                compilerOptions
            ),
            true
        );
        resolve(data);
    });
};
