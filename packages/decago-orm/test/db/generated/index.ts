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

const doSelect = <T>(
    db: sqlite.Database,
    table: string,
    select: Select<T> | undefined,
    callback: (err: Error, rows: any[]) => void
) => {
    const params = [];
    const command = [
        `${
            select?.where
                ? 'WHERE ' +
                  Object.keys(select.where)
                      .map((key) => {
                          params.push(select.where[key]);
                          return `${key} = ?`;
                      })
                      .join(' AND ')
                : ''
        } ${
            select?.orderBy
                ? 'ORDER BY ' +
                  Object.keys(select.orderBy)
                      .map((key) => {
                          params.push(select.orderBy[key]);
                          return `${key} ?`;
                      })
                      .join(', ')
                : 'ORDER BY (SELECT NULL)'
        } LIMIT ? OFFSET ?`,
    ];
    params.push(select?.take ?? defaultTake, select?.skip ?? defaultSkip);
    db.all(`SELECT * FROM ${table} ${command}`, params, callback);
};

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
                                                new Date(row.createdAt),
                                                new Date(row.updatedAt),
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
                                new Date(result.createdAt),
                                new Date(result.updatedAt)
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
            this.then((__User) => resolve(__User.author()));
            this.catch((error) => reject(error));
        });

    delete = () => this.then((__Post) => __Post.delete());
}

export class PostsPromise extends Promise<Post[]> {
    author = () => 
        new UsersPromise((resolve, reject) => {
            this.then((__Posts) =>
                resolve(
                    Promise.all(__Posts.flatMap((__User) => __User.author())).then(
                        (__Users) => __Users.flat()
                    )
                )
            );
            this.catch((error) => reject(error));
        });

    delete = () => this.then((__Posts) => Promise.all(__Posts.map((__Post) => __Post.delete())));
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
                                                new Date(row.createdAt),
                                                new Date(row.updatedAt)
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
            doSelect(
                this.db,
                'Post',
                select,
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
                                        new Date(row.createdAt),
                                        new Date(row.updatedAt),
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
            this.then((__Post) => resolve(__Post.posts(...args)));
            this.catch((error) => reject(error));
        });

    delete = () => this.then((__User) => __User.delete());
}

export class UsersPromise extends Promise<User[]> {
    posts: (select?: Select<Post>) => PostsPromise = (...args) =>
        new PostsPromise((resolve, reject) => {
            this.then((__Users) =>
                resolve(
                    Promise.all(__Users.flatMap(async (__Post) => await __Post.posts(...args))).then(
                        (__Posts) => __Posts.flat()
                    )
                )
            );
            this.catch((error) => reject(error));
        });

    delete = () => this.then((__Users) => Promise.all(__Users.map((__User) => __User.delete())));
}

export class DB {
    public db: sqlite.Database = new sqlite.Database('C:\\Users\\Joseph\\code\\javascript\\decago\\packages\\decago-orm\\test\\db\\data.sqlite');
    Posts = (select?: Select<Post>) =>
        new PostsPromise((resolve, reject) => {
            doSelect(
                this.db,
                'Post',
                select,
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
                                        new Date(row.createdAt),
                                        new Date(row.updatedAt),
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
            doSelect(
                this.db,
                'User',
                select,
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
                                        new Date(row.createdAt),
                                        new Date(row.updatedAt)
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
