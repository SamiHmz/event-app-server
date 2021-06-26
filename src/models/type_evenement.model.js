module.exports = (sequelize, DataTypes) => {
  var TypeEvenement = sequelize.define(
    "type_evenement",
    {
      designation: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
    },
    { timestamps: false, freezeTableName: true }
  );

  TypeEvenement.associate = (dbModels) => {};
  return TypeEvenement;
};
