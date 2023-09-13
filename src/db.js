import { Sequelize } from "sequelize";
import { collectionModel } from "./models/collection.js";
import { characterModel } from "./models/character.js";

export const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "src/database.sqlite"
});

const Collection = collectionModel(sequelize);
const Character = characterModel(sequelize);

Collection.hasMany(Character);
Character.belongsTo(Collection);

import sqlite3 from "sqlite3";

export const db = new sqlite3.Database("src/database.db");

db.run(`
  CREATE TABLE IF NOT EXISTS Font (
    draw TEXT,
    edit TEXT
  )
`);
