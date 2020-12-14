const mongoose = require("mongoose");
const ContactSchema = new mongoose.Schema({
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
  subject: {
    type: String,
  },
  message: {
    type: String,
  },

  createdAt: {
    type: Date,
    defualt: Date.now,
  },
});

module.exports =
  mongoose.model.Contact || mongoose.model("Contact", ContactSchema);
