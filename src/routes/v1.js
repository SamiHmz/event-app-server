const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");

const UtilisateurController = require("../controllers/utilisateur.controller");
const EvenementController = require("../controllers/evenement.controller");
const ValidationEvenementController = require("../controllers/validation_evenement.controller");
const BilanController = require("../controllers/bilan.controller");
const NotificationController = require("../controllers/notifications.controller");
const IntervenantController = require("../controllers/intervenant.controller");
const ValidationIntervenantController = require("../controllers/validation_intervenant.controller");
require("express-async-errors");

/************************ Users Routes **************/
router.post("/signup/:type", UtilisateurController.createNewUser);
router.post("/login/:type", UtilisateurController.authenticateUser);
router.get("/user/:type/:id", UtilisateurController.getOneUser);
router.get("/users/:type", UtilisateurController.getAllUsers);
router.put("/user/:type/:id", UtilisateurController.updateUser);

/*************************Evenement Routes ******************/
router.use(auth);
router.post("/evenement", EvenementController.createEvenement);
router.get("/evenement/:id", EvenementController.getOneEvenement);
router.get("/evenement/", EvenementController.getAllEvenement);
router.put("/evenement/:id", EvenementController.updateEvenement);
router.delete("/evenement/:id", EvenementController.deleteEvenement);
router.get("/demande/:pageNumber", EvenementController.getAllDemandes);
router.get("/demandes/count", EvenementController.getDemandesCount);
router.put("/demande/opened/:id", EvenementController.changeDemandeIsOpened);
router.get("/demande/opened/:id", EvenementController.getIsOpened);
router.get(
  "/evenements/nothappened",
  EvenementController.getAllNotHappenedEventYet
);

/************************* Evenement Validation *****************/

router.post("/validation", ValidationEvenementController.createValidation);
router.get("/validations/:id", ValidationEvenementController.getAllValidation);
router.get("/validation/:id", ValidationEvenementController.getOneValidation);
router.put("/validation/:id", ValidationEvenementController.updateValidation);
router.delete(
  "/validation/:id",
  ValidationEvenementController.deleteValidation
);

/*************************** bilan ********************/
router.post("/bilan", BilanController.createBilan);
router.put("/bilan/:id", BilanController.updateBilan);
router.get("/bilan/:id", BilanController.getOneBilan);
router.get("/bilans", BilanController.getAllBilans);
router.delete("/bilan/:id", BilanController.deleteBilan);

/************************* notifications ***********************/
router.post("/notification", NotificationController.createNotification);
router.get(
  "/notifications/:pageNumber",
  NotificationController.getAllNotifications
);

router.get(
  "/notification/count",
  NotificationController.getUnviewedNotificationsCount
);
router.put("/notification/viewed", NotificationController.setAllToViewed);
router.put(
  "/notification/clicked/:id",
  NotificationController.setNotificationToclicked
);
/************************* Intervenant ***********************/
router.post("/intervenant", IntervenantController.createIntervenant);
router.get(
  "/intervenants/:pageNumber",
  IntervenantController.getAllIntervenant
);
router.get("/intervenant/count", IntervenantController.getAllIntervenantCount);
router.delete("/intervenant/:id", IntervenantController.deleteIntervenant);
router.get("/intervenant/:id", IntervenantController.getOneIntervenant);
router.put("/intervenant/:id", IntervenantController.updateIntervenant);
router.put(
  "/intervenant/opened/:id",
  IntervenantController.changeIntervenantIsOpened
);
router.get(
  "/intervenant/opened/:id",
  IntervenantController.getIntervenantIsOpened
);

/*************************Intervenant validation************************/
router.post(
  "/intervenants/validation",
  ValidationIntervenantController.createIntervenantValidation
);
router.put(
  "/intervenants/validation/:id",
  ValidationIntervenantController.updateIntervenantValidation
);
router.get(
  "/intervenants/validations/:id",
  ValidationIntervenantController.getAllIntervenantValidation
);
router.get(
  "/intervenants/validation/:id",
  ValidationIntervenantController.getOneIntervenantValidation
);
router.delete(
  "/intervenants/validation/:id",
  ValidationIntervenantController.deleteValidationIntervenant
);

module.exports = router;
