const joi = require("joi");
const { validateId } = require("./controllers.util");
const { etat } = require("../models/config/magic_strings");
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
  // create the notification
  const notification = await db.notification_initiateur.create({
    details: ` a ${validation.etat} votre demande évènement ${evenement.intitulé} `,
    lien: `/demandes/${evenement.id}`,
    initiateur_id: evenement.initiateur_id,
    nom: req.user.nom,
  });

  // check if the room emty
  const isRoomEmpty =
    req.io.sockets.adapter.rooms.get("initiateur-1").size == 0;

  if (!isRoomEmpty) {
    req.io.to("initiateur-1").emit("notifications", notification);
  }
  res.status(201).send(validation);
};

ValidationEvenementController.deleteValidation = async (req, res) => {
  const { id } = req.params;

  if (!validateId(req, res, id)) return;

  const validation = await db.validation_evenement.findByPk(id);
  if (!validation)
    return res.status(400).send("This validation doesn't exists");

  // check if this validation is the latest one so we wan modify evenement state
  const validations = await db.validation_evenement.findAll({
    where: {
      evenement_id: validation.evenement_id,
    },
    order: [["createdAt", "DESC"]],
  });
  // validations[0].dataValues.id : latest validation

  const isLatestValidation = validations[0].dataValues.id == id;

  // change evenement etat to the new latest validation
  if (isLatestValidation) {
    var evenement = await db.evenement.findByPk(validation.evenement_id);
    if (!validation[1]) {
      // we just have one validation left
      evenement.etat = etat.ATENTE;
    } else {
      //validations[1].dataValues.id  is the new latest validation after deletion
      evenement.etat = validations[1].dataValues.etat;
    }
    await evenement.save();
  }

  await validation.destroy();

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
  console.log("excuted");

  const evenement = await db.evenement.findByPk(id);
  if (!evenement) return res.status(400).send("This evenement doesn't exists");

  const validations = await db.validation_evenement.findAll({
    where: {
      evenement_id: id,
    },
    order: [["createdAt", "ASC"]],
  });

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
  // check if this validation is the latest one so we wan modify evenement state
  const validations = await db.validation_evenement.findAll({
    where: {
      evenement_id: validation.evenement_id,
    },
    attributes: ["id"],
    order: [["createdAt", "DESC"]],
  });
  const isLatestValidation = validations[0].dataValues.id == id;
  if (isLatestValidation) {
    var evenement = await db.evenement.findByPk(body.evenement_id);
    evenement.etat = body.etat;
    await evenement.save();
  }
  await validation.save();
  res.status(200).send(validation);
};

module.exports = ValidationEvenementController;
