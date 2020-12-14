const express = require("express");
const router = express.Router();
// importing the model
const { Cat } = require("../models/Cat");
const { Product } = require("../models/Cat");
const { upload } = require("../config/fileupload");
const Cart = require("../models/Cart");

// _____________________________CAtegories Management__________________)

//to createCategories
router.post("/cat/createone", (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      // console.log(err);
      res.render("admin/cats", {
        layout: "adminLayout",
        message: err,
      });
    } else {
      let img = req.file.path;
      let reachbalePath = img.replace("public", "");
      // console.log(req.body);
      const cat = new Cat({
        categoryName: req.body.categoryName,
        thumbnail: reachbalePath,
      });
      cat
        .save()
        .then((result) => {
          console.log("category created!!");
          req.flash("message", "Category has been created successfully!");
          res.redirect("/admin/categories");
        })
        .then((err) => {
          console.log(err);
        });
    }
  });
});

// to editone
router.post("/cat/editone", (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      // console.log(err);
      res.render("admin/cats", {
        layout: "adminLayout",
        message: err,
      });
    } else {
      let img = req.file.path;
      let reachbalePath = img.replace("public", "");
      (async () => {
        try {
          let response = await Cat.findOneAndUpdate(
            { _id: req.body.id },
            {
              categoryName: req.body.categoryName,
              thumbnail: reachbalePath,
            }
          );
          console.log("element updated");
          req.flash("message", "Category has been updated successfully!");
          res.redirect("/admin/categories");
        } catch (error) {
          console.log(error);
        }
      })();
    }
  });
});

// to deleteone
router.post("/cat/deleteone", (req, res) => {
  Cat.deleteOne({ _id: req.body.id })
    .then((result) => {
      req.flash("message", "Category has been deleted!!");
      res.redirect("/admin/categories");
    })
    .catch((err) => console.log(err));
});

// ____________________________Product Management_____________

// to push a product into category
router.post("/product/createone", (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      // console.log(err);
      res.render("admin/products", {
        layout: "adminLayout",
        message: err,
      });
    } else {
      let img = req.file.path;
      let reachbalePath = img.replace("public", "");

      console.log(req.body);
      const productToPush = {
        productName: req.body.productName,
        description: req.body.description,
        url: reachbalePath,
        price: req.body.price,
      };

      Cat.findOne({ _id: req.body.catId })
        .then((cat) => {
          console.log(cat);
          cat.products.push(productToPush);
          cat.save().then((result) => {
            req.flash("message", "Product has been added!");
            res.redirect("/admin/products");
          });
        })
        .catch((err) => console.log(err));
    }
  });
});
// to pull a product from categories
router.post("/product/deleteone", (req, res) => {
  console.log("delete wali recieved");
  console.log(req.body);
  (async () => {
    try {
      const cat = await Cat.findOne({
        products: { $elemMatch: { _id: req.body.id } },
      });
      cat.products.id(req.body.id).remove();
      const result = await cat.save();
      req.flash("message", "Product has been deleted!");
      res.redirect("/admin/products");
    } catch (error) {
      console.log(error);
    }
  })();
});

// ______________________________Cart Managment_____________________

router.get("/addtocart/:id", (req, res) => {
  const backURL = req.header("Referer") || "/";
  const productId = req.params.id;
  const cart = new Cart(req.session.cart ? req.session.cart : {});
  // finding the product into db
  (async () => {
    try {
      const cat = await Cat.findOne({
        products: { $elemMatch: { _id: productId } },
      });
      const productFound = cat.products.id(productId);

      cart.add(productFound, productId);
      req.session.cart = cart;
      console.log(req.session.cart);
      req.flash("message", "Item has been added into cart!");
      res.redirect(backURL);
    } catch (error) {
      console.log(error);
    }
  })();
});

router.get("/removefromcart/:id", (req, res) => {
  const productId = req.params.id;
  const cart = new Cart(req.session.cart ? req.session.cart : {});
  // finding the product into db
  (async () => {
    try {
      const cat = await Cat.findOne({
        products: { $elemMatch: { _id: productId } },
      });
      console.log(req.params.id);
      console.log(cat);
      const productFound = cat.products.id(productId);
      cart.remove(productFound, productId);
      req.session.cart = cart;
      console.log("after removing element for cart ", req.session.cart);
      res.redirect("/cart");
    } catch (err) {
      console.log(err);
    }
  })();
});

router.get("");

module.exports = router;
