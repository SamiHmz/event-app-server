module.exports = (sequelize, DataTypes) => {
  var TypeInitiateur = sequelize.define(
    "type_initiateur",
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
  {
  }

  return TypeInitiateur;
};
