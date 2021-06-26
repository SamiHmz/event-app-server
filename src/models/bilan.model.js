module.exports = (sequelize, DataTypes) => {
  var Bilan = sequelize.define(
    "bilan",
    {
      article: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      ppt_presentation: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      participants_intern: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isNumeric: true,
          notEmpty: true,
        },
      },
      participants_extern: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isNumeric: true,
          notEmpty: true,
        },
      },
      problem: DataTypes.STRING,
    },
    {
      freezeTableName: true,
    }
  );
  Bilan.associate = (dbModels) => {
    Bilan.hasMany(dbModels.bilan_photo, { foreignKey: "bilan_id" });
    Bilan.belongsTo(dbModels.evenement, { foreignKey: "evenement_id" });
  };

  return Bilan;
};
