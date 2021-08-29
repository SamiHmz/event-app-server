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

const DashboardController = {};

const generateEtatWithData = (data) => {
  var etat = {
    "en attente": 0,
    approuvé: 0,
    rejetè: 0,
  };
  data.forEach((item) => {
    etat[item.etat] = parseInt(item.count);
  });

  return etat;
};

const queryByEtat = async (db_model) => {
  return await sequelize.query(` SELECT  etat,count(etat) FROM ${db_model} 
  GROUP BY etat ;`);
};

/****** Dashboard initiateur ****/

const dashboardInitiateur = async (user) => {
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

  // Les intervenant par type et par etat
  var [intervenants] = await sequelize.query(`
  SELECT i.etat,COUNT(i.id) FROM intervenant i JOIN evenement e
  ON e.id = i.evenement_id
  WHERE e.initiateur_id = ${user.id} 
  GROUP BY i.etat;
  `);

  var [nb_participant] = await sequelize.query(
    ` SELECT SUM(b.participants_intern) as intern,SUM(b.participants_extern)as extern FROM  evenement e JOIN bilan b
    ON e.id = b.evenement_id
    WHERE b.etat = 'approuvé'
    AND e.initiateur_id = ${user.id} ;
    `
  );
  // les demands par etats
  var [demandes] = await sequelize.query(`
      SELECT e.etat , COUNT(e.id)  FROM evenement e 
      WHERE e.initiateur_id = ${user.id}
      GROUP BY e.etat
      `);
  // sponsoring par etat
  var [sponsorings] = await sequelize.query(`
  SELECT s.etat,COUNT(s.id) FROM sponsoring s JOIN evenement e
  ON e.id = s.evenement_id
  WHERE e.initiateur_id = ${user.id} 
  GROUP BY s.etat;
  `);

  // bilan par etat

  var [bilans] = await sequelize.query(`
  SELECT b.etat,COUNT(b.id) FROM bilan b JOIN evenement e
  ON e.id = b.evenement_id
  WHERE e.initiateur_id = ${user.id} 
  GROUP BY b.etat;
  `);

  return {
    demandes: generateEtatWithData(demandes),
    intervenants: generateEtatWithData(intervenants),
    sponsorings: generateEtatWithData(sponsorings),
    bilans: generateEtatWithData(bilans),
    nb_evenement: nb_evenement[0].nb_evenement,
    total_sponsoring: total_sponsoring[0].total_sponsoring,
    nb_participant: nb_participant[0],
  };
};

const dashboardAdministrateur = async () => {
  // demandes par etat
  var [demandes] = await queryByEtat("evenement");

  // intervenant par etat
  var [intervenats] = await queryByEtat("intervenant");

  // sponsoring par etat
  var [sponsorings] = await queryByEtat("sponsoring");
  //bilans par etat
  var [bilans] = await queryByEtat("bilan");
  // nb evenement par initateur

  var [nb_evenement] = await sequelize.query(`
  SELECT i.nom,count(e.is_happened) FROM evenement e RIGHT JOIN initiateur i 
  ON e.initiateur_id = i.id 
  WHERE e.is_happened = true or is_happened IS NULL
  GROUP BY i.nom ;

 `);

  var [budget] = await sequelize.query(`
 SELECT i.nom ,SUM(s.montant) as count FROM evenement e RIGHT JOIN initiateur i 
 ON e.initiateur_id = i.id 
 LEFT JOIN sponsoring s 
 ON s.evenement_id = e.id 
WHERE e.is_happened = true or is_happened IS NULL
 GROUP BY i.nom;
`);
  var total_sponsoring = budget.reduce((acumulator, item) => {
    if (item.count) return acumulator + parseInt(item.count);
    else return acumulator;
  }, 0);

  return {
    demandes: generateEtatWithData(demandes),
    intervenants: generateEtatWithData(intervenats),
    sponsorings: generateEtatWithData(sponsorings),
    bilans: generateEtatWithData(bilans),
    nb_evenement,
    budget,
    total_sponsoring,
  };
};
DashboardController.getDashboadData = async (req, res) => {
  const { user } = req;
  var data = {};
  if (user.type === typeUtilisateur.INITIATEUR) {
    data = await dashboardInitiateur(user);
  } else {
    data = await dashboardAdministrateur();
  }
  res.status(200).send(data);
};

module.exports = DashboardController;
