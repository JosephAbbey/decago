const tempy = import('tempy');
const { readFileSync, writeFileSync } = require('fs');
const ts = require('typescript');
const { resolve } = require('path');
const { inspect } = require('util');
const { f } = require('..');

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = function main() {
    tempy.then(({ temporaryFileTask }) => {
        temporaryFileTask(
            async (path) => {
                writeFileSync(
                    path,
                    ts.transpile(
                        readFileSync('./db/schema.ts')
                            .toString()
                            .replaceAll(
                                'form-orm',
                                resolve(__dirname, '../index.js').replaceAll(
                                    '\\',
                                    '\\\\'
                                )
                            )
                    )
                );
                const data = require(path);
                console.log(`data:\n${inspect(data, undefined, 20, true)}\n`);
                if (data.default.type === 'sqlite') {
                    const sqlite = {
                        int: 'int',
                        float: 'float',
                        string: 'text',
                        date: 'date',
                        boolean: 'boolean',
                    };

                    const source = resolve(
                        './db/schema.ts',
                        '../',
                        data.default.source
                    );
                    console.log(`source: ${source}\n`);

                    var sql = 'PRAGMA foreign_keys = ON;\n\n';
                    for (const m in data) {
                        const model = data[m];
                        if (!(model instanceof f.Model)) continue;
                        sql += `CREATE TABLE IF NOT EXISTS ${model.name}(\n`;
                        for (const field in model.schema) {
                            var fieldSchema = model.schema[field];
                            if (
                                (fieldSchema instanceof f.Model) |
                                (fieldSchema instanceof f.ModelPromise)
                            ) {
                                if (fieldSchema instanceof f.ModelPromise)
                                    fieldSchema = await fieldSchema.model;
                                const identifier_name = Object.keys(
                                    data[fieldSchema.name].schema
                                )[
                                    Object.values(
                                        data[fieldSchema.name].schema
                                    ).findIndex((value) => value._id)
                                ];

                                sql += `    ${field}${capitalizeFirstLetter(
                                    identifier_name
                                )} ${
                                    data[fieldSchema.name].schema[
                                        identifier_name
                                    ].type
                                }${
                                    fieldSchema._nullable ? '' : ' NOT NULL'
                                },\n`;

                                sql += `    FOREIGN KEY(${field}${capitalizeFirstLetter(
                                    identifier_name
                                )}) REFERENCES ${
                                    fieldSchema.name
                                }(${identifier_name}),\n`;
                            } else if (fieldSchema instanceof f.List) {
                                if (
                                    [
                                        'int',
                                        'float',
                                        'string',
                                        'boolean',
                                        'date',
                                    ].includes(fieldSchema.of.type)
                                )
                                    throw new Error(
                                        `List of ${fieldSchema.of.type} is not supported`
                                    );
                            } else {
                                sql += `    ${field} ${
                                    sqlite[fieldSchema.type]
                                }${fieldSchema._nullable ? '' : ' NOT NULL'}${
                                    fieldSchema._id ? ' PRIMARY KEY' : ''
                                },\n`;
                            }
                        }
                        sql += `);\n\n`;
                    }
                    sql = sql.slice(0, -1);
                    console.log(`sql:\n${sql}`);

                    writeFileSync(resolve(source, '../init.sql'), sql);
                }
            },
            { extension: 'js' }
        );
    });
};
