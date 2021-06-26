const joi = require("joi");
const db = require("../models").dbModels;

const util = {};
util.etat = {
  ATENTE: "en attente",
  APROUVER: "approuvé",
  REJETER: "rejetè",
};
util.roles = {
  SUPER_ADMIN: "super admin",
  ADMIN: "admin",
  SIMPLE: "simple",
};

util.validateId = (req, res, id) => {
  var schema = joi.object({ id: joi.number().required() });
  const result = schema.validate({ id });
  if (result.error) {
    res.status(400).send(result.error.details[0].message);
    return false;
  }
  return true;
};

// util.checkIfExists = async (req,res,id,model) => {
//   const result = await db[model].findByPk(id);
//   if (!result) res.status(400).send("This result doesn't exists");
//   return result
// };
module.exports = util;
