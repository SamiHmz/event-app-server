module.exports = (sequelize, DataTypes) => {
  var Journaliste = sequelize.define(
    "journaliste",
    {
      nom: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      prenom: {
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
      sexe: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          isIn: ["homme", "femme"],
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
      photo: DataTypes.STRING,
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

  Journaliste.associate = (dbModels) => {
    Journaliste.belongsTo(dbModels.media, {
      foreignKey: "media_id",
    });
    Journaliste.belongsToMany(dbModels.evenement, {
      through: dbModels.evenement_journaliste,
      foreignKey: "journaliste_id",
    });
  };

  return Journaliste;
};
