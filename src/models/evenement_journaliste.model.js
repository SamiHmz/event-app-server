const { sexe, etat } = require("./config/magic_strings");
const etatvalidationJournaliste = Object.values(etat);
module.exports = (sequelize, DataTypes) => {
  var EvenementJournaliste = sequelize.define(
    "evenement_journaliste",
    {
      etat: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          isIn: [etatvalidationJournaliste],
        },
      },
    },
    {
      freezeTableName: true,
    }
  );

  return EvenementJournaliste;
};
