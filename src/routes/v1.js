const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");

const UtilisateurController = require("../controllers/utilisateur.controller");
const EvenementController = require("../controllers/evenement.controller");
const ValidationEvenementController = require("../controllers/validation_evenement.controller");
const BilanController = require("../controllers/bilan.controller");
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

/************************* Evenement Validation *****************/

router.post("/validation", ValidationEvenementController.createValidation);
router.get("/validation/:id", ValidationEvenementController.getOneValidation);
router.get("/validations/:id", ValidationEvenementController.getAllValidation);
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

module.exports = router;
