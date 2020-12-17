const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");
const Donate = require("../models/Donate");
const paypal = require("paypal-rest-sdk");

// for live mode
paypal.configure({
  mode: "live", //sandbox or live
  client_id:
    "AZ2TWSbrGsjHHGINwWHWnosbbzdyfTHx52t9KLCZXJqStsoaIJZf6t2-NiuNyMLMXxjWoEW-4V_7ceLV",
  client_secret:
    "EL2Gi9koFe5ha63YFxai9oXp3H3Jylpc_RGnopEj5olEZ6gPNXFPRoixcY25LOXcVLRD4S9_C-THoMaL",
});

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

router.post("/donate", (req, res) => {
  console.log(req.body);

  const dataToPush = {
    name: req.body.name,
    email: req.body.email,
    amount: req.body.amount,
  };

  // creating a json object
  var create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
    },
    redirect_urls: {
      return_url: "http://localhost:5000/api/donate/success",
      cancel_url: "http://localhost:5000/api/donate/failed",
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: req.body.name,
              sku: req.body.email,
              price: parseInt(req.body.amount),
              currency: "USD",
              quantity: 1,
            },
          ],
        },
        amount: {
          currency: "USD",
          total: parseInt(req.body.amount),
        },
        description: "Donation",
      },
    ],
  };
  // json object ends

  // creating the payment
  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
      throw error;
    } else {
      console.log("Create Payment Response");
      // console.log(payment);
      // now we need to redirect the user to the approval link and to redirect we need to loop through the links

      // sending order to our database (Mongo)
      dataToPush.paymentId = payment.id;
      const donate = new Donate(dataToPush);
      donate
        .save()
        .then((result) => {
          console.log(result);
        })
        .catch((err) => console.log(err));

      // sending ends.
      for (i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === "approval_url") {
          console.log("IF k andr agya");
          //   sned the link back or redirect depending on the situation just the thing is that user need to be redirected to the following link so he can pay
          res.redirect(payment.links[i].href);
        }
      }
    }
  });
});

router.get("/donate/success", (req, res) => {
  console.log(req.query);
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;
  const token = req.query.token;
  let amount;

  // first finding the price to  deduct
  Donate.findOne({ paymentId: paymentId }).then((result) => {
    const amount = result.amount;
    const execute_payment_json = {
      payer_id: payerId,
      transactions: [
        {
          amount: {
            currency: "USD",
            total: parseInt(amount),
          },
        },
      ],
    };

    paypal.payment.execute(
      paymentId,
      execute_payment_json,
      function (error, payment) {
        if (error) {
          console.log(error.response);
          throw error;
        } else {
          console.log("got payment response");
          console.log(payment);
          if (payment.state == "approved") {
            // now updating the status of paid to true.
            Donate.findOneAndUpdate(
              { paymentId: paymentId },
              { $set: { paid: true } }
            )
              .then((result) => {
                console.log("yeh aya g result status ka ", result);
                req.flash(
                  "message",
                  "Thanks! Your Donation has been successfully received!!"
                );
                res.redirect("http://localhost:5000/donate");
              })
              .catch((err) => {
                console.log(err);
              });
          } else {
            req.flash("message", "Sorry Error occured while making donation");
            res.redirect("http://localhost:5000/donate");
          }
        }
      }
    );
  });
  console.log("yeh rahi amount " + amount);
});

router.get("/donate/failed", (req, res) => {
  req.flash("message", "Sorry Error occured while making donation.");
  res.redirect("http://localhost:5000/donate");
});

module.exports = router;
