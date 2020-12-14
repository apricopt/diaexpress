const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");


function addheaders(req, res, next) {
  res.header("Access-Control-Expose-Headers", "Content-Range");
  next();
}
// to get contacts 
router.get("/contact", addheaders, (req, res) => {
  let data;
  (async () => {
    try {
      data = await Contact.find().lean();
      //  data = JSON.parse(data);

      const sendingArray = data.map((item) => {
        return {
          id: item._id,
          firstName: item.firstName,
          lastName: item.lastName,
          email: item.email,
          subject: item.subject,
          message: item.message,
        };
      });
      res.header("Content-Range", `contacts 0-24/${sendingArray.length}`);

      res.send(sendingArray);
    } catch (error) {
      console.log(error);
    }
  })();
});

// to get one contact
router.get("/contact/:id", (req, res) => {
  console.log("G agya aek bnday ka poochnay ", req.params.id);
  if (req.params.id) {
    (async () => {
      try {
        result = await Contact.findOne({ _id: req.params.id }).lean();
        const toSend = {
          id: result._id,
          firstName: result.firstName,
          lastName: result.lastName,
          email: result.email,
          subject: result.subject,
          message: result.message,
        };
        res.send(toSend);
      } catch (error) {
        console.log(error);
      }
    })();
  } else {
    console.log("if params wali nahi chal rahi");
  }
});

// to create contacts
router.post("/contact", addheaders, (req, res) => {
  console.log(req.body);
  // Post from client
  if (req.body.client == "true") {
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
  } else {
    // Posting from react admin
    console.log("request form admin");
    const contact = new Contact(req.body);
    contact
      .save()
      .then((result) => {
        const elementToSend = {
          id: result._id,
          firstName: result.firstName,
          lastName: result.lastName,
          email: result.email,
          subject: result.subject,
          message: result.message,
        };
        console.log(elementToSend);
        res.send(elementToSend);
      })
      .catch((err) => console.log(err));
  }
});

// to delete one Also delete many work this way in react-admin
router.delete("/contact/:id", (req, res) => {
  Contact.deleteOne({ _id: req.params.id })
    .then((result) => {
      console.log("yeh ata hai result ", result);
      res.send(result);
    })
    .catch((err) => {
      console.log(err);
    });
});

// to update
router.put("/contact/:id", (req, res) => {
  console.log("put request recieved");
  console.log(req.body);
  // as react-admin sends the whole object so its good to replace the previous object with new one.
  const elementToSend = {
    id: req.body.id,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    subject: req.body.subject,
    message: req.body.message,
  };
  Contact.updateOne({ _id: req.params.id }, elementToSend)
    .then((result) => {
      console.log("yeh aya result", result);
      res.send(elementToSend);
    })
    .catch((err) => console.log(err));
});

module.exports = router;
