var { etat } = require("./config/magic_strings");
const etatIntervenant = Object.values(etat);
module.exports = (sequelize, DataTypes) => {
  var IntervenantValidation = sequelize.define(
    "validation_intervenant",
    {
      decision_admin_simple: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: etat.ATENTE,
        validate: {
          notEmpty: true,
          isIn: [etatIntervenant],
        },
      },
      details_decision_admin_simple: {
        type: DataTypes.STRING,
      },
      decision_admin: {
        type: DataTypes.STRING,
        defaultValue: etat.ATENTE,
        allowNull: false,
        validate: {
          notEmpty: true,
          isIn: [etatIntervenant],
        },
      },
      details_decision_admin: {
        type: DataTypes.STRING,
      },
      decision_super_admin: {
        type: DataTypes.STRING,
        defaultValue: etat.ATENTE,
        allowNull: false,
        validate: {
          notEmpty: true,
          isIn: [etatIntervenant],
        },
      },
      details_super_admin: {
        type: DataTypes.STRING,
      },
    },
    {
      freezeTableName: true,
    }
  );

  IntervenantValidation.associate = (dbModels) => {
    IntervenantValidation.belongsTo(dbModels.intervenant, {
      foreignKey: "intervenant_id",
    });
  };

  return IntervenantValidation;
};
