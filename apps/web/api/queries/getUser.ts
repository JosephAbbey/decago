import { t } from '@decago/object-definition';
import db from '../../db/generated';

export const getUserInput = new t.Model('getUserInput', {
    id: t.int(),
});

export const getUserOutput = new t.Model('getUserOutput', {
    id: t.int(),
    name: t.string(),
    createdAt: t.date(),
    updatedAt: t.date(),
});

export default async function getUser(
    input: t.infer<typeof getUserInput>
): Promise<t.infer<typeof getUserOutput>> {
    return (
        await db.Users({
            where: {
                id: input.id,
            },
        })
    )[0];
}
