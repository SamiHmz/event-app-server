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
          isIn: [["admin", "simple"]],
        },
      },
    },
    { timestamps: false, freezeTableName: true }
  );

  Initiateur.associate = (dbModels) => {
    Initiateur.belongsTo(dbModels.type_initiateur, {
      foreignKey: "type_id",
    });
    Initiateur.hasMany(dbModels.evenement, {
      foreignKey: "initiateur_id",
    });
  };

  return Initiateur;
};
