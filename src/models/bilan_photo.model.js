module.exports = (sequelize, DataTypes) => {
  var BilanPhoto = sequelize.define(
    "bilan_photo",
    {
      lien: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isNumeric: true,
          notEmpty: true,
        },
      },
    },
    { freezeTableName: true }
  );
  return BilanPhoto;
};
