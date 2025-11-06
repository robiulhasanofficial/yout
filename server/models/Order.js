const mongoose = require('mongoose');
module.exports = mongoose.model('Order', new mongoose.Schema({
  orderId: { type: String, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  phone: String,
  email: String,
  address: String,
  area: String,
  cardId: String,
  items: [{ title: String, price: Number, quantity: Number }],
  subtotal: Number,
  shipping: Number,
  total: Number,
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
}));