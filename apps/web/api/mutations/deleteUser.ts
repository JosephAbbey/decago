import { t } from '@decago/object-definition';
import db from '../../db';

export const deleteUserInput = new t.Model('deleteUserInput', {
    id: t.int(),
});

export const deleteUserOutput = new t.Model('deleteUserOutput', {});

export default async function getUser(
    input: t.infer<typeof deleteUserInput>
): Promise<t.infer<typeof deleteUserOutput>> {
    await db
        .Users({
            where: {
                id: input.id,
            },
            take: 1,
        })
        .delete();

    return {};
}
