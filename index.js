// modules
const Express = require("express");
const logger = require("morgan");
const sequelize = require("./src/models");
const router = require("./src/routes/v1");
const error = require("./src/middlewares/error");
const logging = require("./src/util/logging");
const cors = require("cors");
const http = require("http");
const path = require("path");
const fs = require("fs");
const { Server } = require("socket.io");
const multer = require("multer");

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
const PORT = process.env.SERVER_PORT || "1998";

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

// multer
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "/uploads/"));
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.originalname.replace(path.extname(file.originalname), "") +
        "-" +
        Date.now() +
        path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });
const fileUpload = upload.fields([{ name: "file", maxCount: 1 }]);

app.use("/upload", fileUpload, (req, res) => {
  res.status(200).send({ url: req.files.file[0].filename });
});

// static files serving
app.use(Express.static("uploads"));

// remove files
app.delete("/remove", async (req, res) => {
  try {
    const filePath = "./uploads/" + path.basename(req.body.url);
    await fs.unlinkSync(filePath);
    res.status(200).send({ isRemoved: "true" });
  } catch (error) {
    console.log(error);
  }
});

//router
app.use("/api/v1/", router);

// Server and Db
sequelize.sync().then(
  server.listen(PORT, () => {
    console.log(`app listening at port ${PORT}...`);
  })
);
