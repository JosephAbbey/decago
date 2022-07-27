import { t } from '@decago/object-definition';
import { DB } from '../../db';

export const deletePostInput = new t.Model('deletePostInput', {
    id: t.int(),
});

export const deletePostOutput = new t.Model('deletePostOutput', {});

export default async function deletePost(
    input: t.infer<typeof deletePostInput>,
    context: { db: DB }
): Promise<t.infer<typeof deletePostOutput>> {
    await context.db
        .Posts({
            where: {
                id: input.id,
            },
            take: 1,
        })
        .delete();

    return {};
}
