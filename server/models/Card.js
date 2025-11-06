const mongoose = require('mongoose');
module.exports = mongoose.model('Card', new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  password: String,
  name: String,
  balance: { type: Number, default: 0 }
}));