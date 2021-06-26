var { devDb, prodDb } = require("./config/db.config");
var { connectToDatabase, importAllModels } = require("./config/util");

require("dotenv/config");

var sequelize = process.env.NODE_ENV === "dev" ? devDb() : prodDb();

connectToDatabase(sequelize);

importAllModels(sequelize, __dirname);

module.exports = sequelize;
