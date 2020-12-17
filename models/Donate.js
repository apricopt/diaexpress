const mongoose = require("mongoose");
const DonateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
  },
  amount: {
    type: Number,
  },
  paymentId: {
    type: String,
  },
  paid: {
      type:Boolean,
      default:false
  },

  createdAt: {
    type: Date,
    defualt: Date.now,
  },
});

module.exports = mongoose.model("Donate", DonateSchema);
