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

const { validateId, generateSearchQuery } = require("./controllers.util");

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
  if (administrateur) {
    const notification = await db.notification_administrateur.create({
      details: ` a ajouté une nouvelle demande évènement ${evenement.intitulé} `,
      lien: `/demandes/${evenement.id}`,
      administrateur_id: administrateur.id,
      creator_id: req.user.id,
    });
    // Adminstrateur simple room
    const room = `${typeUtilisateur.ADMINISTRATEUR}-${administrateur.id}`;

    // check if the room emty
    if (req.io.sockets.adapter.rooms.get(room)) {
      var isRoomEmpty = req.io.sockets.adapter.rooms.get(room).size == 0;
    }
    if (!isRoomEmpty) {
      notification.dataValues.initiateur = {
        photo: req.user.photo,
        nom: req.user.nom,
      };
      req.io.to(room).emit("notifications", notification);
    }
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
  // calculate the request page number offset
  var { pageNumber } = req.params;
  var offset = (pageNumber - 1) * limit;
  var evenements = null;

  if (req.user.type === "initiateur") {
    evenements = await db.evenement.findAll({
      limit: limit,
      offset: offset,
      where: {
        initiateur_id: req.user.id,
        is_happened: true,
      },
      include: {
        model: db.bilan,
        include: db.bilan_photo,
      },
    });
  } else {
    evenements = await db.evenement.findAll({
      limit: limit,
      offset: offset,
      where: {
        is_happened: true,
      },
      include: {
        model: db.bilan,
        include: db.bilan_photo,
      },
    });
  }
  res.status(200).send(evenements);
};

EvenementController.getAllNotHappenedEventYet = async (req, res) => {
  var evenements = await db.evenement.findAll({
    where: {
      initiateur_id: req.user.id,
      is_happened: false,
      etat: etat.APROUVER,
    },
    attributes: ["id", "intitulé"],
  });
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
  var { pageNumber } = req.params;
  var offset = (pageNumber - 1) * limit;

  const search = JSON.parse(req.params.search);
  const filter = JSON.parse(req.params.filter);

  var querySearch = generateSearchQuery(search);

  if (req.user.type === typeUtilisateur.INITIATEUR) {
    demandes = await db.evenement.findAll({
      limit: limit,
      offset: offset,
      where: {
        initiateur_id: req.user.id,
        ...querySearch,
        ...filter,
      },
      order: [["createdAt", "DESC"]],
    });
  } else {
    var searchParams = {};
    if (search.initiateur) {
      searchParams = {
        where: { ...filter },
        include: {
          model: db.initiateur,
          where: {
            ...querySearch,
          },
        },
      };
    } else {
      searchParams = {
        where: { ...querySearch, ...filter },
        include: {
          model: db.initiateur,
        },
      };
    }

    demandes = await db.evenement.findAll({
      limit: limit,
      offset: offset,
      ...searchParams,
      order: [["createdAt", "DESC"]],
    });
  }
  res.status(200).send(demandes);
};

EvenementController.getDemandesCount = async (req, res) => {
  var count = 0;

  if (req.user.type === typeUtilisateur.INITIATEUR) {
    count = await db.evenement.count({
      where: {
        initiateur_id: req.user.id,
      },
    });
  } else {
    count = await db.evenement.count();
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
