import { sqlite } from 'form-orm/providers';

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

export class Post {
    constructor(
        private db: sqlite.Database,
        private _id: number,
        private _title: string,
        private _content: string,
        private _createdAt: Date,
        private _updatedAt: Date,
        private _authorId: number
    ) {}

    get id(): number {
        return this._id;
    }
    set id(value: number) {
        this._id = value;
        this.db.run('UPDATE Post SET id = ? WHERE id = ?', value, this._id);
    }

    get title(): string {
        return this._title;
    }
    set title(value: string) {
        this._title = value;
        this.db.run('UPDATE Post SET title = ? WHERE id = ?', value, this._id);
    }

    get content(): string {
        return this._content;
    }
    set content(value: string) {
        this._content = value;
        this.db.run('UPDATE Post SET content = ? WHERE id = ?', value, this._id);
    }

    get createdAt(): Date {
        return this._createdAt;
    }
    set createdAt(value: Date) {
        this._createdAt = value;
        this.db.run('UPDATE Post SET createdAt = ? WHERE id = ?', value, this._id);
    }

    get updatedAt(): Date {
        return this._updatedAt;
    }
    set updatedAt(value: Date) {
        this._updatedAt = value;
        this.db.run('UPDATE Post SET updatedAt = ? WHERE id = ?', value, this._id);
    }

    get authorId(): number {
        return this._authorId;
    }
    set authorId(value: number) {
        this._authorId = value;
        this.db.run('UPDATE Post SET authorId = ? WHERE id = ?', value, this._id);
    }

    author = () =>
        new UserPromise((resolve, reject) =>
            this.db.get(
                'SELECT * FROM User WHERE id = ?',
                [this._authorId],
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

export class User {
    constructor(
        private db: sqlite.Database,
        private _id: number,
        private _name: string,
        private _createdAt: Date,
        private _updatedAt: Date
    ) {}

    get id(): number {
        return this._id;
    }
    set id(value: number) {
        this._id = value;
        this.db.run('UPDATE User SET id = ? WHERE id = ?', value, this._id);
    }

    get name(): string {
        return this._name;
    }
    set name(value: string) {
        this._name = value;
        this.db.run('UPDATE User SET name = ? WHERE id = ?', value, this._id);
    }

    get createdAt(): Date {
        return this._createdAt;
    }
    set createdAt(value: Date) {
        this._createdAt = value;
        this.db.run('UPDATE User SET createdAt = ? WHERE id = ?', value, this._id);
    }

    get updatedAt(): Date {
        return this._updatedAt;
    }
    set updatedAt(value: Date) {
        this._updatedAt = value;
        this.db.run('UPDATE User SET updatedAt = ? WHERE id = ?', value, this._id);
    }

    posts(select?: Select<Post>) {
        select = select || {};
        select.where = select.where || {};
        select.where.authorId = this._id;
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
                                        row.createdAt,
                                        row.updatedAt,
                                        this._id
                                    )
                            )
                        );
                    }
                }
            );
        });
    }
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

export class DB {
    private db: sqlite.Database = new sqlite.Database('C:\\Users\\Joseph\\code\\javascript\\form\\packages\\form-orm\\test\\db\\data.sqlite');
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
                                        row.createdAt,
                                        row.updatedAt,
                                        row.authorId
                                    )
                            )
                        );
                    }
                }
            );
        });
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
    constructor() {}
}

export default new DB();
