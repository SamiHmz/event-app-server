const joi = require("joi");
const db = require("../models").dbModels;
const _ = require("lodash");
const { validateId } = require("./controllers.util");

const BilanController = {};

const schema = joi.object({
  article: joi.string().required(),
  ppt_presentation: joi.string().required(),
  participants_intern: joi.number().required(),
  participants_extern: joi.number().required(),
  evenement_id: joi.number().required(),
  problem: joi.string(),
});

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

  var bilan = await db.bilan.findOne({
    where: {
      evenement_id: body.evenement_id,
    },
  });

  if (bilan) return res.status(400).send("This Evenement already has a Bilan");

  bilan = await db.bilan.create(body);

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
  });

  if (!bilan) return res.status(400).send("This Evenement already has a Bilan");

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

  res.status(200).send(bilan);
};

BilanController.getOneBilan = async (req, res) => {
  const id = req.params.id;
  if (!validateId(req, res, id)) return;

  var bilan = null;
  if (req.user.is_admin) {
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
  bilan = _.omit(bilan.dataValues, ["evenement"]);
  res.status(200).send(bilan);
};

BilanController.getAllBilans = async (req, res) => {
  var bilans = null;
  if (req.user.is_admin) {
    bilans = await db.bilan.findAll();
  } else {
    bilans = await db.bilan.findAll({
      include: {
        model: db.evenement,
        where: {
          initiateur_id: req.user.id,
        },
      },
    });
  }

  if (bilans.lenght == 0)
    return res.status(400).send("There is no registred bilan");
  bilans = bilans.map((bilan) => _.omit(bilan.dataValues, ["evenement"]));
  res.status(200).send(bilans);
};

BilanController.deleteBilan = async (req, res) => {
  const id = req.params.id;
  if (!validateId(req, res, id)) return;

  var bilan = null;
  if (req.user.is_admin) {
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
  res.status(200).send(bilan);
};
module.exports = BilanController;
