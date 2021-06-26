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
          isIn: [["en attente", "approuvé", "rejetè"]],
        },
      },
    },
    {
      freezeTableName: true,
    }
  );

  return EventValidation;
};
