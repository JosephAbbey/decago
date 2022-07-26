import { t } from '@decago/object-definition';
import db from '../../db';

export const updatePostInput = new t.Model('updatePostInput', {
    id: t.int(),
    title: t.string().nullable(),
    content: t.string().nullable(),
    authorId: t.int().nullable(),
});

export const updatePostOutput = new t.Model('updatePostOutput', {
    id: t.int(),
    title: t.string(),
    content: t.string(),
    authorId: t.int(),
    createdAt: t.date(),
    updatedAt: t.date(),
});

export default async function updatePost(
    input: t.infer<typeof updatePostInput>
): Promise<t.infer<typeof updatePostOutput>> {
    const post = (
        await db.Posts({
            where: {
                id: input.id,
            },
            take: 1,
        })
    )[0];

    if (input.title) post.title = input.title;
    if (input.content) post.content = input.content;
    if (input.authorId) post.authorId = input.authorId;
    post.updatedAt = new Date();

    await post.save();

    return {
        id: post.id,
        title: post.title,
        content: post.content,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        authorId: post.authorId,
    };
}
