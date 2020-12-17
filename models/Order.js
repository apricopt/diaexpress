const mongoose = require("mongoose");
const OrderSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
  },
  address: {
    type: String,
  },
  address2: {
    type: String,
  },
  zip: {
    type: String,
  },
  totalPrice: {
    type: Number,
  },
  totalQuantity: {
    type: Number,
  },
  paymentId: {
    type: String,
  },
  items: {
    type: {},
  },
  paid: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    defualt: Date.now,
  },
});

module.exports = mongoose.model.Contact || mongoose.model("Order", OrderSchema);
