import extract from '@decago/typescript-extractor';
import { dirname, join, resolve } from 'path';

const project = 'C:\\Users\\Joseph\\code\\javascript\\decago\\apps\\web';

const db: Promise<any> = extract(
    join(project, './db/generated/index.ts'),
    (data) =>
        data.replaceAll(
            '@decago/orm/providers',
            resolve(
                '.' +
                    dirname(
                        require.resolve('@decago/orm/package.json')
                    ).substring(5) +
                    '/providers.js'
            ).replaceAll('\\', '/')
        ),
    {
        target: 99,
        module: 199,
        moduleResolution: 2,
        strict: true,
    }
).then((module) => {
    return module.default;
});

export default db;

export const schema: Promise<any> = extract(
    join(project, './db/schema.ts'),
    (data) =>
        data.replaceAll(
            '@decago/object-definition',
            resolve(
                '.' +
                    dirname(
                        require.resolve(
                            '@decago/object-definition/package.json'
                        )
                    ).substring(5) +
                    '/index.js'
            ).replaceAll('\\', '/')
        )
);
