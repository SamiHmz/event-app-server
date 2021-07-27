const joi = require("joi");
const db = require("../models").dbModels;
const _ = require("lodash");
const { Op } = require("sequelize");

const { validateId } = require("./controllers.util");
const {
  sexe,
  etat,
  roles,
  typeUtilisateur,
  typeIntervenant,
} = require("../models/config/magic_strings");
const sexeIntervenant = Object.values(sexe);
const typeIntervenantValues = Object.values(typeIntervenant);

const IntervenantController = {};

const intervenantSchema = joi.object({
  nom: joi.string().required(),
  prenom: joi.string().required(),
  email: joi.string().email().required(),
  sexe: joi
    .string()
    .required()
    .valid(...sexeIntervenant),
  type: joi
    .string()
    .required()
    .valid(...typeIntervenantValues),
  telephone: joi.number().required(),
  photo: joi.string().required(),
  cv: joi.string().required(),
  evenement_id: joi.number().required(),
});

IntervenantController.createIntervenant = async (req, res) => {
  const { body } = req;
  const result = intervenantSchema.validate(body);
  if (result.error)
    return res.status(400).send(result.error.details[0].message);

  const intervenant = await db.intervenant.create(body);

  // get  Adminstrateur simple id
  const administrateur = await db.administrateur.findOne({
    where: {
      role: roles.SIMPLE,
    },
  });

  // create the notification
  if (administrateur) {
    const notification = await db.notification_administrateur.create({
      details: ` a ajouté un intervenant  ${intervenant.prenom} ${intervenant.nom}  `,
      lien: `/intervenants/${intervenant.id}`,
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

  res.status(200).send(intervenant);
};

IntervenantController.getAllIntervenant = async (req, res) => {
  const { user } = req;
  var limit = 10;
  var offset = (req.params.pageNumber - 1) * limit;

  var intervenants = null;
  if (user.type === typeUtilisateur.INITIATEUR) {
    intervenants = await db.intervenant.findAll({
      limit: limit,
      offset: offset,
      include: {
        model: db.evenement,
        where: {
          initiateur_id: user.id,
        },
      },
      order: [["createdAt", "DESC"]],
    });
  } else {
    if (user.role === roles.SIMPLE) {
      intervenants = await db.intervenant.findAll({
        limit: limit,
        offset: offset,
        order: [["createdAt", "DESC"]],
      });
    } else if (user.role === roles.ADMIN) {
      console.log("excuted");
      intervenants = await db.intervenant.findAll({
        limit: limit,
        offset: offset,
        where: {
          etat_simple: etat.APROUVER,
        },
        order: [["createdAt", "DESC"]],
      });
    } else {
      intervenants = await db.intervenant.findAll({
        limit: limit,
        offset: offset,
        where: {
          etat_admin: etat.APROUVER,
        },
        order: [["createdAt", "DESC"]],
      });
    }
  }

  res.status(200).send(intervenants);
};

IntervenantController.getAllIntervenantCount = async (req, res) => {
  const { user } = req;
  var count = 0;
  if (user.type === typeUtilisateur.INITIATEUR) {
    count = await db.intervenant.count({
      include: {
        model: db.evenement,
        where: {
          initiateur_id: user.id,
        },
      },
    });
  } else {
    if (user.role === roles.SIMPLE) {
      count = await db.intervenant.count();
    } else if (user.role === roles.ADMIN) {
      count = await db.intervenant.count({
        where: {
          etat: {
            [Op.ne]: etat.APROUVER,
          },
        },
      });
    } else {
      count = await db.intervenant.count({
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

IntervenantController.deleteIntervenant = async (req, res) => {
  const id = req.params.id;
  const { user } = req;
  if (!validateId(req, res, id)) return;

  const intervenant = await db.intervenant.findOne({
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

  if (!intervenant) return res.status(400).send("intervenant doesn't exist");
  await intervenant.destroy();
  res.status(200).send(intervenant);
};

IntervenantController.getOneIntervenant = async (req, res) => {
  const { user } = req;

  const id = req.params.id;
  if (!validateId(req, res, id)) return;

  var intervenant = null;
  if (req.user.type === typeUtilisateur.ADMINISTRATEUR) {
    intervenant = await db.intervenant.findOne({
      where: {
        id,
      },
      include: {
        model: db.evenement,
      },
    });
  } else {
    intervenant = await db.intervenant.findOne({
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
  if (!intervenant) return res.status(400).send("Intervenant doesn't exist");
  res.status(200).send(intervenant);
};
IntervenantController.updateIntervenant = async (req, res) => {
  const { body, user } = req;
  const id = req.params.id;
  if (!validateId(req, res, id)) return;

  result = intervenantSchema.validate(body);
  if (result.error)
    return res.status(400).send(result.error.details[0].message);

  const intervenant = await db.intervenant.findOne({
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
    intervenant[prop] = body[prop];
  });
  intervenant.etat = etat.ATENTE;

  await intervenant.save();
  res.status(200).send(_.omit(intervenant.dataValues, ["evenement"]));
};

IntervenantController.changeIntervenantIsOpened = async (req, res) => {
  const id = req.params.id;
  const isOpeninSchema = joi.object({
    is_opened: joi.boolean().required(),
  });

  if (!validateId(req, res, id)) return;

  const result = isOpeninSchema.validate(req.body);
  if (result.error)
    return res.status(400).send(result.error.details[0].message);

  var intervenant = await db.intervenant.findOne({
    where: {
      id,
    },
  });
  if (!intervenant) return res.status(400).send("intervenant doesn't exist");
  intervenant.is_opened = req.body.is_opened;
  await intervenant.save();
  res.status(200).send(intervenant);
};

IntervenantController.getIntervenantIsOpened = async (req, res) => {
  const id = req.params.id;
  if (!validateId(req, res, id)) return;

  var intervenant = await db.intervenant.findOne({
    where: {
      id,
    },
  });
  if (!intervenant) return res.status(400).send("intervenant doesn't exist");
  res.status(200).send(intervenant.is_opened);
};
module.exports = IntervenantController;
