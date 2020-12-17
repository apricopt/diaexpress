const session = require("express-session");

module.exports = function (req, res, next) {
  if (req.session.loggedin) {
    // if (true) {
    console.log("User was logged in");
    next();
  } else {
    console.log("awin andr agya ");
    res.status(401).redirect("/admin/login");
  }
};
