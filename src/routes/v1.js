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
const SponsoringController = require("../controllers/sponsoring.controller");
const ValidationSponsoringController = require("../controllers/validation_sponsoring.controller");
const DashboardController = require("../controllers/dashboard.controller");
require("express-async-errors");

/************************ Users Routes **************/
router.post("/signup/:type", UtilisateurController.createNewUser);
router.post("/login/:type", UtilisateurController.authenticateUser);
router.get("/user/:type/:id", UtilisateurController.getOneUser);
router.delete("/user/:type/:id", UtilisateurController.deleteUser);
router.get("/users/count", UtilisateurController.getAllUserCount);
router.get(
  "/users/:pageNumber/:search/:filter",
  UtilisateurController.getAllUsers
);
router.put("/user/:type/:id", UtilisateurController.updateUser);

/*************************Evenement Routes ******************/
router.use(auth);
router.get(
  "/evenements/:pageNumber/:search/:filter",
  EvenementController.getAllEvenement
);
router.post("/evenement", EvenementController.createEvenement);
router.get("/evenement/:id", EvenementController.getOneEvenement);
router.put("/evenement/:id", EvenementController.updateEvenement);
router.delete("/evenement/:id", EvenementController.deleteEvenement);
router.put("/demande/opened/:id", EvenementController.changeDemandeIsOpened);
router.get("/demande/opened/:id", EvenementController.getIsOpened);
router.get(
  "/demande/:pageNumber/:search/:filter",
  EvenementController.getAllDemandes
);
router.get("/demandes/count", EvenementController.getDemandesCount);
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
router.put("/bilan/validate/:id", BilanController.validateBilan);
router.put("/bilan/:id", BilanController.updateBilan);
router.get("/bilan/:id", BilanController.getOneBilan);
router.get("/bilans/count", BilanController.getAllbilanCount);
router.get("/bilans/:pageNumber/:search/:filter", BilanController.getAllBilans);
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
  "/intervenants/:pageNumber/:search/:filter",
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

/************************* Sponsoring ************************/
router.post("/sponsoring", SponsoringController.createSponsoring);
router.put(
  "/sponsoring/opened/:id",
  SponsoringController.changeSponsoringIsOpened
);
router.get(
  "/sponsoring/opened/:id",
  SponsoringController.getSponsoringIsOpened
);
router.get(
  "/sponsorings/:pageNumber/:search/:filter",
  SponsoringController.getAllSponsoring
);
router.get("/sponsoring/count", SponsoringController.getAllSponsoringCount);
router.get("/sponsoring/:id", SponsoringController.getOneSponsoring);

router.delete("/sponsoring/:id", SponsoringController.deleteSponsoring);
router.put("/sponsoring/:id", SponsoringController.updateSponsoring);

/************************* Sponsoring Validation ************************/

router.post(
  "/sponsorings/validation",
  ValidationSponsoringController.createSponsoringValidation
);
router.put(
  "/sponsorings/validation/:id",
  ValidationSponsoringController.updateSponsoringValidation
);
router.get(
  "/sponsorings/validations/:id",
  ValidationSponsoringController.getAllSponsoringValidation
);
router.get(
  "/sponsorings/validation/:id",
  ValidationSponsoringController.getOneSponsoringValidation
);
router.delete(
  "/sponsorings/validation/:id",
  ValidationSponsoringController.deleteValidationSponsoring
);
router.get("/dashboard", DashboardController.getDashboadData);

/******************** Dashboard *********************/

module.exports = router;
