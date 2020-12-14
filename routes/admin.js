const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");
const { Cat } = require("../models/Cat");
const Product = require("../models/Cat");
const checkAuth = require("../middleware/auth");
const User = require("../models/User");

router.get("/login", (req, res) => {
  res.render("admin/login", {
    layout: "adminLayout",
  });
});

router.post("/loginauth", async (req, res) => {
  try {
    const user = await User.find({ email: "dia@apricopt.com" }).lean();
    console.log(user);
    console.log(req.body);
    if (user[0].password != req.body.password) {
      res.send("Wrong password");
    } else if (user[0].email != req.body.email) {
      res.send("Wrong Email Address");
    } else {
      req.session.loggedin = true;
      console.log(req.session.loggedin);
      res.redirect("/admin");
    }
  } catch (error) {
    console.log(error);
  }
});

router.get("/", checkAuth, async (req, res) => {




  res.render("admin/index", {
    layout: "adminLayout",
  });
});

router.get("/contact", checkAuth, (req, res) => {
  Contact.find()
    .lean()
    .then((result) => {
      res.render("admin/contact", {
        layout: "adminLayout",
        data: result,
      });
    })
    .catch((err) => console.log(err));
});

router.get("/categories", checkAuth, (req, res) => {
  Cat.find()
    .lean()
    .then((data) => {
      res.render("admin/cats", {
        layout: "adminLayout",
        data: data,
        message: req.flash("message"),
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get("/products", checkAuth, (req, res) => {
  (async () => {
    const cats = await Cat.find().lean();
    res.render("admin/products", {
      layout: "adminLayout",
      data: cats,
      message: req.flash("message"),
    });
  })();
});

router.get("/orders", checkAuth, (req, res) => {
  res.render("admin/orders", {
    layout: "adminLayout",
  });
});

// below will be the action
router.post("/contact/editone", (req, res) => {
  console.log(req.body);
  (async () => {
    try {
      let response = await Contact.findOneAndUpdate(
        { _id: req.body.id },
        {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email,
          subject: req.body.subject,
          message: req.body.message,
        }
      );
      res.redirect("/admin/contact");
    } catch (error) {
      console.log(error);
    }
  })();
});

router.post("/contact/deleteone", (req, res) => {
  console.log(req.body);
  Contact.deleteOne({ _id: req.body.id })
    .then((result) => {
      res.send("deleted");
    })
    .catch((err) => console.log(err));
});

router.get("/logout", checkAuth, (req, res) => {
  req.session.loggedin = false;
  res.redirect("/admin");
});

module.exports = router;
