module.exports = (sequelize, DataTypes) => {
  var EvenementJournaliste = sequelize.define(
    "evenement_journaliste",
    {
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

  return EvenementJournaliste;
};
