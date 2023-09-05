import { DataTypes } from "sequelize";

export function editDataModel(seq) {
  const EditData = seq.define("EditData", {
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
    EditString: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ""
    }
  });

  return EditData;
}
