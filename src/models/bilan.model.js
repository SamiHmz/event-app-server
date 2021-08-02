var { etat } = require("./config/magic_strings");
const etatBilan = Object.values(etat);

module.exports = (sequelize, DataTypes) => {
  var Bilan = sequelize.define(
    "bilan",
    {
      article: {
        type: DataTypes.TEXT,
      },
      ppt_presentation: {
        type: DataTypes.STRING,
      },
      participants_intern: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isNumeric: true,
          notEmpty: true,
        },
      },
      participants_extern: {
        type: DataTypes.STRING,
      },
      etat: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: etat.ATENTE,
        validate: {
          notEmpty: true,
          isIn: [etatBilan],
        },
      },
      problem: DataTypes.TEXT,
    },
    {
      freezeTableName: true,
    }
  );
  Bilan.associate = (dbModels) => {
    Bilan.hasMany(dbModels.bilan_photo, { foreignKey: "bilan_id" });
    Bilan.belongsTo(dbModels.evenement, { foreignKey: "evenement_id" });
  };

  return Bilan;
};
