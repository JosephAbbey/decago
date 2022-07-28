import { t } from '@decago/object-definition';
import { DB } from '../../db';

export const createPostInput = new t.Model('createPostInput', {
    title: t.string(),
    content: t.string(),
    authorId: t.int(),
});

export const createPostOutput = new t.Model('createPostOutput', {
    id: t.int(),
    title: t.string(),
    content: t.string(),
    authorId: t.int(),
    createdAt: t.date(),
    updatedAt: t.date(),
});

export default async function createPost(
    input: t.infer<typeof createPostInput>,
    context: { db: DB }
): Promise<t.infer<typeof createPostOutput>> {
    const post = await context.db.Post.create(
        context.db.db,
        undefined,
        input.title,
        input.content,
        undefined,
        undefined,
        input.authorId
    );
    return {
        id: post.id,
        title: post.title,
        content: post.content,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        authorId: post.authorId,
    };
}
