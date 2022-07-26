import { t } from '@decago/object-definition';
import db from '../../db';

export const updateUserInput = new t.Model('updateUserInput', {
    id: t.int(),
    name: t.string().nullable(),
});

export const updateUserOutput = new t.Model('updateUserOutput', {
    id: t.int(),
    name: t.string(),
    createdAt: t.date(),
    updatedAt: t.date(),
});

export default async function updateUser(
    input: t.infer<typeof updateUserInput>
): Promise<t.infer<typeof updateUserOutput>> {
    const user = (
        await db.Users({
            where: {
                id: input.id,
            },
            take: 1,
        })
    )[0];

    if (input.name) user.name = input.name;
    user.updatedAt = new Date();

    await user.save();

    return {
        id: user.id,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}
