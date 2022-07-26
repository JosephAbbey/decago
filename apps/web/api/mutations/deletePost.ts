import { t } from '@decago/object-definition';
import db from '../../db';

export const deletePostInput = new t.Model('deletePostInput', {
    id: t.int(),
});

export const deletePostOutput = new t.Model('deletePostOutput', {});

export default async function deletePost(
    input: t.infer<typeof deletePostInput>
): Promise<t.infer<typeof deletePostOutput>> {
    await db
        .Posts({
            where: {
                id: input.id,
            },
            take: 1,
        })
        .delete();

    return {};
}
