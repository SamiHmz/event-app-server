module.exports = (sequelize, DataTypes) => {
  var NotificationInitiateur = sequelize.define(
    "notification_initiateur",
    {
      details: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      lien: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      is_viewed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        validate: {
          notEmpty: true,
        },
      },
      is_clicked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
    },
    {
      freezeTableName: true,
    }
  );

  NotificationInitiateur.associate = (dbModels) => {
    NotificationInitiateur.belongsTo(dbModels.initiateur, {
      foreignKey: "initiateur_id",
    });
    NotificationInitiateur.belongsTo(dbModels.administrateur, {
      foreignKey: "creator_id",
    });
  };

  return NotificationInitiateur;
};
