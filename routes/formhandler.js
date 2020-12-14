const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");

// to post contacts
router.post("/contact", (req, res) => {
  const contact = new Contact(req.body);
  contact
    .save()
    .then((result) => {
      console.log("data has been submitted");
      res.render("contact", {
        contacted: true,
        layout: "./main.hbs",
      });
    })
    .catch((err) => console.log(err));
});

module.exports = router;
