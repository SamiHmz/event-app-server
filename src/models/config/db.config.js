var Sequelize = require("sequelize");

const devDb = function () {
  return new Sequelize(
    process.env.PG_DATABASE,
    process.env.PG_USER,
    process.env.PG_PASSWORD,
    {
      host: process.env.PG_HOST,
      dialect: "postgres",
      logging: false,
    }
  );
};
const prodDb = function () {
  return new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  });
};

module.exports = {
  devDb,
  prodDb,
};
