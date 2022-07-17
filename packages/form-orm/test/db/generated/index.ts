import { sqlite } from 'form-orm/providers';
import { Database } from 'sqlite3';

const defaultSkip = 0;
const defaultTake = 10;

export interface Select<T> {
    where?: {
        [key in keyof T]?: T[key] extends Function ? undefined : T[key];
    };
    orderBy?: {
        [key in keyof T]?: T[key] extends Function ? undefined : 'ASC' | 'DESC';
    };
    skip?: number;
    take?: number;
}

const doSelect = <T>(select: Select<T> | undefined) => [
    select?.where
        ? 'WHERE ' +
          Object.keys(select.where)
              .map(
                  (key) =>
                      `${key} = ${
                          //@ts-expect-error
                          select.where[key]
                      }`
              )
              .join(' AND ')
        : '',
    'SKIP ' + select?.skip || defaultSkip,
    'TAKE ' + select?.take || defaultTake,
    select?.orderBy
        ? 'ODER BY ' +
          Object.keys(select.orderBy)
              .map(
                  (key) =>
                      `${key} ${
                          //@ts-expect-error
                          select.orderBy[key]
                      }`
              )
              .join(', ')
        : '',
];

export class User {
    constructor(
        private db: Database,
        public id: number,
        public name: string,
        public createdAt: Date,
        public updatedAt: Date
    ) {}

    posts = (select?: Select<Post>) => {
        select?.where?.['authorId']
            ? (select.where['authorId'] = this.id)
            : null;
        return new PostsPromise((resolve, reject) => {
            this.db.all(
                `SELECT * FROM Post ? ? ? ?`,
                doSelect(select),
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(
                            rows.map(
                                (row) =>
                                    new Post(
                                        this.db,
                                        row.id,
                                        row.title,
                                        row.content,
                                        this.id,
                                        row.createdAt,
                                        row.updatedAt
                                    )
                            )
                        );
                    }
                }
            );
        });
    };
}

export class UserPromise extends Promise<User> {
    posts: (select: Select<Post>) => PostsPromise = (...args) =>
        new PostsPromise((resolve, reject) => {
            this.then((user) => resolve(user.posts(...args)));
            this.catch((error) => reject(error));
        });
}

export class UsersPromise extends Promise<User[]> {
    posts: (select: Select<Post>) => PostsPromise = (...args) =>
        new PostsPromise((resolve, reject) => {
            this.then((users) =>
                resolve(
                    Promise.all(
                        users.flatMap(async (user) => await user.posts(...args))
                    ).then((posts) => posts.flat())
                )
            );
            this.catch((error) => reject(error));
        });
}

export class Post {
    constructor(
        private db: Database,
        public id: number,
        public title: string,
        public content: string,
        public authorId: number,
        public createdAt: Date,
        public updatedAt: Date
    ) {}

    author = () =>
        new UserPromise((resolve, reject) =>
            this.db.get(
                'SELECT * FROM User WHERE id = ?',
                [this.authorId],
                (error, result): void => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(
                            new User(
                                this.db,
                                result.id,
                                result.name,
                                result.createdAt,
                                result.updatedAt
                            )
                        );
                    }
                }
            )
        );
}
export class PostPromise extends Promise<Post> {
    author = () =>
        new UserPromise((resolve, reject) => {
            this.then((post) => resolve(post.author()));
            this.catch((error) => reject(error));
        });
}

export class PostsPromise extends Promise<Post[]> {
    author = () =>
        new UsersPromise((resolve, reject) => {
            this.then((posts) =>
                resolve(
                    Promise.all(posts.flatMap((post) => post.author())).then(
                        (users) => users.flat()
                    )
                )
            );
            this.catch((error) => reject(error));
        });
}

export class DB {
    private db = new sqlite.Database('../data.sqlite');
    Users = (select: Select<User>) =>
        new UsersPromise((resolve, reject) => {
            this.db.all(
                `SELECT * FROM User ? ? ? ?`,
                doSelect(select),
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(
                            rows.map(
                                (row) =>
                                    new User(
                                        this.db,
                                        row.id,
                                        row.name,
                                        row.createdAt,
                                        row.updatedAt
                                    )
                            )
                        );
                    }
                }
            );
        });
    Posts = (select: Select<Post>) =>
        new PostsPromise((resolve, reject) => {
            this.db.all(
                `SELECT * FROM Post ? ? ? ?`,
                doSelect(select),
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(
                            rows.map(
                                (row) =>
                                    new Post(
                                        this.db,
                                        row.id,
                                        row.title,
                                        row.content,
                                        row.authorId,
                                        row.createdAt,
                                        row.updatedAt
                                    )
                            )
                        );
                    }
                }
            );
        });
    constructor() {}
}

export default new DB();
