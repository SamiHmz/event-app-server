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
          isIn: ["en attente", "approuvé", "rejetè"],
        },
      },
    },
    {
      freezeTableName: true,
    }
  );

  return SponsoringValidation;
};
