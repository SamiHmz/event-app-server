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

  if ((req.user.type = typeUtilisateur.INITIATEUR)) {
    var notifictions = await db.notification_initiateur.findAll({
      limit: limit,
      offset: offset,
      where: {
        initiateur_id: req.user.id,
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
  }
  res.status(200).send({ count });
};

NotificationController.setAllToViewed = async (req, res) => {
  var result = null;
  if (req.user.type === typeUtilisateur.INITIATEUR) {
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
    res.status(200).send(result);
  }
};

module.exports = NotificationController;
