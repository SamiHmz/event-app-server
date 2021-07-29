const { etat } = require("./config/magic_strings");
const etatSponsoring = Object.values(etat);
module.exports = (sequelize, DataTypes) => {
  var ValidationSponsoring = sequelize.define(
    "validation_sponsoring",
    {
      details: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      etat: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          isIn: [etatSponsoring],
        },
      },
    },
    {
      freezeTableName: true,
    }
  );

  ValidationSponsoring.associate = (dbModels) => {
    ValidationSponsoring.belongsTo(dbModels.sponsoring, {
      foreignKey: "sponsoring_id",
    });
    ValidationSponsoring.belongsTo(dbModels.administrateur, {
      foreignKey: "administrateur_id",
    });
  };

  return ValidationSponsoring;
};
