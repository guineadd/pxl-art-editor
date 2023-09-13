import { DataTypes } from "sequelize";

export function characterModel(seq) {
  const Character = seq.define("Character", {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    CollectionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Collections",
        key: "Id"
      }
    },
    Width: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    Height: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    CharacterData: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ""
    }
  });

  return Character;
}
