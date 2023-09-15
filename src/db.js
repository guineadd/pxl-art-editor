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
