import { t } from '@decago/object-definition';
import { User, DB } from '../../db';

export const createUserInput = new t.Model('createUserInput', {
    name: t.string(),
    email: t.string(),
});

export const createUserOutput = new t.Model('createUserOutput', {
    id: t.int(),
    name: t.string(),
    email: t.string(),
    createdAt: t.date(),
    updatedAt: t.date(),
});

export default async function createUser(
    input: t.infer<typeof createUserInput>,
    context: { db: DB }
): Promise<t.infer<typeof createUserOutput>> {
    const user = await User.create(
        context.db.db,
        undefined,
        input.name,
        input.email,
        undefined,
        undefined
    );
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}
