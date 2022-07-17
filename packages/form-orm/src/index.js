const tempy = import('tempy');
const { readFileSync, writeFileSync } = require('fs');
const ts = require('typescript');
const { resolve } = require('path');
const { inspect } = require('util');
const highlight = require('cli-highlight').highlight;
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
                        int: 'INTEGER',
                        float: 'FLOAT',
                        string: 'TEXT',
                        date: 'DATE',
                        boolean: 'BOOLEAN',
                    };

                    function serializeSqliteDefault(value, type) {
                        if (value instanceof Function) {
                            if (value.name === 'autoincremental')
                                return 'AUTOINCREMENT';
                            if (value.name === 'now')
                                return `DEFAULT CURRENT_TIMESTAMP`;
                            throw new Error(
                                `${value.name} is not a supported function`
                            );
                        } else {
                            if (type === 'int') return `DEFAULT ${value}`;
                            if (type === 'float') return `DEFAULT ${value}`;
                            if (type === 'string') return `DEFAULT '${value}'`;
                            if (type === 'boolean')
                                return value ? 'DEFAULT 1' : 'DEFAULT 0';
                            if (type === 'date')
                                return `'DEFAULT ${value.toISOString()}'`;
                            throw new Error(`${type} is not supported`);
                        }
                    }

                    const source = resolve(
                        './db/schema.ts',
                        '../',
                        data.default.source
                    );
                    console.log(`source: ${source}\n`);

                    var sql = 'PRAGMA foreign_keys = ON;\n\n';
                    for (const m in data) {
                        const model = data[m];
                        var foreign_keys = '';
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

                                foreign_keys += `    FOREIGN KEY(${field}${capitalizeFirstLetter(
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
                                }${
                                    fieldSchema._default === undefined
                                        ? ''
                                        : ' ' +
                                          serializeSqliteDefault(
                                              fieldSchema._default,
                                              fieldSchema.type
                                          )
                                },\n`;
                            }
                        }
                        sql += foreign_keys;
                        sql = sql.slice(0, -2);
                        sql += `\n);\n\n`;
                    }
                    sql = sql.slice(0, -1);
                    console.log(
                        'sql:',
                        highlight('\n' + sql, { language: 'sql' }),
                        '\n'
                    );

                    writeFileSync(resolve(source, '../init.sql'), sql);

                    writeFileSync(source, '');
                    const sqlite3 = require('sqlite3').verbose();
                    new sqlite3.Database(source).exec(sql).close();

                    var generated = `import { sqlite } from 'form-orm/providers';
import { Database } from 'sqlite3';

const defaultSkip = 0;
const defaultTake = 10;

export interface Select<T> {
    where?: {
        [key in keyof T]?: T[key] extends Function ? undefined : T[key];
    };
    orderBy?: {
        [key in keyof T]?: T[key] extends Function ? undefined : 'ASC' | 'DESC';
    };
    skip?: number;
    take?: number;
}

const doSelect = <T>(select: Select<T> | undefined) => [
    select?.where
        ? 'WHERE ' +
          Object.keys(select.where)
              .map(
                  (key) =>
                      \`\${key} = \${
                          //@ts-expect-error
                          select.where[key]
                      }\`
              )
              .join(' AND ')
        : '',
    'SKIP ' + select?.skip || defaultSkip,
    'TAKE ' + select?.take || defaultTake,
    select?.orderBy
        ? 'ODER BY ' +
          Object.keys(select.orderBy)
              .map(
                  (key) =>
                      \`\${key} \${
                          //@ts-expect-error
                          select.orderBy[key]
                      }\`
              )
              .join(', ')
        : '',
];

`;

                    //TODO: add model classes and promises and db class

                    generated += 'export default new DB();\n';
                    console.log(
                        'ts:',
                        highlight('\n' + generated, { language: 'typescript' })
                    );
                }
            },
            { extension: 'js' }
        );
    });
};
