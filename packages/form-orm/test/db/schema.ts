import { autoincremental, now, f } from 'form-orm';

export default {
    type: 'sqlite',
    source: './data.sqlite',
};

export const Post = new f.Model('Post', {
    id: f.int().id().default(autoincremental),
    title: f.string(),
    content: f.string(),
    author: f.ForwardDeclaration('User'),
    createdAt: f.date().default(now),
    updatedAt: f.date().default(now),
});

export const User = new f.Model('User', {
    id: f.int().id().default(autoincremental),
    name: f.string(),
    posts: f.listOf(Post),
    createdAt: f.date().default(now),
    updatedAt: f.date().default(now),
});
