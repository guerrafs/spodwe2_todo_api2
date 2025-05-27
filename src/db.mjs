import { DatabaseSync } from "node:sqlite";

const database = new DatabaseSync("todo.db", (err) => {
  if (err) {
    console.error("Error opening database " + err.message);
  } else {
    console.log("Connected to the SQLite database.");
  }
});

database.exec("PRAGMA foreign_keys = ON");
database.exec("PRAGMA journal_mode = WAL");
database.exec("PRAGMA synchronous = NORMAL");
database.exec("PRAGMA cache_size = 10000");

const createUsersTable = `CREATE TABLE IF NOT EXISTS USERS (
  id TEXT NOT NULL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
)`;

const createTodosTable = `CREATE TABLE IF NOT EXISTS TODOS (
  id TEXT NOT NULL PRIMARY KEY,
  text TEXT NOT NULL,
  done BOOLEAN NOT NULL DEFAULT 0,
  userId TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES USERS(id) ON DELETE CASCADE
)`;

database.exec(createUsersTable, (err) => {
  if (err) {
    console.error("Error creating USERS table: " + err.message);
  }
});

database.exec(createTodosTable, (err) => {
  if (err) {
    console.error("Error creating TODOS table: " + err.message);
  }
});

const insertUser = database.prepare(
  "INSERT INTO USERS (id, username, password) VALUES ($id, $username, $password) RETURNING id, username"
);

const getUser = database.prepare(
  `SELECT id, username, password FROM USERS WHERE username = $username`
);

const insertTodo = database.prepare(
  "INSERT INTO TODOS (id, text, done, userId) VALUES ($id, $text, 0, $userId) RETURNING id, text, done, userId"
);
const updateTodo = database.prepare(
  "UPDATE TODOS SET text = $text, done = $done WHERE id = $id AND userId = $userId RETURNING id, text, done, userId"
);
const getTodo = database.prepare(
  `SELECT id, text, done, userId FROM TODOS WHERE id = $id AND userId = $userId`
);
const getAllTodos = database.prepare(`SELECT id, text, done, userId FROM TODOS WHERE userId = $userId`);

export { database, insertTodo, updateTodo, getTodo, getAllTodos, insertUser, getUser };