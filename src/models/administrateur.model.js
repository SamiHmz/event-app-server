const { roles } = require("./config/magic_strings");
const adminRoles = Object.values(roles);
module.exports = (sequelize, DataTypes) => {
  var Administrateur = sequelize.define(
    "administrateur",
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
      numero: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          msg: "There is a user  already registres with this number",
        },
        validate: {
          isNumeric: true,
          notEmpty: true,
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          msg: "There is a user  already registres with this email",
        },
        validate: {
          notEmpty: true,
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      photo: DataTypes.STRING,
      role: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          isIn: [adminRoles],
        },
      },
    },
    { timestamps: false, freezeTableName: true }
  );

  Administrateur.associate = (dbModels) => {
    Administrateur.hasMany(dbModels.notification_administrateur, {
      foreignKey: "administrateur_id",
    });
  };
  return Administrateur;
};
