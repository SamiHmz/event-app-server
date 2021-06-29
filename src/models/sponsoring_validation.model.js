const { etat } = require("./config/magic_strings");
const etatSponsoring = Object.values(etat);
module.exports = (sequelize, DataTypes) => {
  var SponsoringValidation = sequelize.define(
    "sponsoring_validation",
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
          isIn: [etatSponsoring],
        },
      },
    },
    {
      freezeTableName: true,
    }
  );

  return SponsoringValidation;
};
