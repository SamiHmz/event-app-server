const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).send("Acsess denied , No token provided");

  const decoded = jwt.verify(token, process.env.jwtKey);
  req.user = decoded;
  next();
};
