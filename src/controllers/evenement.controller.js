const joi = require("joi");
const db = require("../models").dbModels;
const { Op } = require("sequelize");
const {
  typeEvenement,
  modeEvenement,
  etat,
  roles,
} = require("../models/config/magic_strings");

const { validateId } = require("./controllers.util");

const EvenementController = {};

var schema = {};
var limit = 10;
var generalSchema = {
  intitulé: joi.string().required(),
  debut: joi.date().required(),
  fin: joi.date().required(),
  lieu: joi.string().required(),
  programe: joi.string().required(),
  objectifs: joi.string().required(),
  type: joi
    .string()
    .required()
    .valid(...typeEvenement),
  mode: joi
    .string()
    .required()
    .valid(...modeEvenement),
};

schema.create = joi.object(generalSchema);

EvenementController.createEvenement = async (req, res) => {
  const { body } = req;
  const result = schema.create.validate(body);
  if (result.error)
    return res.status(400).send(result.error.details[0].message);
  body.initiateur_id = req.user.id;
  body.etat = etat.ATENTE;
  const evenement = await db.evenement.create(body);
  res.status(201).send(evenement);
};

EvenementController.getOneEvenement = async (req, res) => {
  const id = req.params.id;
  if (!validateId(req, res, id)) return;

  var evenement = null;
  if (req.user.role === roles.SUPER_ADMIN || req.user.role === roles.ADMIN) {
    evenement = await db.evenement.findOne({
      where: {
        id,
      },
    });
  } else {
    evenement = await db.evenement.findOne({
      where: {
        id,
        initiateur_id: req.user.id,
      },
    });
  }
  if (!evenement) return res.status(400).send("Evenement doesn't exist");
  res.status(200).send(evenement);
};

EvenementController.getAllEvenement = async (req, res) => {
  var evenements = null;

  if (req.user.type === "initiateur") {
    evenements = await db.evenement.findAll({
      limit: 3,
      offset: 3,
      where: {
        initiateur_id: req.user.id,
      },
      include: db.type_evenement,
    });
  } else {
    evenements = await db.evenement.findAll({ include: db.type_evenement });
  }
  res.status(200).send(evenements);
};

EvenementController.updateEvenement = async (req, res) => {
  const { body } = req;
  const id = req.params.id;

  var result = validateId(id);
  if (result.error)
    return res.status(400).send(result.error.details[0].message);

  result = schema.create.validate(body);
  if (result.error)
    return res.status(400).send(result.error.details[0].message);

  const evenement = await db.evenement.findOne({
    where: {
      id,
      initiateur_id: req.user.id,
    },
  });

  if (!evenement) return res.status(400).send("Evenement doesn't exist");

  Object.keys(body).forEach((prop) => {
    evenement[prop] = body[prop];
  });

  await evenement.save();
  res.send(evenement);
};

EvenementController.deleteEvenement = async (req, res) => {
  const id = req.params.id;
  if (!validateId(req, res, id)) return;

  const evenement = await db.evenement.findOne({
    where: {
      id,
      initiateur_id: req.user.id,
    },
  });

  if (!evenement) return res.status(400).send("Evenement doesn't exist");
  await evenement.destroy();
  res.status(200).send(evenement);
};

EvenementController.getAllDemandes = async (req, res) => {
  // calculate the request page number offset
  var offset = (req.params.pageNumber - 1) * limit;
  var demandes = null;

  if (req.user.type === "initiateur") {
    demandes = await db.evenement.findAll({
      limit,
      offset,
      where: {
        initiateur_id: req.user.id,
        etat: {
          [Op.ne]: etat.APROUVER,
        },
      },
      include: db.type_evenement,
    });
  } else {
    demandes = await db.evenement.findAll({
      limit: limit,
      offset: offset,
      where: {
        etat: {
          [Op.ne]: etat.APROUVER,
        },
      },
      include: db.type_evenement,
    });
  }
  res.status(200).send(demandes);
};

EvenementController.getDemandesCount = async (req, res) => {
  var count = 0;

  if (req.user.type === "initiateur") {
    count = await db.evenement.count({
      where: {
        initiateur_id: req.user.id,
        etat: {
          [Op.ne]: etat.APROUVER,
        },
      },
    });
  } else {
    count = await db.evenement.count({
      where: {
        etat: {
          [Op.ne]: etat.APROUVER,
        },
      },
      include: db.type_evenement,
    });
  }
  res.status(200).send({ count });
};

module.exports = EvenementController;
