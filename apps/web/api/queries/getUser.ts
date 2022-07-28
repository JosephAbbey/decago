import { t } from '@decago/object-definition';
import { DB } from '../../db';

export const getUserInput = new t.Model('getUserInput', {
    id: t.int().nullable(),
});

export const getUserOutput = new t.Model('getUserOutput', {
    id: t.int(),
    name: t.string(),
    email: t.string(),
    createdAt: t.date(),
    updatedAt: t.date(),
}).nullable();

export default async function getUser(
    input: t.infer<typeof getUserInput>,
    context: { db: DB }
): Promise<t.infer<typeof getUserOutput>> {
    if (input.id === null || typeof input.id === 'undefined') return undefined;
    const user = (
        await context.db.Users({
            where: {
                id: input.id,
            },
            take: 1,
        })
    )[0];
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}
