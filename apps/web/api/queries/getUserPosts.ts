import { t } from '@decago/object-definition';
import { DB } from '../../db';

export const getUserPostsInput = new t.Model('getUserPostsInput', {
    id: t.int(),
    take: t.int(),
    skip: t.int(),
});

export const getUserPostsOutput = t.listOf(
    new t.Model('getUserPostsOutputItem', {
        id: t.int(),
        title: t.string(),
        short_content: t.string(),
        authorId: t.int(),
    })
);

export default async function getUserPosts(
    input: t.infer<typeof getUserPostsInput>,
    context: { db: DB }
): Promise<t.infer<typeof getUserPostsOutput>> {
    return (
        await context.db.Users({
            where: {
                id: input.id,
            },
        })
    )[0]
        .posts({
            take: input.take,
            skip: input.skip,
        })
        .then((posts) =>
            posts.map((post) => ({
                id: post.id,
                title: post.title,
                short_content: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : ''),
                authorId: post.authorId,
            }))
        );
}
