var fs = require("fs");
var path = require("path");
var Sequelize = require("sequelize");
const dbModels = {};

function importAllModels(sequelize, dirname) {
  fs.readdirSync(dirname).forEach((file) => {
    var modelPath = path.join(dirname, file);

    if (file.indexOf("model.js") >= 0) {
      var model = require(modelPath)(sequelize, Sequelize.DataTypes);
      dbModels[model.name] = model;
    }
  });
  Object.keys(dbModels).forEach((name) => {
    if (dbModels[name].associate) {
      dbModels[name].associate(dbModels);
    }
  });
  sequelize.dbModels = dbModels;
}

async function connectToDatabase(sequelize) {
  try {
    console.log();
    await sequelize.authenticate();
    console.log("Connection to the db has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

module.exports = {
  connectToDatabase,
  importAllModels,
};
