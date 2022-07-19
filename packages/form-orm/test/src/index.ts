import db, { User } from '../db/generated';

console.log(db);

User.create(db.db, undefined, 'John Doe', undefined, undefined);
