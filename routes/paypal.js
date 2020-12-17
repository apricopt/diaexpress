const express = require("express");
const paypal = require("paypal-rest-sdk");
const router = express.Router();
const axios = require("axios");
const Cart = require("../models/Cart");
const Order = require("../models/Order");

// for testing
// paypal.configure({
//   mode: "sandbox", //sandbox or live
//   client_id:
//     "ARMxqU6CNz_slWFJdYrr8mzQTxpVAEmDvfxNzPPFjOlgFf1ryZVeTJGQ599NrPGkCr15CRrmed3gCdBg",
//   client_secret:
//     "EK6WzJV2U73nKiqFRQG5EyaXH1phMEbVX056HTwn2o8pzO_H3BnqaToY4Q5koREyvyrKqZn8eXxogdHO",
// });

// for live mode
paypal.configure({
  mode: "live", //sandbox or live
  client_id:
    "AZ2TWSbrGsjHHGINwWHWnosbbzdyfTHx52t9KLCZXJqStsoaIJZf6t2-NiuNyMLMXxjWoEW-4V_7ceLV",
  client_secret:
    "EL2Gi9koFe5ha63YFxai9oXp3H3Jylpc_RGnopEj5olEZ6gPNXFPRoixcY25LOXcVLRD4S9_C-THoMaL",
});

router.get("/", (req, res) => {
  res.send("paypal route is working");
});

// to create the payment and redirect the user to pay the amount
router.post("/pay", (req, res) => {
  console.log(req.body);
  const cart = new Cart(req.session.cart);

  const qty = cart.totalQuantity;
  const totalPrice = cart.totalPrice;
  const items = cart.generateArray();

  const dataToPush = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    address: req.body.address,
    address2: req.body.address2,
    zip: req.body.zip,
    totalPrice: totalPrice,
    totalQuantity: qty,
    items: cart.generateArray(),
  };

  // creating a json object
  var create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
    },
    redirect_urls: {
      return_url: "http://localhost:5000/paypal/success",
      cancel_url: "http://localhost:5000/paypal/failed",
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: req.body.firstName,
              sku: req.body.email,
              price: parseInt(totalPrice),
              currency: "USD",
              quantity: 1,
            },
          ],
        },
        amount: {
          currency: "USD",
          total: parseInt(totalPrice),
        },
        description: "This is the payment description.",
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
      const order = new Order(dataToPush);
      order
        .save()
        .then((result) => {
          console.log(order);
        })
        .catch((err) => console.log(err));

      // sending ends.
      for (i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === "approval_url") {
          console.log("IF k andr agya");
          //   sned the link back or redirect depending on the situation just the thing is that user need to be redirected to the following link so he can pay
          res.send(payment.links[i].href);
        }
      }
    }
  });
});

// if the payment was successfull then to execute the payment

router.get("/success", (req, res) => {
  console.log(req.query);
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;
  const token = req.query.token;
  let amount;

  // axios
  //   .get(
  //     `https://strapi.ihaveavisionfilms.com/orders?paymentId_eq=${paymentId}`
  //   )
  //   .then((response) => {
  //     console.log("yeh aya response id dhoondnay ka");
  //     console.log(response);

  //     amount = response.data[0].price;

  //     console.log(amount);
  //     axios
  //       .put(
  //         `https://strapi.ihaveavisionfilms.com/orders/${response.data[0].id}`,
  //         { paid: true }
  //       )
  //       .then((response) => {
  //         console.log("updated paid", response);
  //       })
  //       .catch((err) => console.log("Unable to update the paid status", err));

  // const execute_payment_json = {
  //       payer_id: payerId,
  //       transactions: [
  //         {
  //           amount: {
  //             currency: "USD",
  //             total: amount,
  //           },
  //         },
  //       ],
  //     };

  // paypal.payment.execute(
  //   paymentId,
  //   execute_payment_json,
  //   function (error, payment) {
  //     if (error) {
  //       console.log(error.response);
  //       throw error;
  //     } else {
  //       console.log("got payment response");
  //       console.log(payment);
  //       if (payment.state == "approved") {
  //         res.redirect("https://estore.ihaveavisionfilms.com?success");
  //       } else {
  //         res.redirect("https://estore.ihaveavisionfilms.com?failed");
  //       }
  //     }
  //   }
  // );
  //   })
  //   .catch((err) => console.log(err));
  // first finding the price to  deduct
  Order.findOne({ paymentId: paymentId }).then((result) => {
    const amount = result.totalPrice;
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
            Order.findOneAndUpdate(
              { paymentId: paymentId },
              { $set: { paid: true } }
            )
              .then((result) => {
                console.log("yeh aya g result status ka ", result);
                res.redirect("http://localhost:5000/paid/true");
              })
              .catch((err) => {
                console.log(err);
              });
          } else {
            res.redirect("http://localhost:5000/paid/false");
          }
        }
      }
    );
  });
  console.log("yeh rahi amount " + amount);
});

// if the payment is failed then
router.get("/failed", (req, res) => {
  res.redirect("http://localhost:5000/paid/false");
});

module.exports = router;
