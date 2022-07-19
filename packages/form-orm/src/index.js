const tempy = import('tempy');
const { readFileSync, writeFileSync } = require('fs');
const ts = require('typescript');
const { resolve, normalize } = require('path');
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

                const source = normalize(
                    resolve('./db/schema.ts', '../', data.default.source)
                ).replaceAll('\\', '\\\\');
                console.log(`source: ${source}\n`);

                const typescript = {
                    int: 'number',
                    float: 'number',
                    string: 'string',
                    date: 'Date',
                    boolean: 'boolean',
                };

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
                          //@ts-ignore
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
                          //@ts-ignore
                          select.orderBy[key]
                      }\`
              )
              .join(', ')
        : '',
];

`;

                    //TODO: add model classes and promises and db class

                    for (const m in data) {
                        const model = data[m];
                        if (!(model instanceof f.Model)) continue;
                        generated += `export class ${model.name} {
    static create(
        db: sqlite.Database${Object.keys(model.schema)
            .filter(
                (key) =>
                    !(
                        model.schema[key] instanceof f.List ||
                        model.schema[key] instanceof f.Model ||
                        model.schema[key] instanceof f.ModelPromise
                    )
            )
            .map(
                (key) =>
                    `,\n        _${key}: ${typescript[model.schema[key].type]}`
            )
            .join('')}${Object.keys(model.schema)
                            .filter(
                                (key) =>
                                    model.schema[key] instanceof f.Model ||
                                    model.schema[key] instanceof f.ModelPromise
                            )
                            .map((key) => {
                                const identifier_name = Object.keys(
                                    data[model.schema[key].name].schema
                                )[
                                    Object.values(
                                        data[model.schema[key].name].schema
                                    ).findIndex((value) => value._id)
                                ];
                                return `,\n        _${key}${capitalizeFirstLetter(
                                    identifier_name
                                )}: ${
                                    typescript[
                                        data[model.schema[key].name].schema[
                                            identifier_name
                                        ].type
                                    ]
                                }`;
                            })
                            .join('')}
    ) {
        return new ${model.name}Promise((resolve, reject) => db.run(
            'INSERT INTO ${model.name} (${Object.keys(model.schema)
                            .filter(
                                (key) =>
                                    !(
                                        model.schema[key] instanceof f.List ||
                                        model.schema[key] instanceof f.Model ||
                                        model.schema[key] instanceof
                                            f.ModelPromise
                                    )
                            )
                            .join(', ')}${Object.keys(model.schema)
                            .filter(
                                (key) =>
                                    model.schema[key] instanceof f.Model ||
                                    model.schema[key] instanceof f.ModelPromise
                            )
                            .map((key) => {
                                const identifier_name = Object.keys(
                                    data[model.schema[key].name].schema
                                )[
                                    Object.values(
                                        data[model.schema[key].name].schema
                                    ).findIndex((value) => value._id)
                                ];
                                return `, ${key}${capitalizeFirstLetter(
                                    identifier_name
                                )}`;
                            })
                            .join('')}) VALUES (${Object.keys(model.schema)
                            .filter(
                                (key) => !(model.schema[key] instanceof f.List)
                            )
                            .map(() => '?')
                            .join(', ')})',
            [${Object.keys(model.schema)
                .filter(
                    (key) =>
                        !(
                            model.schema[key] instanceof f.List ||
                            model.schema[key] instanceof f.Model ||
                            model.schema[key] instanceof f.ModelPromise
                        )
                )
                .map((key) => `_${key}`)
                .join(', ')}${Object.keys(model.schema)
                            .filter(
                                (key) =>
                                    model.schema[key] instanceof f.Model ||
                                    model.schema[key] instanceof f.ModelPromise
                            )
                            .map((key) => {
                                const identifier_name = Object.keys(
                                    data[model.schema[key].name].schema
                                )[
                                    Object.values(
                                        data[model.schema[key].name].schema
                                    ).findIndex((value) => value._id)
                                ];
                                return `, _${key}${capitalizeFirstLetter(
                                    identifier_name
                                )}`;
                            })
                            .join('')}],
            (error) => error ? reject(error) : resolve(new ${
                model.name
            }(db${Object.keys(model.schema)
                            .filter(
                                (key) =>
                                    !(
                                        model.schema[key] instanceof f.List ||
                                        model.schema[key] instanceof f.Model ||
                                        model.schema[key] instanceof
                                            f.ModelPromise
                                    )
                            )
                            .map((key) => `, _${key}`)
                            .join('')}${Object.keys(model.schema)
                            .filter(
                                (key) =>
                                    model.schema[key] instanceof f.Model ||
                                    model.schema[key] instanceof f.ModelPromise
                            )
                            .map((key) => {
                                const identifier_name = Object.keys(
                                    data[model.schema[key].name].schema
                                )[
                                    Object.values(
                                        data[model.schema[key].name].schema
                                    ).findIndex((value) => value._id)
                                ];
                                return `, _${key}${capitalizeFirstLetter(
                                    identifier_name
                                )}`;
                            })
                            .join('')}))
        ));
    }

    constructor(
        private db: sqlite.Database${Object.keys(model.schema)
            .filter(
                (key) =>
                    !(
                        model.schema[key] instanceof f.List ||
                        model.schema[key] instanceof f.Model ||
                        model.schema[key] instanceof f.ModelPromise
                    )
            )
            .map(
                (key) =>
                    `,\n        private _${key}: ${
                        typescript[model.schema[key].type]
                    }`
            )
            .join('')}${Object.keys(model.schema)
                            .filter(
                                (key) =>
                                    model.schema[key] instanceof f.Model ||
                                    model.schema[key] instanceof f.ModelPromise
                            )
                            .map((key) => {
                                const identifier_name = Object.keys(
                                    data[model.schema[key].name].schema
                                )[
                                    Object.values(
                                        data[model.schema[key].name].schema
                                    ).findIndex((value) => value._id)
                                ];
                                return `,\n        private _${key}${capitalizeFirstLetter(
                                    identifier_name
                                )}: ${
                                    typescript[
                                        data[model.schema[key].name].schema[
                                            identifier_name
                                        ].type
                                    ]
                                }`;
                            })
                            .join('')}
    ) {}
    
${Object.keys(model.schema)
    .filter(
        (key) =>
            !(
                model.schema[key] instanceof f.List ||
                model.schema[key] instanceof f.Model ||
                model.schema[key] instanceof f.ModelPromise
            )
    )
    .map((key) => {
        const id = Object.keys(model.schema)[
            Object.values(model.schema).findIndex((value) => value._id)
        ];
        return `    get ${key}(): ${typescript[model.schema[key].type]} {
        return this._${key};
    }
    set ${key}(value: ${typescript[model.schema[key].type]}) {
        this._${key} = value;
        this.db.run('UPDATE ${
            model.name
        } SET ${key} = ? WHERE ${id} = ?', value, this._${id});
    }`;
    })
    .join('\n\n')}${Object.keys(model.schema)
                            .filter(
                                (key) =>
                                    model.schema[key] instanceof f.Model ||
                                    model.schema[key] instanceof f.ModelPromise
                            )
                            .map((key) => {
                                const id = Object.keys(model.schema)[
                                    Object.values(model.schema).findIndex(
                                        (value) => value._id
                                    )
                                ];
                                const identifier_name = capitalizeFirstLetter(
                                    Object.keys(
                                        data[model.schema[key].name].schema
                                    )[
                                        Object.values(
                                            data[model.schema[key].name].schema
                                        ).findIndex((value) => value._id)
                                    ]
                                );
                                return `\n\n    get ${key}${identifier_name}(): ${
                                    typescript[
                                        data[model.schema[key].name].schema[
                                            Object.keys(
                                                data[model.schema[key].name]
                                                    .schema
                                            )[
                                                Object.values(
                                                    data[model.schema[key].name]
                                                        .schema
                                                ).findIndex(
                                                    (value) => value._id
                                                )
                                            ]
                                        ].type
                                    ]
                                } {
        return this._${key}${identifier_name};
    }
    set ${key}${identifier_name}(value: ${
                                    typescript[
                                        data[model.schema[key].name].schema[
                                            Object.keys(
                                                data[model.schema[key].name]
                                                    .schema
                                            )[
                                                Object.values(
                                                    data[model.schema[key].name]
                                                        .schema
                                                ).findIndex(
                                                    (value) => value._id
                                                )
                                            ]
                                        ].type
                                    ]
                                }) {
        this._${key}${identifier_name} = value;
        this.db.run('UPDATE ${
            model.name
        } SET ${key}${identifier_name} = ? WHERE ${id} = ?', value, this._${id});
    }`;
                            })
                            .join('')}${Object.keys(model.schema)
                            .filter(
                                (key) =>
                                    model.schema[key] instanceof f.Model ||
                                    model.schema[key] instanceof f.ModelPromise
                            )
                            .map(
                                (key) => `\n\n    ${key} = () =>
        new ${model.schema[key].name}Promise((resolve, reject) =>
            this.db.get(
                'SELECT * FROM ${model.schema[key].name} WHERE id = ?',
                [this._${key}${capitalizeFirstLetter(
                                    Object.keys(
                                        data[model.schema[key].name].schema
                                    )[
                                        Object.values(
                                            data[model.schema[key].name].schema
                                        ).findIndex((value) => value._id)
                                    ]
                                )}],
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(
                            new ${model.schema[key].name}(
                                this.db${Object.keys(
                                    data[model.schema[key].name].schema
                                )
                                    .filter(
                                        (k) =>
                                            !(
                                                data[model.schema[key].name]
                                                    .schema[k] instanceof
                                                    f.List ||
                                                data[model.schema[key].name]
                                                    .schema[k] instanceof
                                                    f.Model ||
                                                data[model.schema[key].name]
                                                    .schema[k] instanceof
                                                    f.ModelPromise
                                            )
                                    )
                                    .map(
                                        (key) =>
                                            `,\n                                result.${key}`
                                    )
                                    .join('')}${Object.keys(
                                    data[model.schema[key].name].schema
                                )
                                    .filter(
                                        (k) =>
                                            data[model.schema[key].name].schema[
                                                k
                                            ] instanceof f.Model ||
                                            data[model.schema[key].name].schema[
                                                k
                                            ] instanceof f.ModelPromise
                                    )
                                    .map((k) => {
                                        const identifier_name = Object.keys(
                                            data[
                                                data[model.schema[key].name]
                                                    .schema[k].name
                                            ].schema
                                        )[
                                            Object.values(
                                                data[
                                                    data[model.schema[key].name]
                                                        .schema[k].name
                                                ].schema
                                            ).findIndex((value) => value._id)
                                        ];
                                        return `,\n                                result.${key}${capitalizeFirstLetter(
                                            identifier_name
                                        )}`;
                                    })
                                    .join('')}
                            )
                        );
                    }
                }
            )
        );`
                            )}${Object.keys(model.schema)
                            .filter(
                                (key) => model.schema[key] instanceof f.List
                            )
                            .map(
                                (key) =>
                                    `\n\n    ${key} = (select?: Select<${
                                        model.schema[key].of.name
                                    }>) => {
        select = select || {};
        select.where = select.where || {};
        select.where.authorId = this._id;
        return new ${model.schema[key].of.name}sPromise((resolve, reject) => {
            this.db.all(
                \`SELECT * FROM ${model.schema[key].of.name} ? ? ? ?\`,
                doSelect(select),
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(
                            rows.map(
                                (row) =>
                                    new ${model.schema[key].of.name}(
                                        this.db${Object.keys(
                                            data[model.schema[key].of.name]
                                                .schema
                                        )
                                            .filter(
                                                (k) =>
                                                    !(
                                                        data[
                                                            model.schema[key].of
                                                                .name
                                                        ].schema[k] instanceof
                                                            f.List ||
                                                        data[
                                                            model.schema[key].of
                                                                .name
                                                        ].schema[k] instanceof
                                                            f.Model ||
                                                        data[
                                                            model.schema[key].of
                                                                .name
                                                        ].schema[k] instanceof
                                                            f.ModelPromise
                                                    )
                                            )
                                            .map(
                                                (key) =>
                                                    `,\n                                        row.${key}`
                                            )
                                            .join('')}${Object.keys(
                                        data[model.schema[key].of.name].schema
                                    )
                                        .filter(
                                            (k) =>
                                                data[model.schema[key].of.name]
                                                    .schema[k] instanceof
                                                    f.Model ||
                                                data[model.schema[key].of.name]
                                                    .schema[k] instanceof
                                                    f.ModelPromise
                                        )
                                        .map((k) => {
                                            const identifier_name = Object.keys(
                                                data[
                                                    data[
                                                        model.schema[key].of
                                                            .name
                                                    ].schema[k].name
                                                ].schema
                                            )[
                                                Object.values(
                                                    data[
                                                        data[
                                                            model.schema[key].of
                                                                .name
                                                        ].schema[k].name
                                                    ].schema
                                                ).findIndex(
                                                    (value) => value._id
                                                )
                                            ];
                                            return `,\n                                        row.${k}${capitalizeFirstLetter(
                                                identifier_name
                                            )}`;
                                        })
                                        .join('')}
                                    )
                            )
                        );
                    }
                }
            );
        });
    };`
                            )}
}

export class ${model.name}Promise extends Promise<${model.name}> {${Object.keys(
                            model.schema
                        )
                            .filter(
                                (key) =>
                                    model.schema[key] instanceof f.Model ||
                                    model.schema[key] instanceof f.ModelPromise
                            )
                            .map(
                                (key) =>
                                    `\n    ${key} = () => 
        new ${model.schema[key].name}Promise((resolve, reject) => {
            this.then((__${model.schema[key].name}) => resolve(__${model.schema[key].name}.${key}()));
            this.catch((error) => reject(error));
        });`
                            )}${Object.keys(model.schema)
                            .filter(
                                (key) => model.schema[key] instanceof f.List
                            )
                            .map(
                                (key) =>
                                    `\n    ${key}: (select: Select<${model.schema[key].of.name}>) => ${model.schema[key].of.name}sPromise = (...args) =>
        new ${model.schema[key].of.name}sPromise((resolve, reject) => {
            this.then((__${model.schema[key].of.name}) => resolve(__${model.schema[key].of.name}.${key}(...args)));
            this.catch((error) => reject(error));
        });`
                            )}
}

export class ${model.name}sPromise extends Promise<${
                            model.name
                        }[]> {${Object.keys(model.schema)
                            .filter(
                                (key) =>
                                    model.schema[key] instanceof f.Model ||
                                    model.schema[key] instanceof f.ModelPromise
                            )
                            .map(
                                (key) =>
                                    `\n    ${key} = () => 
        new ${model.schema[key].name}sPromise((resolve, reject) => {
            this.then((__${model.name}s) =>
                resolve(
                    Promise.all(__${model.name}s.flatMap((__${model.schema[key].name}) => __${model.schema[key].name}.${key}())).then(
                        (__${model.schema[key].name}s) => __${model.schema[key].name}s.flat()
                    )
                )
            );
            this.catch((error) => reject(error));
        });`
                            )}${Object.keys(model.schema)
                            .filter(
                                (key) => model.schema[key] instanceof f.List
                            )
                            .map(
                                (key) =>
                                    `\n    ${key}: (select: Select<${model.schema[key].of.name}>) => ${model.schema[key].of.name}sPromise = (...args) =>
        new ${model.schema[key].of.name}sPromise((resolve, reject) => {
            this.then((__${model.name}s) =>
                resolve(
                    Promise.all(__${model.name}s.flatMap(async (__${model.schema[key].of.name}) => await __${model.schema[key].of.name}.${key}(...args))).then(
                        (__${model.schema[key].of.name}s) => __${model.schema[key].of.name}s.flat()
                    )
                )
            );
            this.catch((error) => reject(error));
        });`
                            )}
}

`;
                    }

                    generated += `export class DB {
    private db: sqlite.Database = new sqlite.Database('${source}');
${Object.keys(data)
    .filter((key) => key !== 'default')
    .map((key) => {
        return `    ${key}s = (select: Select<${key}>) =>
        new ${key}sPromise((resolve, reject) => {
            this.db.all(
                \`SELECT * FROM ${key} ? ? ? ?\`,
                doSelect(select),
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(
                            rows.map(
                                (row) =>
                                    new ${key}(
                                        this.db${Object.keys(data[key].schema)
                                            .filter(
                                                (k) =>
                                                    !(
                                                        data[key].schema[
                                                            k
                                                        ] instanceof f.List ||
                                                        data[key].schema[
                                                            k
                                                        ] instanceof f.Model ||
                                                        data[key].schema[
                                                            k
                                                        ] instanceof
                                                            f.ModelPromise
                                                    )
                                            )
                                            .map(
                                                (k) =>
                                                    `,\n                                        row.${k}`
                                            )
                                            .join('')}${Object.keys(
            data[key].schema
        )
            .filter(
                (k) =>
                    data[key].schema[k] instanceof f.Model ||
                    data[key].schema[k] instanceof f.ModelPromise
            )
            .map(
                (k) =>
                    `,\n                                        row.${k}${capitalizeFirstLetter(
                        Object.keys(data[data[key].schema[k].name].schema)[
                            Object.values(
                                data[data[key].schema[k].name].schema
                            ).findIndex((value) => value._id)
                        ]
                    )}`
            )
            .join('')}
                                    )
                            )
                        );
                    }
                }
            );
        });`;
    })
    .join('\n')}
    constructor() {}
}`;

                    generated += '\n\nexport default new DB();\n';
                    console.log(
                        'ts:',
                        highlight('\n' + generated, { language: 'typescript' })
                    );

                    writeFileSync('./db/generated/index.ts', generated);
                }
            },
            { extension: 'js' }
        );
    });
};
