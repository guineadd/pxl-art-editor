import { DataTypes } from "sequelize";

export function characterModel(seq) {
  const Character = seq.define("Character", {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    FontId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Fonts",
        key: "Id"
      }
    },
    Html: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ""
    }
  });

  return Character;
}
