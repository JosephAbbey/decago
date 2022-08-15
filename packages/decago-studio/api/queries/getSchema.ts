import { t } from '@decago/object-definition';

function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export const getSchemaInput = new t.Model('getSchemaInput', {});

export const getSchemaOutput = t.listOf(
    new t.Model('getSchemaOutputTable', {
        name: t.string(),
        columns: t.listOf(
            new t.Model('getSchemaOutputColumn', {
                name: t.string(),
                type: t.string(),
                nullable: t.boolean(),
                id: t.boolean(),
                unique: t.boolean(),
            })
        ),
    })
);

export default function getSchema(
    input: t.infer<typeof getSchemaInput>,
    context: {
        db: any;
        schema: {
            [key: string]: t.Model<{
                [key: string]: t.Type;
            }>;
        };
    }
): Promise<t.infer<typeof getSchemaOutput>> {
    return Promise.all(
        Object.keys(context.schema)
            .filter((tableName) => tableName !== 'default')
            .map(async (tableName) => {
                const table = context.schema[tableName];
                return {
                    name: tableName,
                    columns: await Promise.all(
                        Object.keys(table.schema)
                            .filter(
                                (columnName) =>
                                    !(
                                        table.schema[columnName] instanceof
                                        t.List
                                    )
                            )
                            .map(async (columnName) => {
                                var column = table.schema[columnName];
                                if (column instanceof t.ModelPromise)
                                    column = await column.model;
                                var identifierName =
                                    column instanceof t.Model
                                        ? Object.keys(column.schema).find(
                                              (key) =>
                                                  Boolean(
                                                      //@ts-expect-error
                                                      column.schema[key]._id
                                                  )
                                          )!
                                        : undefined;
                                //TODO: fix this
                                var identifierType =
                                    column instanceof t.Model
                                        ? column.schema[
                                              identifierName!
                                          ] instanceof t.ModelPromise
                                            ? (
                                                  await column.schema[
                                                      identifierName!
                                                      //@ts-expect-error
                                                  ].model
                                              ).type
                                            : column.schema[identifierName!] //@ts-expect-error
                                                  .type
                                        : undefined;
                                return column instanceof t.Model
                                    ? {
                                          name:
                                              columnName +
                                              capitalizeFirstLetter(
                                                  identifierName!
                                              ),
                                          //@ts-expect-error
                                          type: {
                                              int: 'number',
                                              float: 'number',
                                              string: 'string',
                                              date: 'dateTime',
                                              boolean: 'boolean',
                                          }[identifierType!],
                                          //@ts-expect-error
                                          nullable: Boolean(column._nullable),
                                          //@ts-expect-error
                                          id: Boolean(column._id),
                                          //@ts-expect-error
                                          unique: Boolean(column._unique),
                                      }
                                    : {
                                          name: columnName,
                                          type:
                                              column instanceof t.Object
                                                  ? {
                                                        int: 'number',
                                                        float: 'number',
                                                        string: 'string',
                                                        date: 'dateTime',
                                                        boolean: 'boolean',
                                                    }[column.type]
                                                  : column instanceof t.List
                                                  ? 'array'
                                                  : 'unknown',
                                          //@ts-expect-error
                                          nullable: Boolean(column._nullable),
                                          //@ts-expect-error
                                          id: Boolean(column._id),
                                          //@ts-expect-error
                                          unique: Boolean(column._unique),
                                      };
                            })
                    ),
                };
            })
    );
}
