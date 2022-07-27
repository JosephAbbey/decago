import { t } from '@decago/object-definition';
import { DB } from '../../db';

export const getUsersInput = new t.Model('getUsersInput', {
    take: t.int(),
    skip: t.int(),
});

export const getUsersOutput = t.listOf(
    new t.Model('getUsersOutputItem', {
        id: t.int(),
        name: t.string(),
        email: t.string(),
        createdAt: t.date(),
        updatedAt: t.date(),
    })
);

export default async function getUsers(
    input: t.infer<typeof getUsersInput>,
    context: { db: DB }
): Promise<t.infer<typeof getUsersOutput>> {
    return context.db
        .Users({
            take: input.take,
            skip: input.skip,
        })
        .then((users) =>
            users.map((user) => ({
                id: user.id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            }))
        );
}
