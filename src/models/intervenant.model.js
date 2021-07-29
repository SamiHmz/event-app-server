const { sexe, etat, typeIntervenant } = require("./config/magic_strings");
const etatIntervenant = Object.values(etat);
const typeIntervenantValues = Object.values(typeIntervenant);

module.exports = (sequelize, DataTypes) => {
  var Intervenant = sequelize.define(
    "intervenant",
    {
      nom: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      prenom: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          isEmail: true,
        },
      },
      sexe: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          isIn: [sexe],
        },
      },
      telephone: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isNumeric: true,
          notEmpty: true,
        },
      },
      photo: DataTypes.STRING,
      cv: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      etat: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: etat.ATENTE,
        validate: {
          notEmpty: true,
          isIn: [etatIntervenant],
        },
      },
      etat_simple: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: etat.ATENTE,
        validate: {
          notEmpty: true,
          isIn: [etatIntervenant],
        },
      },
      etat_admin: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: etat.ATENTE,
        validate: {
          notEmpty: true,
          isIn: [etatIntervenant],
        },
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: etat.ATENTE,
        validate: {
          notEmpty: true,
          isIn: [typeIntervenantValues],
        },
      },
      is_opened: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
    },
    {
      freezeTableName: true,
    }
  );

  Intervenant.associate = (dbModels) => {
    Intervenant.hasMany(dbModels.validation_intervenant, {
      foreignKey: "intervenant_id",
    });
    Intervenant.belongsTo(dbModels.evenement, {
      foreignKey: "evenement_id",
    });
  };

  return Intervenant;
};
