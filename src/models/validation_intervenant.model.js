var { etat } = require("./config/magic_strings");
const etatIntervenant = Object.values(etat);
module.exports = (sequelize, DataTypes) => {
  var IntervenantValidation = sequelize.define(
    "validation_intervenant",
    {
      details: {
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
          isIn: [etatIntervenant],
        },
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
    IntervenantValidation.belongsTo(dbModels.administrateur, {
      foreignKey: "administrateur_id",
    });
  };

  return IntervenantValidation;
};
