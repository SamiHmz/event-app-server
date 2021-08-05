const joi = require("joi");
const db = require("../models").dbModels;
const { Op } = require("sequelize");

const util = {};

util.validateId = (req, res, id) => {
  var schema = joi.object({ id: joi.number().required() });
  const result = schema.validate({ id });
  if (result.error) {
    res.status(400).send(result.error.details[0].message);
    return false;
  }
  return true;
};

util.generateSearchQuery = (search) => {
  var querySearch = {};
  Object.keys(search).forEach((key) => {
    if (key == "initiateur") {
      querySearch["nom"] = {
        [Op.iLike]: `%${search[key]}%`,
      };
    } else if (key == "èvenement") {
      querySearch["intitulé"] = {
        [Op.iLike]: `%${search[key]}%`,
      };
    } else {
      querySearch[key] = {
        [Op.iLike]: `%${search[key]}%`,
      };
    }
  });
  return querySearch;
};
module.exports = util;
