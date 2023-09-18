import { DataTypes } from "sequelize";

export function collectionModel(seq) {
  const Collection = seq.define("Collection", {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    CollectionName: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ""
    }
  });

  return Collection;
}
