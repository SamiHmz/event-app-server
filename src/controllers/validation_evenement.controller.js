const joi = require("joi");
const { etat, validateId } = require("./controllers.util");
const db = require("../models").dbModels;
const _ = require("lodash");
const schema = joi.object({
  details: joi.string(),
  evenement_id: joi.number().required(),
  etat: joi.string().required().valid(etat.REJETER, etat.APROUVER),
});
const ValidationEvenementController = {};

ValidationEvenementController.createValidation = async (req, res) => {
  const body = req.body;

  const result = schema.validate(body);
  if (result.error)
    return res.status(400).send(result.error.details[0].message);

  var evenement = await db.evenement.findByPk(body.evenement_id);

  if (!evenement) return res.status(400).send("Evenement doesn't exist");

  if (evenement.etat == etat.APROUVER)
    return res.status(400).send("This evenement is already validate");

  if (body.etat == etat.APROUVER) {
    evenement.etat = etat.APROUVER;
    body.details = body.details || "Your event is validate successefully";
  } else {
    evenement.etat = etat.REJETER;
    if (!body.details)
      return res.status(400).send("You must provide details about rejection");
  }
  const validation = await db.validation_evenement.create(body);
  await evenement.save();
  res.status(201).send(validation);
};

ValidationEvenementController.deleteValidation = async (req, res) => {
  const { id } = req.params;

  if (!validateId(req, res, id)) return;

  const validation = await db.validation_evenement.findByPk(id);
  if (!validation)
    return res.status(400).send("This validation doesn't exists");

  validation.destroy();
  res.status(200).send(validation);
};

ValidationEvenementController.getOneValidation = async (req, res) => {
  const id = req.params.id;
  if (!validateId(req, res, id)) return;

  const validation = await db.validation_evenement.findByPk(id);
  if (!validation)
    return res.status(400).send("This validation doesn't exists");

  res.status(200).send(validation);
};

ValidationEvenementController.getAllValidation = async (req, res) => {
  const id = req.params.id;
  if (!validateId(req, res, id)) return;

  const evenement = await db.evenement.findByPk(id);
  if (!evenement) return res.status(400).send("This evenement doesn't exists");

  const validations = await db.validation_evenement.findAll({
    where: {
      evenement_id: id,
    },
  });

  if (validations.length === 0)
    return res.status(400).send("This evenement doesn't have any validations");

  res.status(200).send(validations);
};

ValidationEvenementController.updateValidation = async (req, res) => {
  const body = req.body;
  const id = req.params.id;

  if (!validateId(req, res, id)) return;

  const result = schema.validate(body);
  if (result.error)
    return res.status(400).send(result.error.details[0].message);

  const validation = await db.validation_evenement.findByPk(id);
  if (!validation)
    return res.status(400).send("This validation doesn't exists");

  Object.keys(body).forEach((prop) => {
    validation[prop] = body[prop];
  });

  await validation.save();
  res.status(200).send(validation);
};

module.exports = ValidationEvenementController;
