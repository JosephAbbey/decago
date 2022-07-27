import { autoincremental, now, t } from '@decago/object-definition';

const config = {
    type: 'sqlite',
    source: './data.sqlite',
};

export const Post = new t.Model('Post', {
    id: t.int().id().default(autoincremental),
    title: t.string(),
    content: t.string(),
    author: t.ForwardDeclaration('User'),
    createdAt: t.date().default(now),
    updatedAt: t.date().default(now),
});

export const User = new t.Model('User', {
    id: t.int().id().default(autoincremental),
    name: t.string().unique(),
    email: t.string().unique(),
    posts: t.listOf(Post),
    createdAt: t.date().default(now),
    updatedAt: t.date().default(now),
});

export default config;
