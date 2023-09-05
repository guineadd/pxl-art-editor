import { DataTypes } from "sequelize";

export function hexDataModel(seq) {
  const HexData = seq.define("HexData", {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    CharacterId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Characters",
        key: "Id"
      }
    },
    Width: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    Height: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    DataString: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ""
    }
  });

  return HexData;
}
