var { etat } = require("./config/magic_strings");
const etatEvenement = Object.values(etat);
module.exports = (sequelize, DataTypes) => {
  var EventValidation = sequelize.define(
    "validation_evenement",
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
          isIn: [etatEvenement],
        },
      },
    },
    {
      freezeTableName: true,
    }
  );

  return EventValidation;
};
