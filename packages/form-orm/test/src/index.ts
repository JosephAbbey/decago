import db, { Post, User } from '../db/generated';

(async () => {
    console.log(db);

    const user1 = await User.create(
        db.db,
        undefined,
        'John Doe',
        undefined,
        undefined
    );

    const post1 = await Post.create(
        db.db,
        undefined,
        'Post 1',
        'This is a post.',
        undefined,
        undefined,
        user1.id
    );

    console.log(await post1.author());
    console.log(await user1.posts());
})();
