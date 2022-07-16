PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS Post(
    id int NOT NULL PRIMARY KEY,
    title text NOT NULL,
    content text NOT NULL,
    authorId int NOT NULL,
    createdAt date NOT NULL,
    updatedAt date NOT NULL,
    FOREIGN KEY(authorId) REFERENCES User(id)
);

CREATE TABLE IF NOT EXISTS User(
    id int NOT NULL PRIMARY KEY,
    name text NOT NULL,
    createdAt date NOT NULL,
    updatedAt date NOT NULL
);
