const express = require("express");
const cats = require("../config/cats");
const { Cat } = require("../models/Cat");
const Cart = require("../models/Cart");

const router = express.Router();

router.get("/", (req, res) => {
  Cat.find()
    .lean()
    .then((result) => {
      res.render("index", {
        cats: result,
        message: req.flash("message"),
      });
    })
    .catch((err) => console.log(err));
});

router.get("/testing", (req, res) => {
  res.render("testing", {
    cats: cats,
  });
});
router.get("/contact", (req, res) => {
  res.render("contact", {
    cats: cats,
  });
});

router.get("/checkout", (req, res) => {
  if (!req.session.cart) {
    req.flash("message", "Awin andr araha tha ray tu to");
    return res.redirect("/");
  }
  const cart = new Cart(req.session.cart);
  array = cart.generateArray();
  const stringifiedArray = JSON.stringify(array);

  res.render("checkout", {
    totalPrice: cart.totalPrice,
    totalQuantity: cart.totalQuantity,
  });
});

router.get("/cart", (req, res) => {
  Cat.find()
    .lean()
    .then((result) => {
      if (!req.session.cart) {
        return res.render("cart", {
          cats: result,
          products: null,
        });
      }
      const cart = new Cart(req.session.cart);
      res.render("cart", {
        cats: result,
        products: cart.generateArray(),
        totalPrice: cart.totalPrice,
      });
    })
    .catch((err) => console.log(err));
});

router.get("/single/:name", (req, res) => {
  console.log(req.params.name);
  Cat.findOne({ categoryName: req.params.name })
    .lean()
    .then((result) => {
      // getting all other categories
      Cat.find()
        .lean()
        .then((cats) => {
          console.log(cats);
          res.render("single", {
            result: result,
            cats: cats,
            message: req.flash("message"),
          });
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
});

router.get("/paid/:state", (req, res) => {
  let state = req.params.state;
  let paid;
  if (state == "true") {
    paid = true;
  } else {
    paid = false;
  }
  res.render("paid", {
    paid: paid,
    message: req.flash("message"),
  });
});

router.get("/donate", (req, res) => {
  res.render("donate", {
    message: req.flash("message"),
  });
});

module.exports = router;
