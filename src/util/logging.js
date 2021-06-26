var winston = require("winston");

module.exports = function () {
  // winston
  winston.add(winston.transports.File, {
    filename: "log/logfile.log",
  });

  //global error handling
  winston.handleExceptions(
    new winston.transports.Console({ colorize: true, prettyPrint: true }),
    new winston.transports.File({ filename: "log/uncaughtException.log" })
  );
  process.on("unhandledRejection", (error) => {
    throw error;
  });
};
