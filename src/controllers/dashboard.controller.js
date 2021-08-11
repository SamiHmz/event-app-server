const joi = require("joi");
const db = require("../models").dbModels;
const sequelize = require("../models");
const { Op } = require("sequelize");
const {
  typeEvenement,
  modeEvenement,
  etat,
  roles,
  typeUtilisateur,
} = require("../models/config/magic_strings");

const { validateId, generateSearchQuery } = require("./controllers.util");

const DashboardController = {};

DashboardController.getDashboadData = async (req, res) => {
  const { user } = req;
  if ((user.type = typeUtilisateur.INITIATEUR)) {
    var [nb_evenement] = await sequelize.query(`
      select count(id) as nb_evenement from evenement e
       where e.initiateur_id = ${user.id} 
        and e.is_happened=true
      `);

    var [total_sponsoring] = await sequelize.query(`
    select  sum(montant) as total_sponsoring from evenement e join sponsoring s 
    on  e.id = s.evenement_id 
    where e.is_happened = true 
    and e.initiateur_id = ${user.id} 
    and s.etat = 'approuvé'; `);
  }

  var [nb_intervenant] = await sequelize.query(`
    SELECT COUNT(i.id) as nb_intervenant FROM intervenant i JOIN evenement e
    ON e.id = i.evenement_id
    WHERE e.initiateur_id = ${user.id} 
    AND e.is_happened = true
    AND i.etat = 'approuvé'   
  `);

  //   var [nb_participant_externe] = await sequelize.query(
  //     ` SELECT SUM(b.participants_intern) ,SUM(b.participants_extern) FROM  evenement e JOIN bilan b
  //       ON e.id = b.evenement_id
  //       WHERE b.etat = 'approuvé'
  //       AND e.id = ${user.id} ;
  //       `
  //   );
  var [nb_demande] = await sequelize.query(`
  SELECT e.etat , COUNT(e.id)  FROM evenement e 
  WHERE e.initiateur_id = ${user.id}
  GROUP BY e.etat
  `);

  res.status(200).send({
    nb_evenement: nb_evenement[0].nb_evenement,
    total_sponsoring: total_sponsoring[0].total_sponsoring,
    nb_intervenant: nb_intervenant[0].nb_intervenant,
    nb_demande: nb_demande,
    // nb_participant_externe:nb_participant_externes
  });
};

module.exports = DashboardController;
