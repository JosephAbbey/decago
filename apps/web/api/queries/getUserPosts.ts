import { t } from '@decago/object-definition';
import db from '../../db';

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
    input: t.infer<typeof getUserPostsInput>
): Promise<t.infer<typeof getUserPostsOutput>> {
    return (
        await db.Users({
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
                short_content: post.content.substring(0, 100) + '...',
                authorId: post.authorId,
            }))
        );
}
