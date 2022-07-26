import { sqlite } from '@decago/orm/providers';

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
                          //@ts-ignore
                          select.where[key]
                      }`
              )
              .join(' AND ')
        : '',
    select?.orderBy
        ? 'ORDER BY ' +
          Object.keys(select.orderBy)
              .map(
                  (key) =>
                      `${key} ${
                          //@ts-ignore
                          select.orderBy[key]
                      }`
              )
              .join(', ')
        : 'ORDER BY (SELECT NULL)',
    `LIMIT (${select?.take || defaultTake})`,
    `OFFSET (${select?.skip || defaultSkip})`,
];

export class Post {
    static create(
        db: sqlite.Database,
        _id: number | undefined,
        _title: string,
        _content: string,
        _createdAt: Date | undefined,
        _updatedAt: Date | undefined,
        _authorId: number
    ) {
        return new PostPromise((resolve, reject) =>
            db.run(
                `INSERT INTO Post (${["id", "title", "content", "createdAt", "updatedAt", "authorId"].filter((_, i) => Boolean([_id, _title, _content, _createdAt, _updatedAt, _authorId][i])).join(', ')}) VALUES (${["id", "title", "content", "createdAt", "updatedAt", "authorId"].filter((_, i) => Boolean([_id, _title, _content, _createdAt, _updatedAt, _authorId][i])).map(() => "?").join(', ')})`,
                [_id, _title, _content, _createdAt, _updatedAt, _authorId].filter((v) => Boolean(v)),
                (error) =>
                    error
                        ? reject(error)
                        : db.get(
                              'SELECT * FROM Post WHERE id = (SELECT last_insert_rowid())',
                              (error, row) =>
                                  error
                                      ? reject(error)
                                      : resolve(
                                            new Post(
                                                db,
                                                row.id,
                                                row.title,
                                                row.content,
                                                row.createdAt,
                                                row.updatedAt,
                                                row.authorId
                                            )
                                        )
                          )
            )
        );
    }

    private promises: Promise<undefined>[] = [];
    save = () => Promise.all(this.promises);

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
                (error, result) => {
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

    delete = () => new Promise<void>(
        (resolve, reject) =>
            this.db.run(
                'DELETE FROM User WHERE id = ?',
                [this._id],
                (error) =>
                    error ? reject(error) : resolve()
            )
    );
}

export class PostPromise extends Promise<Post> {
    author = () =>
        new UserPromise((resolve, reject) => {
            this.then((post) => resolve(post.author()));
            this.catch((error) => reject(error));
        });

    delete = () => this.then((post) => post.delete());
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

    delete = () => this.then((posts) => Promise.all(posts.map((post) => post.delete())));
}

export class User {
    static create(
        db: sqlite.Database,
        _id: number | undefined,
        _name: string,
        _createdAt: Date | undefined,
        _updatedAt: Date | undefined
    ) {
        return new UserPromise((resolve, reject) =>
            db.run(
                `INSERT INTO User (${["id", "name", "createdAt", "updatedAt"].filter((_, i) => Boolean([_id, _name, _createdAt, _updatedAt][i])).join(', ')}) VALUES (${["id", "name", "createdAt", "updatedAt"].filter((_, i) => Boolean([_id, _name, _createdAt, _updatedAt][i])).map(() => "?").join(', ')})`,
                [_id, _name, _createdAt, _updatedAt].filter((v) => Boolean(v)),
                (error) =>
                    error
                        ? reject(error)
                        : db.get(
                              'SELECT * FROM User WHERE id = (SELECT last_insert_rowid())',
                              (error, row) =>
                                  error
                                      ? reject(error)
                                      : resolve(
                                            new User(
                                                db,
                                                row.id,
                                                row.name,
                                                row.createdAt,
                                                row.updatedAt
                                            )
                                        )
                          )
            )
        );
    }

    private promises: Promise<undefined>[] = [];
    save = () => Promise.all(this.promises);

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

    posts = (select?: Select<Post>) => {
        select = select || {};
        select.where = select.where || {};
        select.where.authorId = this._id;
        return new PostsPromise((resolve, reject) => {
            this.db.all(
                'SELECT * FROM Post ' + doSelect(select).join(' '),
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
    };

    delete = () => new Promise<void>(
        (resolve, reject) =>
            this.db.run(
                'DELETE FROM User WHERE id = ?',
                [this._id],
                (error) =>
                    error ? reject(error) : resolve()
            )
    );
}

export class UserPromise extends Promise<User> {
    posts: (select?: Select<Post>) => PostsPromise = (...args) =>
        new PostsPromise((resolve, reject) => {
            this.then((user) => resolve(user.posts(...args)));
            this.catch((error) => reject(error));
        });

    delete = () => this.then((user) => user.delete());
}

export class UsersPromise extends Promise<User[]> {
    posts: (select?: Select<Post>) => PostsPromise = (...args) =>
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

    delete = () => this.then((users) => Promise.all(users.map((user) => user.delete())));
}

export class DB {
    public db: sqlite.Database = new sqlite.Database('C:\\Users\\Joseph\\code\\javascript\\decago\\packages\\decago-orm\\test\\db\\data.sqlite');
    Posts = (select?: Select<Post>) =>
        new PostsPromise((resolve, reject) => {
            this.db.all(
                'SELECT * FROM Post ' + doSelect(select).join(' '),
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
    Users = (select?: Select<User>) =>
        new UsersPromise((resolve, reject) => {
            this.db.all(
                'SELECT * FROM User ' + doSelect(select).join(' '),
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
