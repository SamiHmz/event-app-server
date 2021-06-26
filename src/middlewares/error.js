const winston = require("winston");

module.exports = (error, req, res, next) => {
  winston.error(error.message, error);

  if (error.name === "SequelizeUniqueConstraintError") {
    return res.status(400).send(error.errors[0].message);
  }
  if (error.name === "JsonWebTokenError") {
    return res.status(400).send("Invalid token");
  }

  res.status(500).send(error.message);
};
