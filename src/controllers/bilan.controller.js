const joi = require("joi");
const db = require("../models").dbModels;
const _ = require("lodash");
const { validateId } = require("./controllers.util");
const {
  typeEvenement,
  modeEvenement,
  etat,
  roles,
  typeUtilisateur,
} = require("../models/config/magic_strings");
const BilanController = {};

const schema = joi.object({
  article: joi.string(),
  ppt_presentation: joi.string(),
  participants_intern: joi.number().required(),
  participants_extern: joi.number(),
  evenement_id: joi.number().required(),
  problem: joi.string(),
  photo: joi.array(),
});

var limit = 10;

const createSponsoringNotification = async (req, type_utilisateur, bilan) => {
  var room = null;
  var notification = null;
  if (type_utilisateur === typeUtilisateur.ADMINISTRATEUR) {
    // get  Adminstrateur admin id
    const administrateur = await db.administrateur.findOne({
      where: {
        role: roles.SIMPLE,
      },
    });
    if (administrateur) {
      notification = await db.notification_administrateur.create({
        details: ` a ajouté un bilan  `,
        lien: `/bilans/${bilan.id}`,
        administrateur_id: administrateur.id,
        nom: req.user.nom,
      });
    }
    // Adminstrateur  room
    room = `${typeUtilisateur.ADMINISTRATEUR}-${administrateur.id}`;
  } else {
    //get initiateur id
    const evenement = await db.evenement.findByPk(bilan.evenement_id);

    // create initiateur notification
    notification = await db.notification_initiateur.create({
      details: ` a  ${req.body.etat} votre bilan `,
      lien: `/bilans/${bilan.id}`,
      initiateur_id: evenement.initiateur_id,
      nom: req.user.nom,
    });
    // initiateur room
    room = `${typeUtilisateur.INITIATEUR}-${evenement.initiateur_id}`;
  }

  // check if the room empty
  if (req.io.sockets.adapter.rooms.get(room)) {
    var isRoomEmpty = req.io.sockets.adapter.rooms.get(room).size == 0;
  }

  if (!isRoomEmpty) {
    req.io.to(room).emit("notifications", notification);
  }
};

BilanController.createBilan = async (req, res) => {
  const { body } = req;
  const result = schema.validate(body);
  if (result.error)
    return res.status(400).send(result.error.details[0].message);

  const evenement = await db.evenement.findOne({
    where: {
      id: body.evenement_id,
      initiateur_id: req.user.id,
    },
  });

  if (!evenement) return res.status(400).send("Evenement doesn't exist");

  var bilan = await db.bilan.create(body);
  bilan = await db.bilan.findOne({
    where: {
      id: bilan.id,
    },
    include: db.evenement,
  });
  body.photo.forEach(async (photo) => {
    await db.bilan_photo.create({ bilan_id: bilan.id, lien: photo });
  });
  await createSponsoringNotification(
    req,
    typeUtilisateur.ADMINISTRATEUR,
    bilan
  );

  res.status(201).send(bilan);
};

BilanController.updateBilan = async (req, res) => {
  const { body } = req;
  const { id } = req.params;

  if (!validateId(req, res, id)) return;

  const result = schema.validate(body);
  if (result.error)
    return res.status(400).send(result.error.details[0].message);

  var bilan = await db.bilan.findOne({
    where: {
      id,
    },
    include: {
      model: db.evenement,
    },
  });

  const evenement = await db.evenement.findOne({
    where: {
      id: body.evenement_id,
      initiateur_id: req.user.id,
    },
  });

  if (!evenement) return res.status(400).send("Evenement doesn't exist");

  Object.keys(body).forEach((prop) => {
    bilan[prop] = body[prop];
  });

  await bilan.save();

  body.photo.forEach(async (item) => {
    var photo = await db.bilan_photo.findOne({
      where: {
        lien: item,
        bilan_id: bilan.id,
      },
    });
    console.log(photo);
    if (photo) return;
    await db.bilan_photo.create({ lien: item, bilan_id: bilan.id });
  });

  res.status(200).send(bilan);
};

BilanController.getOneBilan = async (req, res) => {
  const id = req.params.id;
  const { user } = req;
  if (!validateId(req, res, id)) return;

  var bilan = null;
  if (user.type === typeUtilisateur.ADMINISTRATEUR) {
    bilan = await db.bilan.findOne({
      where: {
        id,
      },
      include: [
        {
          model: db.evenement,
        },
        {
          model: db.bilan_photo,
        },
      ],
    });
  } else {
    bilan = await db.bilan.findOne({
      where: {
        id,
      },
      include: [
        {
          model: db.evenement,
          where: {
            initiateur_id: req.user.id,
          },
        },
        {
          model: db.bilan_photo,
        },
      ],
    });
  }

  if (!bilan) return res.status(400).send("this bilan doesn't exit");
  res.status(200).send(bilan);
};

BilanController.getAllBilans = async (req, res) => {
  var offset = (req.params.pageNumber - 1) * limit;
  var bilans = null;
  const { user } = req;

  if (user.type === typeUtilisateur.ADMINISTRATEUR) {
    bilans = await db.bilan.findAll({
      include: {
        model: db.evenement,
      },
      limit: limit,
      offset: offset,
    });
  } else {
    bilans = await db.bilan.findAll({
      include: {
        model: db.evenement,
        where: {
          initiateur_id: req.user.id,
        },
      },
      limit: limit,
      offset: offset,
    });
  }
  res.status(200).send(bilans);
};

BilanController.deleteBilan = async (req, res) => {
  const { user } = req.body;
  const id = req.params.id;
  if (!validateId(req, res, id)) return;

  var bilan = null;
  if (user) {
    bilan = await db.bilan.findOne({
      where: {
        id,
      },
    });
  } else {
    bilan = await db.bilan.findOne({
      where: {
        id,
      },
      include: {
        model: db.evenement,
        where: {
          initiateur_id: req.user.id,
        },
      },
    });
  }

  if (!bilan) return res.status(400).send("this bilan doesn't exit");
  bilan.destroy();
  const evenement = await db.evenement.findOne({
    where: {
      id: req.body.evenement_id,
      initiateur_id: req.user.id,
    },
  });
  evenement.is_happened = false;
  await evenement.save();
  res.status(200).send(bilan);
};

BilanController.getAllbilanCount = async (req, res) => {
  var count = 0;

  if (req.user.type === typeUtilisateur.INITIATEUR) {
    count = await db.bilan.count({
      include: {
        model: db.evenement,
        where: {
          initiateur_id: req.user.id,
        },
      },
    });
  } else {
    count = await db.bilan.count({});
  }
  res.status(200).send({ count });
};

BilanController.validateBilan = async (req, res) => {
  const { user } = req;
  const etatBilan = req.body.etat;
  const id = req.params.id;
  if (!validateId(req, res, id)) return;

  var bilan = await db.bilan.findOne({
    where: {
      id,
    },
  });

  if (!bilan) return res.status(400).send("this bilan doesn't exit");

  bilan.etat = etatBilan;
  console.log(bilan.evenement_id);
  const evenement = await db.evenement.findByPk(bilan.evenement_id);
  console.log(etat == etat.APROUVER);

  if (etatBilan === etat.APROUVER) {
    evenement.is_happened = true;
  } else {
    evenement.is_happened = false;
  }
  await bilan.save();
  await evenement.save();
  await createSponsoringNotification(req, typeUtilisateur.INITIATEUR, bilan);

  res.status(200).send(bilan);
};

module.exports = BilanController;
