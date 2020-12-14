const mongoose = require("mongoose");
const ProductSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  url: {
    type: String,
  },
  price: {
    type: Number,
  },
  createdAt: {
    type: Date,
    defualt: Date.now,
  },
});

const CatSchema = new mongoose.Schema({
  categoryName: {
    type: String,
  },
  thumbnail:{
    type:String
  },
  products: [ProductSchema],
});

module.exports ={
 Cat : mongoose.model("Cat", CatSchema),
  Product : mongoose.model("Product", ProductSchema),

} 
