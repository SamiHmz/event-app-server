var { modeEvenement, typeEvenement, etat } = require("./config/magic_strings");
const etatEvenement = Object.values(etat);

module.exports = (sequelize, DataTypes) => {
  var Evenement = sequelize.define(
    "evenement",
    {
      intitulé: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      lieu: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      programe: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      objectifs: {
        type: DataTypes.TEXT,
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
          isIn: [etatEvenement],
        },
      },
      debut: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      fin: {
        type: DataTypes.DATE,
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
          isIn: [typeEvenement],
        },
      },
      mode: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          isIn: [modeEvenement],
        },
      },
      is_opened: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      is_happened: {
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

  Evenement.associate = (dbModels) => {
    Evenement.hasMany(dbModels.bilan, { foreignKey: "evenement_id" });
    Evenement.hasMany(dbModels.validation_evenement, {
      foreignKey: "evenement_id",
    });
    Evenement.belongsTo(dbModels.initiateur, {
      foreignKey: "initiateur_id",
    });
    Evenement.hasMany(dbModels.sponsoring, { foreignKey: "evenement_id" });
    Evenement.hasMany(dbModels.intervenant, { foreignKey: "evenement_id" });
  };

  return Evenement;
};
