// modules
const Express = require("express");

const logger = require("morgan");
const sequelize = require("./src/models");
const router = require("./src/routes/v1");
const error = require("./src/middlewares/error");
const logging = require("./src/util/logging");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = Express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// envirment variable
require("dotenv").config();

//winston
logging();

// variable
const PORT = process.env.SERVER_PORT || "1997";

// midlleware
app.use(cors());
app.use(Express.json());
app.use(logger("dev"));

// error handler
app.use(error);

// socket

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("join", (room) => {
    socket.join(room);
  });
});

// place this middleware before any other route definitions
// makes io available as req.io in all request handlers
app.use(function (req, res, next) {
  req.io = io;
  next();
});

//router
app.use("/api/v1/", router);

// Server and Db
sequelize.sync({ force: true }).then(
  server.listen(PORT, () => {
    console.log(`app listening at port ${PORT}...`);
  })
);
