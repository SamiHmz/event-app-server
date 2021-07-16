const joi = require("joi");
const db = require("../models").dbModels;
const { Op } = require("sequelize");
const {
  typeEvenement,
  modeEvenement,
  etat,
  roles,
  typeUtilisateur,
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
  body.is_opened = false;

  const evenement = await db.evenement.create(body);
  // get  Adminstrateur simple id
  const administrateur = await db.administrateur.findOne({
    where: {
      role: roles.SIMPLE,
    },
  });

  // create the notification
  const notification = await db.notification_administrateur.create({
    details: ` a ajouté une nouvelle demande évènement ${evenement.intitulé} `,
    lien: `/demandes/${evenement.id}`,
    administrateur_id: administrateur.id,
    nom: req.user.nom,
  });
  // Adminstrateur simple room
  const room = `${typeUtilisateur.ADMINISTRATEUR}-${administrateur.id}`;

  // check if the room emty
  const isRoomEmpty = req.io.sockets.adapter.rooms.get(room).size == 0;
  if (!isRoomEmpty) {
    req.io.to(room).emit("notifications", notification);
  }

  res.status(201).send(evenement);
};

EvenementController.getOneEvenement = async (req, res) => {
  const id = req.params.id;
  if (!validateId(req, res, id)) return;

  var evenement = null;
  if (req.user.type === typeUtilisateur.ADMINISTRATEUR) {
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
  if (!validateId(req, res, id)) return;

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
  evenement.etat = etat.ATENTE;
  await evenement.save();
  res.status(200).send(evenement);
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
      },
    });
  } else {
    demandes = await db.evenement.findAll({
      limit: limit,
      offset: offset,
      where: {},
      include: {
        model: db.initiateur,
      },
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

EvenementController.changeDemandeIsOpened = async (req, res) => {
  const id = req.params.id;
  const isOpeninSchema = joi.object({
    is_opened: joi.boolean().required(),
  });
  if (!validateId(req, res, id)) return;
  const result = isOpeninSchema.validate(req.body);
  if (result.error)
    return res.status(400).send(result.error.details[0].message);

  var evenement = await db.evenement.findOne({
    where: {
      id,
    },
  });
  if (!evenement) return res.status(400).send("Evenement doesn't exist");
  evenement.is_opened = req.body.is_opened;
  await evenement.save();
  res.status(200).send(evenement);
};

EvenementController.getIsOpened = async (req, res) => {
  const id = req.params.id;
  if (!validateId(req, res, id)) return;

  var evenement = await db.evenement.findOne({
    where: {
      id,
    },
  });
  if (!evenement) return res.status(400).send("Evenement doesn't exist");
  res.status(200).send(evenement.is_opened);
};

module.exports = EvenementController;
