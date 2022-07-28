import { t } from '@decago/object-definition';
import { DB } from '../../db';

export const getPostInput = new t.Model('getPostInput', {
    id: t.int().nullable(),
});

export const getPostOutput = new t.Model('getPostOutput', {
    id: t.int(),
    title: t.string(),
    content: t.string(),
    authorId: t.int(),
    authorName: t.string(),
    authorEmail: t.string(),
    createdAt: t.date(),
    updatedAt: t.date(),
}).nullable();

export default async function getPost(
    input: t.infer<typeof getPostInput>,
    context: { db: DB }
): Promise<t.infer<typeof getPostOutput>> {
    if (input.id === null || typeof input.id === 'undefined') return undefined;
    const post = (
        await context.db.Posts({
            where: {
                id: input.id,
            },
            take: 1,
        })
    )[0];
    const author = await post.author();

    return {
        id: post.id,
        title: post.title,
        content: post.content,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        authorId: post.authorId,
        authorName: author.name,
        authorEmail: author.email,
    };
}
