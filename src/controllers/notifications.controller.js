const db = require("../models").dbModels;
const { typeUtilisateur } = require("../models/config/magic_strings");
const { validateId } = require("./controllers.util");

const NotificationController = {};

var limit = 6;
NotificationController.createNotification = async (req, res) => {
  const notifiction = await db.notification_initiateur.create({
    details: req.body.details,
    lien: req.body.lien,
    initiateur_id: req.user.id,
    nom: "YANAR",
  });

  res.status(200).send(notifiction);
};

NotificationController.getAllNotifications = async (req, res) => {
  var offset = (req.params.pageNumber - 1) * limit;
  var notifictions = null;
  if (req.user.type == typeUtilisateur.INITIATEUR) {
    notifictions = await db.notification_initiateur.findAll({
      limit: limit,
      offset: offset,
      where: {
        initiateur_id: req.user.id,
      },
      order: [["createdAt", "DESC"]],
    });
  } else {
    notifictions = await db.notification_administrateur.findAll({
      limit: limit,
      offset: offset,
      where: {
        administrateur_id: req.user.id,
      },
      order: [["createdAt", "DESC"]],
    });
  }
  res.status(200).send(notifictions);
};

NotificationController.getUnviewedNotificationsCount = async (req, res) => {
  var count = 0;
  if (req.user.type === typeUtilisateur.INITIATEUR) {
    count = await db.notification_initiateur.count({
      where: {
        initiateur_id: req.user.id,
        is_viewed: false,
      },
    });
  } else {
    count = await db.notification_administrateur.count({
      where: {
        administrateur_id: req.user.id,
        is_viewed: false,
      },
    });
  }
  res.status(200).send({ count });
};

NotificationController.setAllToViewed = async (req, res) => {
  var result = null;
  if (req.user.type == typeUtilisateur.INITIATEUR) {
    result = await db.notification_initiateur.update(
      {
        is_viewed: true,
      },
      {
        where: {
          initiateur_id: req.user.id,
        },
      }
    );
  } else {
    result = await db.notification_administrateur.update(
      {
        is_viewed: true,
      },
      {
        where: {
          administrateur_id: req.user.id,
        },
      }
    );
  }
  res.status(200).send(result);
};

NotificationController.setNotificationToclicked = async (req, res) => {
  const { id } = req.params;

  if (!validateId(req, res, id)) return;

  var notification = null;

  if (req.user.type == typeUtilisateur.INITIATEUR) {
    notification = await db.notification_initiateur.findByPk(id);
  } else {
    notification = await db.notification_administrateur.findByPk(id);
  }

  notification.is_clicked = true;
  await notification.save();
  res.status(200).send(notification);
};

module.exports = NotificationController;
