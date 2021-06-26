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
        unique: true,
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
          isIn: ["homme", "femme"],
        },
      },
      telephone: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
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
        validate: {
          notEmpty: true,
          isIn: ["en attente", "approuvé", "rejetè"],
        },
      },
    },
    {
      freezeTableName: true,
    }
  );

  return Intervenant;
};
