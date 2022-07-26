import { t } from '@decago/object-definition';
import db, { User } from '../../db';

export const createUserInput = new t.Model('createUserInput', {
    name: t.string(),
});

export const createUserOutput = new t.Model('createUserOutput', {
    id: t.int(),
    name: t.string(),
    createdAt: t.date(),
    updatedAt: t.date(),
});

export default async function createPost(
    input: t.infer<typeof createUserInput>
): Promise<t.infer<typeof createUserOutput>> {
    const user = await User.create(
        db.db,
        undefined,
        input.name,
        undefined,
        undefined
    );
    return {
        id: user.id,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}
