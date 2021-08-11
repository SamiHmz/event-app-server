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
  sponsoring_id: joi.number().required(),
  etat: joi.string().required().valid(etat.REJETER, etat.APROUVER),
});
const ValidationSponsoringController = {};

const createSponsoringNotification = async (
  req,
  type_utilisateur,
  sponsoring,
  role_admin
) => {
  var room = null;
  var notification = null;
  var evenement = await db.evenement.findOne({
    include: db.initiateur,
    where: {
      id: sponsoring.evenement_id,
    },
  });

  if (type_utilisateur === typeUtilisateur.ADMINISTRATEUR) {
    // get  Adminstrateur admin id
    const administrateur = await db.administrateur.findOne({
      where: {
        role: role_admin,
      },
    });
    if (administrateur) {
      notification = await db.notification_administrateur.create({
        details: ` a ajouté un sponsoring  `,
        lien: `/sponsorings/${sponsoring.id}`,
        administrateur_id: administrateur.id,
        creator_id: evenement.initiateur_id,
      });
    }
    notification.dataValues.initiateur = {
      photo: evenement.initiateur.photo,
      nom: evenement.initiateur.nom,
    };
    // Adminstrateur  room
    room = `${typeUtilisateur.ADMINISTRATEUR}-${administrateur.id}`;
  } else {
    //get initiateur id

    // create initiateur notification
    notification = await db.notification_initiateur.create({
      details: ` a  ${req.body.etat} votre sponsoring `,
      lien: `/sponsorings/${sponsoring.id}`,
      initiateur_id: evenement.initiateur_id,
      creator_id: req.user.id,
    });
    // initiateur room
    room = `${typeUtilisateur.INITIATEUR}-${evenement.initiateur_id}`;
    notification.dataValues.administrateur = {
      photo: req.user.photo,
      nom: req.user.nom,
    };
  }

  // check if the room empty
  if (req.io.sockets.adapter.rooms.get(room)) {
    var isRoomEmpty = req.io.sockets.adapter.rooms.get(room).size == 0;
  }

  if (!isRoomEmpty) {
    req.io.to(room).emit("notifications", notification);
  }
};

ValidationSponsoringController.createSponsoringValidation = async (
  req,
  res
) => {
  const body = req.body;
  const user = req.user;
  const result = schema.validate(body);

  if (result.error)
    return res.status(400).send(result.error.details[0].message);

  var sponsoring = await db.sponsoring.findByPk(body.sponsoring_id);

  if (!sponsoring) return res.status(400).send("sponsoring doesn't exist");

  if (body.etat == etat.APROUVER) {
    body.details = body.details || "Your event is validate successefully";
  } else {
    if (!body.details)
      return res.status(400).send("You must provide details about rejection");
  }

  if (user.role === roles.SIMPLE) {
    sponsoring.etat_simple = body.etat;
    if (body.etat === etat.REJETER) {
      sponsoring.etat = body.etat;
    } else if (
      body.etat === etat.APROUVER &&
      sponsoring.etat === etat.REJETER
    ) {
      sponsoring.etat = etat.ATENTE;
    }
    await createSponsoringNotification(
      req,
      typeUtilisateur.ADMINISTRATEUR,
      sponsoring,
      roles.ADMIN
    );
  } else if (user.role === roles.ADMIN) {
    sponsoring.etat = body.etat;
  }

  // initiateur notification
  await createSponsoringNotification(
    req,
    typeUtilisateur.INITIATEUR,
    sponsoring
  );

  await sponsoring.save();

  body.administrateur_id = req.user.id;
  var validation = await db.validation_sponsoring.create(body);
  validation = await db.validation_sponsoring.findByPk(validation.id, {
    include: {
      model: db.administrateur,
      attributes: ["nom"],
    },
  });
  res.status(201).send(validation);
};

ValidationSponsoringController.updateSponsoringValidation = async (
  req,
  res
) => {
  const { body, user } = req;
  const id = req.params.id;

  if (!validateId(req, res, id)) return;

  const result = schema.validate(body);
  if (result.error)
    return res.status(400).send(result.error.details[0].message);
  var sponsoring = await db.sponsoring.findByPk(body.sponsoring_id);

  if (!sponsoring) return res.status(400).send("Sponsoring doesn't exist");

  const validation = await db.validation_sponsoring.findByPk(id);
  if (!validation)
    return res.status(400).send("This validation doesn't exists");

  Object.keys(body).forEach((prop) => {
    validation[prop] = body[prop];
  });

  if (user.role === roles.SIMPLE) {
    sponsoring.etat_simple = body.etat;
    if (body.etat === etat.REJETER) {
      sponsoring.etat = body.etat;
    } else if (
      body.etat === etat.APROUVER &&
      sponsoring.etat === etat.REJETER
    ) {
      sponsoring.etat = etat.ATENTE;
    }
  } else if (user.role === roles.SUPER_ADMIN) {
    sponsoring.etat = body.etat;
  }

  await sponsoring.save();
  await validation.save();
  res.status(200).send(validation);
};

ValidationSponsoringController.getAllSponsoringValidation = async (
  req,
  res
) => {
  const id = req.params.id;
  if (!validateId(req, res, id)) return;

  const sponsoring = await db.sponsoring.findByPk(id);
  if (!sponsoring)
    return res.status(400).send("This sponsoring doesn't exists");

  const validations = await db.validation_sponsoring.findAll({
    where: {
      sponsoring_id: id,
    },
    include: {
      model: db.administrateur,
      attributes: ["nom"],
    },
    order: [["createdAt", "ASC"]],
  });

  res.status(200).send(validations);
};
ValidationSponsoringController.getOneSponsoringValidation = async (
  req,
  res
) => {
  const id = req.params.id;
  if (!validateId(req, res, id)) return;
  const validation = await db.validation_sponsoring.findByPk(id);
  if (!validation)
    return res.status(400).send("This validation doesn't exists");

  res.status(200).send(validation);
};

ValidationSponsoringController.deleteValidationSponsoring = async (
  req,
  res
) => {
  const { id } = req.params;
  const { user } = req;
  if (!validateId(req, res, id)) return;
  //   check if the validation exists
  const validation = await db.validation_sponsoring.findByPk(id);
  if (!validation)
    return res.status(400).send("This validation doesn't exists");
  //   get the sponsoring
  const sponsoring = await db.sponsoring.findByPk(validation.sponsoring_id);

  const validations = await db.validation_sponsoring.findAll({
    where: {
      sponsoring_id: validation.sponsoring_id,
      administrateur_id: user.id,
    },
    order: [["updatedAt", "DESC"]],
  });

  const isLastValidation = validations.length === 1;
  if (user.role === roles.ADMIN) {
    if (isLastValidation) {
      sponsoring.etat = etat.ATENTE;
    } else {
      sponsoring.etat = validations[1].etat;
    }
  }
  await validation.destroy();
  await sponsoring.save();
  res.status(200).send(validations);
};

module.exports = ValidationSponsoringController;
