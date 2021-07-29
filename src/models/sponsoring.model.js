const { modeSponsoring, etat } = require("./config/magic_strings");
const etatSponsoring = Object.values(etat);
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
        validate: {
          isNumeric: true,
          notEmpty: true,
        },
      },
      sponsor: {
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
          isIn: [modeSponsoring],
        },
      },
      etat: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: etat.ATENTE,
        validate: {
          notEmpty: true,
          isIn: [etatSponsoring],
        },
      },
      etat_simple: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: etat.ATENTE,
        validate: {
          notEmpty: true,
          isIn: [etatSponsoring],
        },
      },
      is_opened: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        validate: {
          notEmpty: true,
        },
      },
    },
    {
      freezeTableName: true,
    }
  );

  Sponsoring.associate = (dbModels) => {
    Sponsoring.hasMany(dbModels.validation_sponsoring, {
      foreignKey: "sponsoring_id",
    });
    Sponsoring.belongsTo(dbModels.evenement, {
      foreignKey: "evenement_id",
    });
  };

  return Sponsoring;
};
