import { Sequelize } from "sequelize";
import { collectionModel } from "./models/collection.js";
import { characterModel } from "./models/character.js";
import { hexDataModel } from "./models/hexData.js";
import { editDataModel } from "./models/editData.js";

export const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "src/database.sqlite"
});

const Collection = collectionModel(sequelize);
const Character = characterModel(sequelize);
const HexData = hexDataModel(sequelize);
const EditData = editDataModel(sequelize);

Collection.hasMany(Character);
Character.belongsTo(Collection);
Character.hasOne(HexData);
Character.hasOne(EditData);

import sqlite3 from "sqlite3";

export const db = new sqlite3.Database("src/database.db");

db.run(`
  CREATE TABLE IF NOT EXISTS Font (
    draw TEXT,
    edit TEXT
  )
`);
