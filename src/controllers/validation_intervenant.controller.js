const joi = require("joi");
const { validateId } = require("./controllers.util");
const {
  etat,
  typeUtilisateur,
  roles,
  typeIntervenant,
} = require("../models/config/magic_strings");
const db = require("../models").dbModels;
const _ = require("lodash");

const schema = joi.object({
  details: joi.string(),
  intervenant_id: joi.number().required(),
  etat: joi.string().required().valid(etat.REJETER, etat.APROUVER),
});
const ValidationIntervenantController = {};

ValidationIntervenantController.createIntervenantValidation = async (
  req,
  res
) => {
  const body = req.body;
  const user = req.user;
  const result = schema.validate(body);

  if (result.error)
    return res.status(400).send(result.error.details[0].message);

  var intervenant = await db.intervenant.findByPk(body.intervenant_id);

  if (!intervenant) return res.status(400).send("Intervenant doesn't exist");

  if (body.etat == etat.APROUVER) {
    body.details = body.details || "Your event is validate successefully";
  } else {
    if (!body.details)
      return res.status(400).send("You must provide details about rejection");
  }

  if (user.role === roles.SIMPLE) {
    intervenant.etat_simple = body.etat;
    //if intervenant interne
    if (intervenant.type === typeIntervenant[0]) {
      intervenant.etat = body.etat;
    } else if (body.etat === etat.REJETER) {
      intervenant.etat = body.etat;
    } else if (
      body.etat === etat.APROUVER &&
      intervenant.etat === etat.REJETER
    ) {
      intervenant.etat = etat.ATENTE;
    }
  } else if (user.role === roles.ADMIN) {
    intervenant.etat_admin = body.etat;
    if (body.etat === etat.REJETER) {
      intervenant.etat = body.etat;
    } else if (
      body.etat === etat.APROUVER &&
      intervenant.etat === etat.REJETER
    ) {
      intervenant.etat = etat.ATENTE;
    }
  } else if (user.role === roles.SUPER_ADMIN) {
    intervenant.etat_super_admin = body.etat;
    intervenant.etat = body.etat;
  }

  body.administrateur_id = req.user.id;
  const validation = await db.validation_intervenant.create(body);
  await intervenant.save();

  res.status(201).send(validation);
};

ValidationIntervenantController.getAllIntervenantValidation = async (
  req,
  res
) => {
  const id = req.params.id;
  if (!validateId(req, res, id)) return;

  const intervenant = await db.intervenant.findByPk(id);
  if (!intervenant)
    return res.status(400).send("This intervenant doesn't exists");

  const validations = await db.validation_intervenant.findAll({
    where: {
      intervenant_id: id,
    },
    include: {
      model: db.administrateur,
      attributes: ["nom"],
    },
    order: [["createdAt", "ASC"]],
  });

  res.status(200).send(validations);
};
module.exports = ValidationIntervenantController;
