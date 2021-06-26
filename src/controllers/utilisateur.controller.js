const joi = require("joi");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const { roles } = require("./controllers.util");
require("dotenv").config();

const db = require("../models").dbModels;

const schema = {};
const UtilisateurController = {};

/*****************************Users Util Functions ****************************************/

/************************* Data Validation r*****************************/
var generalSchema = {
  nom: joi.string().required(),
  prenom: joi.string().required(),
  email: joi.string().email(),
  password: joi.string().required(),
  numero: joi.number().required(),
  photo: joi.string().allow(null, ""),
  type_id: joi.number().required(),
  type: joi.string().required().valid("utilisateur", "initiateur"),
  id: joi.number().required(),
};

schema.typeAndId = joi.object(_.pick(generalSchema, ["type", "id"]));

schema.type = joi.object(_.pick(generalSchema, ["type"]));

schema.utilisateurCreate = joi.object(
  _.assignIn(_.omit(generalSchema, ["type", "id", "type_id"]), {
    role: joi
      .string()
      .required()
      .valid(roles.SUPER_ADMIN, roles.ADMIN, roles.SIMPLE),
  })
);
schema.initiateurCreate = joi.object(
  _.assignIn(_.omit(generalSchema, ["type", "id", "prenom"]), {
    role: joi.string().required().valid(roles.ADMIN, roles.SIMPLE),
  })
);

schema.login = joi.object(_.pick(generalSchema, ["email", "password"]));

UtilisateurController.createNewUser = async (req, res) => {
  const { body } = req;
  const userType = req.params.type;
  var result = null;
  // validate user type url param
  result = schema.type.validate({ type: userType });
  if (result.error)
    return res.status(400).send(result.error.details[0].message);

  //validate the body of the request
  result = schema[userType + "Create"].validate(body);
  if (result.error)
    return res.status(400).send(result.error.details[0].message);

  const salt = await bcrypt.genSalt(10);
  body.password = await bcrypt.hash(body.password, salt);

  //create the user
  user = await db[userType].create(body);

  const token = jwt.sign(
    { id: user.id, role: user.role, type: userType },
    process.env.jwtKey
  );
  res.status(201).send(token);
};

UtilisateurController.authenticateUser = async (req, res) => {
  const { body } = req;
  const userType = req.params.type;
  var result = null;

  result = schema.type.validate({ type: userType });
  if (result.error)
    return res.status(400).send(result.error.details[0].message);

  result = schema.login.validate(body);
  if (result.error)
    return res.status(400).send(result.error.details[0].message);

  const user = await db[userType].findOne({
    where: {
      email: body.email,
    },
  });

  if (!user) return res.status(400).send("Invalid Email or Password");

  const validatePassword = await bcrypt.compare(body.password, user.password);
  console.log(validatePassword);

  if (!validatePassword)
    return res.status(400).send("Invalid email or password");

  const token = jwt.sign({ id: user.id, role: user.role }, process.env.jwtKey);

  res.status(200).send(token);
};

UtilisateurController.getOneUser = async (req, res) => {
  // validate url params
  const result = schema.typeAndId.validate(req.params);
  if (result.error)
    return res.status(400).send(result.error.details[0].message);
  // check user existence
  const user = await db[req.params.type].findByPk(req.params.id);

  if (!user) return res.status(400).send("this user doesn't exits");

  res.status(200).send(_.omit(user.dataValues, ["password"]));
};

UtilisateurController.getAllUsers = async (req, res) => {
  const userType = req.params.type;

  // validate user type url param
  result = schema.type.validate({ type: userType });
  if (result.error)
    return res.status(400).send(result.error.details[0].message);

  var users = await db[userType].findAll();

  if (users.length == 0)
    return res.status(400).send("Theres is no user registred");

  users = users.map((user) => _.omit(user.dataValues, ["password"]));
  res.status(200).send(users);
};

UtilisateurController.updateUser = async (req, res) => {
  // validate url params
  const result = schema.typeAndId.validate(req.params);
  if (result.error)
    return res.status(400).send(result.error.details[0].message);
  // check user existence
  const user = await db[req.params.type].findByPk(req.params.id);
  if (!user) return res.status(400).send("this user doesn't exits");

  // validate body
};

module.exports = UtilisateurController;
