module.exports = (sequelize, DataTypes) => {
  var Utilisateur = sequelize.define(
    "utilisateur",
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
          isIn: [["super admin", "admin", "simple"]],
        },
      },
    },
    { timestamps: false, freezeTableName: true }
  );

  return Utilisateur;
};
