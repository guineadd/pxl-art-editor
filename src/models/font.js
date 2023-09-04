import { DataTypes } from "sequelize";

export function fontModel(seq) {
  const Font = seq.define("Font", {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    FontName: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ""
    }
  });

  return Font;
}
