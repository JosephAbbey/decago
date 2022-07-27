import { t } from '@decago/object-definition';
import { DB } from '../../db';

export const deleteUserInput = new t.Model('deleteUserInput', {
    id: t.int(),
});

export const deleteUserOutput = new t.Model('deleteUserOutput', {});

export default async function deleteUser(
    input: t.infer<typeof deleteUserInput>,
    context: { db: DB }
): Promise<t.infer<typeof deleteUserOutput>> {
    await context.db
        .Users({
            where: {
                id: input.id,
            },
            take: 1,
        })
        .delete();

    return {};
}
