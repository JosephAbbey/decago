import { t } from '@decago/object-definition';
import { DB } from '../../db';

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
        authorName: t.string(),
        authorEmail: t.string(),
        createdAt: t.date(),
        updatedAt: t.date(),
    })
);

export default async function getPosts(
    input: t.infer<typeof getPostsInput>,
    context: { db: DB }
): Promise<t.infer<typeof getPostsOutput>> {
    const posts = context.db.Posts({
        take: input.take,
        skip: input.skip,
    });

    const authors = posts.author();

    return Promise.all([posts, authors]).then(([posts, authors]) =>
        posts.map((post, index) => ({
            id: post.id,
            title: post.title,
            short_content:
                post.content.substring(0, 100) +
                (post.content.length > 100 ? '...' : ''),
            authorId: post.authorId,
            authorName: authors[index].name,
            authorEmail: authors[index].email,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
        }))
    );
}
