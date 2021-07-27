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

const createIntervenantNotification = async (
  req,
  type_utilisateur,
  intervenant,
  role_admin
) => {
  var room = null;
  var notification = null;
  if (type_utilisateur === typeUtilisateur.ADMINISTRATEUR) {
    // get  Adminstrateur admin id
    const administrateur = await db.administrateur.findOne({
      where: {
        role: role_admin,
      },
    });
    if (administrateur) {
      notification = await db.notification_administrateur.create({
        details: ` a ${req.body.etat} un intervenant  ${intervenant.prenom} ${intervenant.nom}  `,
        lien: `/intervenants/${intervenant.id}`,
        administrateur_id: administrateur.id,
        nom: req.user.nom,
      });
    }
    // Adminstrateur  room
    room = `${typeUtilisateur.ADMINISTRATEUR}-${administrateur.id}`;
  } else {
    //get initiateur id
    const evenement = await db.evenement.findByPk(intervenant.evenement_id);

    // create initiateur notification
    notification = await db.notification_initiateur.create({
      details: ` a  ${req.body.etat} votre intervenant ${intervenant.prenom} ${intervenant.nom} `,
      lien: `/intervenants/${intervenant.id}`,
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
    } else {
      if (body.etat === etat.REJETER) {
        intervenant.etat = body.etat;
      } else if (
        body.etat === etat.APROUVER &&
        intervenant.etat === etat.REJETER
      ) {
        intervenant.etat = etat.ATENTE;
      }
      await createIntervenantNotification(
        req,
        typeUtilisateur.ADMINISTRATEUR,
        intervenant,
        roles.ADMIN
      );
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
    await createIntervenantNotification(
      req,
      typeUtilisateur.ADMINISTRATEUR,
      intervenant,
      roles.SUPER_ADMIN
    );
  } else if (user.role === roles.SUPER_ADMIN) {
    intervenant.etat_super_admin = body.etat;
    intervenant.etat = body.etat;
  }

  // initiateur notification
  await createIntervenantNotification(
    req,
    typeUtilisateur.INITIATEUR,
    intervenant
  );

  await intervenant.save();

  body.administrateur_id = req.user.id;
  var validation = await db.validation_intervenant.create(body);
  validation = await db.validation_intervenant.findByPk(validation.id, {
    include: {
      model: db.administrateur,
      attributes: ["nom"],
    },
  });
  res.status(201).send(validation);
};

ValidationIntervenantController.updateIntervenantValidation = async (
  req,
  res
) => {
  const { body, user } = req;
  const id = req.params.id;

  if (!validateId(req, res, id)) return;

  const result = schema.validate(body);
  if (result.error)
    return res.status(400).send(result.error.details[0].message);
  var intervenant = await db.intervenant.findByPk(body.intervenant_id);

  if (!intervenant) return res.status(400).send("Intervenant doesn't exist");
  console.log("validation itrevenant id", id);

  const validation = await db.validation_intervenant.findByPk(id);
  if (!validation)
    return res.status(400).send("This validation doesn't exists");

  Object.keys(body).forEach((prop) => {
    validation[prop] = body[prop];
  });

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
  await intervenant.save();
  await validation.save();
  res.status(200).send(validation);
};
ValidationIntervenantController.getAllIntervenantValidation = async (
  req,
  res
) => {
  const { user } = req;
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
ValidationIntervenantController.getOneIntervenantValidation = async (
  req,
  res
) => {
  const id = req.params.id;
  if (!validateId(req, res, id)) return;
  const validation = await db.validation_intervenant.findByPk(id);
  if (!validation)
    return res.status(400).send("This validation doesn't exists");

  res.status(200).send(validation);
};

ValidationIntervenantController.deleteValidationIntervenant = async (
  req,
  res
) => {
  const { id } = req.params;
  const { user } = req;
  if (!validateId(req, res, id)) return;
  // check if the validation exists
  const validation = await db.validation_intervenant.findByPk(id);
  if (!validation)
    return res.status(400).send("This validation doesn't exists");
  // get the intervenant
  const intervenant = await db.intervenant.findByPk(validation.intervenant_id);

  const validations = await db.validation_intervenant.findAll({
    where: {
      intervenant_id: validation.intervenant_id,
      administrateur_id: user.id,
    },
    order: [["updatedAt", "DESC"]],
  });

  const isLastValidation = validations.length === 1;
  if (user.role === roles.SUPER_ADMIN) {
    if (isLastValidation) {
      intervenant.etat = etat.ATENTE;
    } else {
      intervenant.etat = validations[1].etat;
    }
  }
  await validation.destroy();
  await intervenant.save();
  res.status(200).send(validations);
};

module.exports = ValidationIntervenantController;
