var state = require("./config/constant");
module.exports = (sequelize, DataTypes) => {
  var Evenement = sequelize.define(
    "evenement",
    {
      titre: {
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
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      objectifs: {
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
          isIn: [["en attente", "approuvé", "rejetè"]],
        },
      },
    },
    {
      freezeTableName: true,
    }
  );

  Evenement.associate = (dbModels) => {
    Evenement.hasOne(dbModels.bilan, { foreignKey: "evenement_id" });
    Evenement.hasMany(dbModels.validation_evenement, {
      foreignKey: "evenement_id",
    });
    Evenement.hasMany(dbModels.sponsoring, { foreignKey: "evenement_id" });
    Evenement.hasMany(dbModels.intervenant, { foreignKey: "evenement_id" });
    Evenement.belongsTo(dbModels.type_evenement, {
      foreignKey: "type_event_id",
    });
    Evenement.belongsToMany(dbModels.journaliste, {
      through: dbModels.evenement_journaliste,
      foreignKey: "evenement_id",
    });
  };

  return Evenement;
};
