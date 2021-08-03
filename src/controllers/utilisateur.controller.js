const joi = require("joi");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const {
  roles,
  typeInitiateur,
  typeUtilisateur,
} = require("../models/config/magic_strings");
const userRoles = Object.values(roles);
require("dotenv").config();

const db = require("../models").dbModels;
var limit = 10;

const schema = {};
const UtilisateurController = {};

/*****************************Users Util Functions ****************************************/

/************************* Data Validation r*****************************/

var initiateurSchema = joi.object({
  nom: joi.string().required(),
  email: joi.string().email().required(),
  password: joi.string().required(),
  telephone: joi.number().required(),
  photo: joi.string().allow(null, ""),
  type: joi
    .string()
    .required()
    .valid(...typeInitiateur),
});

var administrateurSchema = joi.object({
  nom: joi.string().required(),
  prenom: joi.string().required(),
  email: joi.string().email().required(),
  password: joi.string().required(),
  telephone: joi.number().required(),
  photo: joi.string().allow(null, ""),
  role: joi
    .number()
    .required()
    .valid(...userRoles),
});

const typeAndIdSchema = joi.object({
  type: joi
    .string()
    .required()
    .valid(typeUtilisateur.ADMINISTRATEUR, typeUtilisateur.INITIATEUR),
  id: joi.number().required(),
});

const typeSchema = joi.object({
  type: joi
    .string()
    .required()
    .valid(typeUtilisateur.ADMINISTRATEUR, typeUtilisateur.INITIATEUR),
});

const loginSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().required(),
});

UtilisateurController.createNewUser = async (req, res) => {
  const { body } = req;
  const userType = req.params.type;
  var result = null;
  // validate user type url param
  result = typeSchema.validate({ type: userType });
  if (result.error)
    return res.status(400).send(result.error.details[0].message);
  //validate the body of the request
  if (userType === typeUtilisateur.INITIATEUR) {
    result = initiateurSchema.validate(body);
  } else {
    result = administrateurSchema.validate(body);
  }
  if (result.error)
    return res.status(400).send(result.error.details[0].message);

  const salt = await bcrypt.genSalt(10);
  body.password = await bcrypt.hash(body.password, salt);

  //create the user
  user = await db[userType].create(body);

  // const token = jwt.sign(
  //   { id: user.id, role: user.role, type: userType, nom: user.nom },
  //   process.env.jwtKey
  // );
  res.status(201).send(user);
};

UtilisateurController.authenticateUser = async (req, res) => {
  const { body } = req;
  const userType = req.params.type;
  var result = null;

  result = typeSchema.validate({ type: userType });
  if (result.error)
    return res.status(400).send(result.error.details[0].message);

  result = loginSchema.validate(body);
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

  const token = jwt.sign(
    { id: user.id, role: user.role, nom: user.nom, type: userType },
    process.env.jwtKey
  );

  res.status(200).send(token);
};

UtilisateurController.getOneUser = async (req, res) => {
  // validate url params
  const result = typeAndIdSchema.validate(req.params);
  if (result.error)
    return res.status(400).send(result.error.details[0].message);
  // check user existence
  const user = await db[req.params.type].findByPk(req.params.id);

  if (!user) return res.status(400).send("this user doesn't exits");

  res.status(200).send(_.omit(user.dataValues, ["password"]));
};

UtilisateurController.getAllUsers = async (req, res) => {
  var offset = (req.params.pageNumber - 1) * limit;

  var users = await db.initiateur.findAll({
    limit: limit,
    offset: offset,
    attributes: { exclude: ["password"] },
  });

  res.status(200).send(users);
};

UtilisateurController.updateUser = async (req, res) => {
  var { body } = req;
  var initiateurupdateSchema = joi.object({
    nom: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string(),
    telephone: joi.number().required(),
    photo: joi.string().allow(null, ""),
    type: joi
      .string()
      .required()
      .valid(...typeInitiateur),
  });

  // validate url params
  var result = typeAndIdSchema.validate(req.params);
  if (result.error)
    return res.status(400).send(result.error.details[0].message);
  //check body
  result = initiateurupdateSchema.validate(body);
  if (result.error)
    return res.status(400).send(result.error.details[0].message);

  // check user existence
  const user = await db[req.params.type].findByPk(req.params.id);
  if (!user) return res.status(400).send("this user doesn't exits");
  if (body.password) {
    const salt = await bcrypt.genSalt(10);
    body.password = await bcrypt.hash(body.password, salt);
  } else {
    body = _.omit(body, ["password"]);
  }
  Object.keys(body).forEach((prop) => {
    user[prop] = body[prop];
  });
  await user.save();
  res.status(200).send(_.omit(user.dataValues, ["password"]));
};

UtilisateurController.getAllUserCount = async (req, res) => {
  var count = 0;

  count = await db.initiateur.count();

  res.status(200).send({ count });
};

UtilisateurController.deleteUser = async (req, res) => {
  // validate url params
  const result = typeAndIdSchema.validate(req.params);
  if (result.error)
    return res.status(400).send(result.error.details[0].message);
  // check user existence
  const user = await db[req.params.type].findByPk(req.params.id);

  if (!user) return res.status(400).send("this user doesn't exits");

  await user.destroy();

  res.status(200).send(_.omit(user.dataValues, ["password"]));
};

module.exports = UtilisateurController;
