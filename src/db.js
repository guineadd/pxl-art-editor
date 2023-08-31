import sqlite3 from "sqlite3";

export const db = new sqlite3.Database("src/database.db");

db.run(`
  CREATE TABLE IF NOT EXISTS data_table (
    draw TEXT,
    edit TEXT
  )
`);
