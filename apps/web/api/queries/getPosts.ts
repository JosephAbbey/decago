import { t } from '@decago/object-definition';
import db from '../../db';

export const getPostsInput = new t.Model('getPostsInput', {
    take: t.int(),
    skip: t.int(),
});

export const getPostsOutput = t.listOf(
    new t.Model('getPostsOutputItem', {
        id: t.int(),
        title: t.string(),
        short_content: t.string(),
        authorId: t.int(),
    })
);

export default async function getPosts(
    input: t.infer<typeof getPostsInput>
): Promise<t.infer<typeof getPostsOutput>> {
    return db
        .Posts({
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
