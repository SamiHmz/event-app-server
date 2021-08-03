var { typeInitiateur, roles } = require("./config/magic_strings");
const initiateurRoles = Object.values(roles);

module.exports = (sequelize, DataTypes) => {
  var Initiateur = sequelize.define(
    "initiateur",
    {
      nom: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      telephone: {
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
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          isIn: [typeInitiateur],
        },
      },
    },
    { timestamps: false, freezeTableName: true }
  );

  Initiateur.associate = (dbModels) => {
    Initiateur.hasMany(dbModels.evenement, {
      foreignKey: "initiateur_id",
    });
    Initiateur.hasMany(dbModels.notification_initiateur, {
      foreignKey: "initiateur_id",
    });
  };

  return Initiateur;
};
