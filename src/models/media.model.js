module.exports = (sequelize, DataTypes) => {
  var Media = sequelize.define(
    "media",
    {
      designation: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      redacteur: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
          isEmail: true,
        },
      },
      telephone: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isNumeric: true,
          notEmpty: true,
        },
      },
      website: DataTypes.STRING,
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          isIn: ["tv", "radio", "journal", "journal", "jouranl en ligne"],
        },
      },
      langue: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          isIn: ["tv", "radio", "journal", "journal", "jouranl en ligne"],
        },
      },
    },
    { timestamps: false, freezeTableName: true }
  );

  return Media;
};
