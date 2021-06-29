// modules
const Express = require("express");
const logger = require("morgan");
const sequelize = require("./src/models");
const router = require("./src/routes/v1");
const error = require("./src/middlewares/error");
const logging = require("./src/util/logging");
const cors = require("cors");

// envirment variable
require("dotenv").config();

//winston
logging();

// variable
const app = Express();
const PORT = process.env.SERVER_PORT || "1997";

// midlleware
app.use(cors());
app.use(Express.json());
app.use(logger("dev"));

//router
app.use("/api/v1/", router);

// error handler
app.use(error);

// Server and Db
sequelize.sync({ sync: true }).then(
  app.listen(PORT, () => {
    console.log(`app listening at port ${PORT}...`);
  })
);
