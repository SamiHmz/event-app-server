const { modeSponsoring } = require("./config/magic_strings");

module.exports = (sequelize, DataTypes) => {
  var Sponsoring = sequelize.define(
    "sponsoring",
    {
      dossier: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      montant: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isNumeric: true,
          notEmpty: true,
        },
      },
      cv: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          isIn: modeSponsoring,
        },
      },
    },
    {
      freezeTableName: true,
    }
  );

  return Sponsoring;
};
