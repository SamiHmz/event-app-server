module.exports = (sequelize, DataTypes) => {
  var NotificationAdministrateur = sequelize.define(
    "notification_administrateur",
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

  NotificationAdministrateur.associate = (dbModels) => {
    NotificationAdministrateur.belongsTo(dbModels.administrateur, {
      foreignKey: "administrateur_id",
    });
    NotificationAdministrateur.belongsTo(dbModels.initiateur, {
      foreignKey: "creator_id",
    });
  };

  return NotificationAdministrateur;
};
