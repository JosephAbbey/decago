import { t } from '@decago/object-definition';
import db from '../../db';

export const getPostInput = new t.Model('getPostInput', {
    id: t.int(),
});

export const getPostOutput = new t.Model('getPostOutput', {
    id: t.int(),
    title: t.string(),
    content: t.string(),
    authorId: t.int(),
    createdAt: t.date(),
    updatedAt: t.date(),
});

export default async function getUser(
    input: t.infer<typeof getPostInput>
): Promise<t.infer<typeof getPostOutput>> {
    const post = (
        await db.Posts({
            where: {
                id: input.id,
            },
            take: 1,
        })
    )[0];
    return {
        id: post.id,
        title: post.title,
        content: post.content,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        authorId: post.authorId,
    };
}
