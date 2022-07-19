"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DB = exports.UsersPromise = exports.UserPromise = exports.User = exports.PostsPromise = exports.PostPromise = exports.Post = void 0;
const providers_1 = require("form-orm/providers");
const defaultSkip = 0;
const defaultTake = 10;
const doSelect = (select) => [
    select?.where
        ? 'WHERE ' +
            Object.keys(select.where)
                .map((key) => `${key} = ${
            //@ts-ignore
            select.where[key]}`)
                .join(' AND ')
        : '',
    'SKIP ' + select?.skip || defaultSkip,
    'TAKE ' + select?.take || defaultTake,
    select?.orderBy
        ? 'ODER BY ' +
            Object.keys(select.orderBy)
                .map((key) => `${key} ${
            //@ts-ignore
            select.orderBy[key]}`)
                .join(', ')
        : '',
];
class Post {
    db;
    _id;
    _title;
    _content;
    _createdAt;
    _updatedAt;
    _authorId;
    static create(db, _id, _title, _content, _createdAt, _updatedAt, _authorId) {
        return new PostPromise((resolve, reject) => db.get('INSERT INTO Post (id, title, content, createdAt, updatedAt, authorId) VALUES (?, ?, ?, ?, ?, ?); SELECT * FROM Post WHERE id = (SELECT last_insert_rowid())', [_id, _title, _content, _createdAt, _updatedAt, _authorId], (error, row) => error ? reject(error) : resolve(new Post(db, row.id, row.title, row.content, row.createdAt, row.updatedAt, row.authorId))));
    }
    constructor(db, _id, _title, _content, _createdAt, _updatedAt, _authorId) {
        this.db = db;
        this._id = _id;
        this._title = _title;
        this._content = _content;
        this._createdAt = _createdAt;
        this._updatedAt = _updatedAt;
        this._authorId = _authorId;
    }
    get id() {
        return this._id;
    }
    set id(value) {
        this._id = value;
        this.db.run('UPDATE Post SET id = ? WHERE id = ?', value, this._id);
    }
    get title() {
        return this._title;
    }
    set title(value) {
        this._title = value;
        this.db.run('UPDATE Post SET title = ? WHERE id = ?', value, this._id);
    }
    get content() {
        return this._content;
    }
    set content(value) {
        this._content = value;
        this.db.run('UPDATE Post SET content = ? WHERE id = ?', value, this._id);
    }
    get createdAt() {
        return this._createdAt;
    }
    set createdAt(value) {
        this._createdAt = value;
        this.db.run('UPDATE Post SET createdAt = ? WHERE id = ?', value, this._id);
    }
    get updatedAt() {
        return this._updatedAt;
    }
    set updatedAt(value) {
        this._updatedAt = value;
        this.db.run('UPDATE Post SET updatedAt = ? WHERE id = ?', value, this._id);
    }
    get authorId() {
        return this._authorId;
    }
    set authorId(value) {
        this._authorId = value;
        this.db.run('UPDATE Post SET authorId = ? WHERE id = ?', value, this._id);
    }
    author = () => new UserPromise((resolve, reject) => this.db.get('SELECT * FROM User WHERE id = ?', [this._authorId], (error, result) => {
        if (error) {
            reject(error);
        }
        else {
            resolve(new User(this.db, result.id, result.name, result.createdAt, result.updatedAt));
        }
    }));
}
exports.Post = Post;
class PostPromise extends Promise {
    author = () => new UserPromise((resolve, reject) => {
        this.then((__User) => resolve(__User.author()));
        this.catch((error) => reject(error));
    });
}
exports.PostPromise = PostPromise;
class PostsPromise extends Promise {
    author = () => new UsersPromise((resolve, reject) => {
        this.then((__Posts) => resolve(Promise.all(__Posts.flatMap((__User) => __User.author())).then((__Users) => __Users.flat())));
        this.catch((error) => reject(error));
    });
}
exports.PostsPromise = PostsPromise;
class User {
    db;
    _id;
    _name;
    _createdAt;
    _updatedAt;
    static create(db, _id, _name, _createdAt, _updatedAt) {
        return new UserPromise((resolve, reject) => db.get('INSERT INTO User (id, name, createdAt, updatedAt) VALUES (?, ?, ?, ?); SELECT * FROM User WHERE id = (SELECT last_insert_rowid())', [_id, _name, _createdAt, _updatedAt], (error, row) => error ? reject(error) : resolve(new User(db, row.id, row.name, row.createdAt, row.updatedAt))));
    }
    constructor(db, _id, _name, _createdAt, _updatedAt) {
        this.db = db;
        this._id = _id;
        this._name = _name;
        this._createdAt = _createdAt;
        this._updatedAt = _updatedAt;
    }
    get id() {
        return this._id;
    }
    set id(value) {
        this._id = value;
        this.db.run('UPDATE User SET id = ? WHERE id = ?', value, this._id);
    }
    get name() {
        return this._name;
    }
    set name(value) {
        this._name = value;
        this.db.run('UPDATE User SET name = ? WHERE id = ?', value, this._id);
    }
    get createdAt() {
        return this._createdAt;
    }
    set createdAt(value) {
        this._createdAt = value;
        this.db.run('UPDATE User SET createdAt = ? WHERE id = ?', value, this._id);
    }
    get updatedAt() {
        return this._updatedAt;
    }
    set updatedAt(value) {
        this._updatedAt = value;
        this.db.run('UPDATE User SET updatedAt = ? WHERE id = ?', value, this._id);
    }
    posts = (select) => {
        select = select || {};
        select.where = select.where || {};
        select.where.authorId = this._id;
        return new PostsPromise((resolve, reject) => {
            this.db.all(`SELECT * FROM Post ? ? ? ?`, doSelect(select), (err, rows) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(rows.map((row) => new Post(this.db, row.id, row.title, row.content, row.createdAt, row.updatedAt, row.authorId)));
                }
            });
        });
    };
}
exports.User = User;
class UserPromise extends Promise {
    posts = (...args) => new PostsPromise((resolve, reject) => {
        this.then((__Post) => resolve(__Post.posts(...args)));
        this.catch((error) => reject(error));
    });
}
exports.UserPromise = UserPromise;
class UsersPromise extends Promise {
    posts = (...args) => new PostsPromise((resolve, reject) => {
        this.then((__Users) => resolve(Promise.all(__Users.flatMap(async (__Post) => await __Post.posts(...args))).then((__Posts) => __Posts.flat())));
        this.catch((error) => reject(error));
    });
}
exports.UsersPromise = UsersPromise;
class DB {
    db = new providers_1.sqlite.Database('C:\\Users\\Joseph\\code\\javascript\\form\\packages\\form-orm\\test\\db\\data.sqlite');
    Posts = (select) => new PostsPromise((resolve, reject) => {
        this.db.all(`SELECT * FROM Post ? ? ? ?`, doSelect(select), (err, rows) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(rows.map((row) => new Post(this.db, row.id, row.title, row.content, row.createdAt, row.updatedAt, row.authorId)));
            }
        });
    });
    Users = (select) => new UsersPromise((resolve, reject) => {
        this.db.all(`SELECT * FROM User ? ? ? ?`, doSelect(select), (err, rows) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(rows.map((row) => new User(this.db, row.id, row.name, row.createdAt, row.updatedAt)));
            }
        });
    });
    constructor() { }
}
exports.DB = DB;
exports.default = new DB();
