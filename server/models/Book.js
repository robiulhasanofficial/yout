const mongoose = require('mongoose');
module.exports = mongoose.model('Book', new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  title: String,
  img: String,
  price: Number,
  rating: Number,
  category: String
}));