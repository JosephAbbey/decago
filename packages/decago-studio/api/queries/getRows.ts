import { t } from '@decago/object-definition';

export default async function getRows(
    input: {
        model: string | undefined;
        select?: {
            where?: {
                [key: string]: any;
            };
            orderBy?: {
                [key: string]: 'asc' | 'desc';
            };
            take?: number;
            skip?: number;
        };
    },
    context: {
        db: any;
        schema: {
            [key: string]: t.Model<{
                [key: string]: t.Type;
            }>;
        };
    }
): Promise<any[]> {
    if (typeof input.model === 'undefined') return [];
    //@ts-expect-error
    return (await context.db[input.model + 's'](input.select)).map((row) =>
        Object.fromEntries(
            Object.keys(row)
                .filter((key) => !(row[key] instanceof Function))
                .map((key) => [key.substring(1), row[key]])
        )
    );
}
