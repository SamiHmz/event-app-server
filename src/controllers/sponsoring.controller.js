const joi = require("joi");
const db = require("../models").dbModels;
const _ = require("lodash");
const { Op } = require("sequelize");

const { validateId, generateSearchQuery } = require("./controllers.util");
const {
  etat,
  roles,
  typeUtilisateur,
  modeSponsoring,
} = require("../models/config/magic_strings");

const SponsoringController = {};

const schema = joi.object({
  montant: joi.number().required(),
  dossier: joi.string(),
  sponsor: joi.string().required(),
  type: joi
    .string()
    .required()
    .valid(...modeSponsoring),
  evenement_id: joi.number().required(),
});

SponsoringController.createSponsoring = async (req, res) => {
  const { body } = req;
  const result = schema.validate(body);
  if (result.error)
    return res.status(400).send(result.error.details[0].message);

  const sponsoring = await db.sponsoring.create(body);

  // get  Adminstrateur simple id
  const administrateur = await db.administrateur.findOne({
    where: {
      role: roles.SIMPLE,
    },
  });

  // create the notification
  if (administrateur) {
    const notification = await db.notification_administrateur.create({
      details: ` a ajouté un demande sponsoring  `,
      lien: `/sponsorings/${sponsoring.id}`,
      administrateur_id: administrateur.id,
      nom: req.user.nom,
    });
    // Adminstrateur simple room
    const room = `${typeUtilisateur.ADMINISTRATEUR}-${administrateur.id}`;

    // check if the room emty
    if (req.io.sockets.adapter.rooms.get(room)) {
      var isRoomEmpty = req.io.sockets.adapter.rooms.get(room).size == 0;
    }
    if (!isRoomEmpty) {
      req.io.to(room).emit("notifications", notification);
    }
  }

  res.status(200).send(sponsoring);
};

SponsoringController.getAllSponsoring = async (req, res) => {
  const { user } = req;
  var limit = 10;
  var offset = (req.params.pageNumber - 1) * limit;
  const search = JSON.parse(req.params.search);
  const filter = JSON.parse(req.params.filter);
  var sponsoringQuery = {};
  var evenementQuery = {};
  var initiateurQuery = {};

  if (search.initiateur) {
    initiateurQuery = generateSearchQuery(search);
  } else if (search.èvenement) {
    evenementQuery = generateSearchQuery(search);
  } else {
    sponsoringQuery = generateSearchQuery(search);
  }

  var sponsorings = null;
  if (user.type === typeUtilisateur.INITIATEUR) {
    sponsorings = await db.sponsoring.findAll({
      limit: limit,
      offset: offset,
      where: {
        ...filter,
        ...sponsoringQuery,
      },
      include: {
        model: db.evenement,
        where: {
          initiateur_id: user.id,
          ...evenementQuery,
        },
      },
      order: [["createdAt", "DESC"]],
    });
  } else {
    if (user.role === roles.SIMPLE) {
      sponsorings = await db.sponsoring.findAll({
        limit: limit,
        offset: offset,
        where: {
          ...filter,
          ...sponsoringQuery,
        },
        order: [["createdAt", "DESC"]],
        include: {
          model: db.evenement,
          where: {
            ...evenementQuery,
          },
          attributes: ["intitulé"],
          include: {
            model: db.initiateur,
            where: {
              ...initiateurQuery,
            },
            attributes: ["nom"],
          },
        },
      });
    } else if (user.role === roles.ADMIN) {
      sponsorings = await db.sponsoring.findAll({
        limit: limit,
        offset: offset,

        where: {
          etat_simple: etat.APROUVER,
          ...filter,
          ...sponsoringQuery,
        },
        include: {
          model: db.evenement,
          where: {
            ...evenementQuery,
          },
          attributes: ["intitulé"],
          include: {
            model: db.initiateur,
            where: {
              ...initiateurQuery,
            },
            attributes: ["nom"],
          },
        },
        order: [["createdAt", "DESC"]],
      });
    }
  }

  res.status(200).send(sponsorings);
};

SponsoringController.getAllSponsoringCount = async (req, res) => {
  const { user } = req;
  var count = 0;
  if (user.type === typeUtilisateur.INITIATEUR) {
    count = await db.sponsoring.count({
      include: {
        model: db.evenement,
        where: {
          initiateur_id: user.id,
        },
      },
    });
  } else {
    if (user.role === roles.SIMPLE) {
      count = await db.sponsoring.count();
    } else if (user.role === roles.ADMIN) {
      count = await db.sponsoring.count({
        where: {
          etat: {
            [Op.ne]: etat.APROUVER,
          },
        },
      });
    }
  }

  res.status(200).send({ count });
};

SponsoringController.deleteSponsoring = async (req, res) => {
  const id = req.params.id;
  const { user } = req;
  if (!validateId(req, res, id)) return;

  const sponsoring = await db.sponsoring.findOne({
    where: {
      id,
    },
    include: {
      model: db.evenement,
      where: {
        initiateur_id: user.id,
      },
    },
  });

  if (!sponsoring) return res.status(400).send("sponsoring doesn't exist");
  await sponsoring.destroy();
  res.status(200).send(sponsoring);
};

SponsoringController.getOneSponsoring = async (req, res) => {
  const { user } = req;

  const id = req.params.id;
  if (!validateId(req, res, id)) return;

  var sponsoring = null;
  if (req.user.type === typeUtilisateur.ADMINISTRATEUR) {
    sponsoring = await db.sponsoring.findOne({
      where: {
        id,
      },
      include: {
        model: db.evenement,
      },
    });
  } else {
    sponsoring = await db.sponsoring.findOne({
      where: {
        id,
      },
      include: {
        model: db.evenement,
        where: {
          initiateur_id: user.id,
        },
      },
    });
  }
  if (!sponsoring) return res.status(400).send("sponsoring doesn't exist");
  res.status(200).send(sponsoring);
};

SponsoringController.updateSponsoring = async (req, res) => {
  const { body, user } = req;
  const id = req.params.id;
  if (!validateId(req, res, id)) return;

  result = schema.validate(body);
  if (result.error)
    return res.status(400).send(result.error.details[0].message);

  const sponsoring = await db.sponsoring.findOne({
    where: {
      id,
    },
    include: {
      model: db.evenement,
      where: {
        initiateur_id: user.id,
      },
    },
  });

  Object.keys(body).forEach((prop) => {
    sponsoring[prop] = body[prop];
  });
  sponsoring.etat = etat.ATENTE;

  await sponsoring.save();
  res.status(200).send(_.omit(sponsoring.dataValues, ["evenement"]));
};

SponsoringController.changeSponsoringIsOpened = async (req, res) => {
  const id = req.params.id;
  const isOpeninSchema = joi.object({
    is_opened: joi.boolean().required(),
  });

  if (!validateId(req, res, id)) return;

  const result = isOpeninSchema.validate(req.body);
  if (result.error)
    return res.status(400).send(result.error.details[0].message);

  var sponsoring = await db.sponsoring.findOne({
    where: {
      id,
    },
  });
  if (!sponsoring) return res.status(400).send("sponsoring doesn't exist");
  sponsoring.is_opened = req.body.is_opened;
  await sponsoring.save();
  res.status(200).send(sponsoring);
};

SponsoringController.getSponsoringIsOpened = async (req, res) => {
  const id = req.params.id;
  if (!validateId(req, res, id)) return;

  var sponsoring = await db.sponsoring.findOne({
    where: {
      id,
    },
  });
  if (!sponsoring) return res.status(400).send("sponsoring doesn't exist");
  res.status(200).send(sponsoring.is_opened);
};
module.exports = SponsoringController;
