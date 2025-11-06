const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const User = require('../models/User');
const Order = require('../models/Order');
const Card = require('../models/Card');
const { sendTelegram } = require('../utils/telegram');

// === বই ===
router.get('/books', async (req, res) => {
  const books = await Book.find();
  res.json(books);
});

// === ইউজার রেজিস্টার ===
router.post('/user/register', async (req, res) => {
  const { name, phone } = req.body;
  let user = await User.findOne({ phone });
  if (!user) user = await User.create({ name, phone });
  req.session.userId = user._id;
  res.json(user);
});

router.get('/user', async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ message: 'লগইন করুন' });
  const user = await User.findById(req.session.userId);
  res.json(user);
});

// === কার্ড চেক ===
router.post('/card/check', async (req, res) => {
  const { id, password } = req.body;
  const card = await Card.findOne({ id, password });
  if (!card) return res.status(400).json({ message: 'কার্ড আইডি বা পাসওয়ার্ড ভুল' });
  res.json({ name: card.name, balance: card.balance });
});

// === টেলিগ্রাম টেস্ট ===
router.get('/test-telegram', async (req, res) => {
  await sendTelegram('টেলিগ্রাম টেস্ট সফল!');
  res.json({ success: true, message: 'টেলিগ্রামে মেসেজ পাঠানো হয়েছে!' });
});

// === অর্ডার ===
router.post('/orders', async (req, res) => {
  const { name, phone, email, address, area, cardId, cardPassword, items, subtotal, shipping } = req.body;
  const total = subtotal + shipping;

  const card = await Card.findOne({ id: cardId, password: cardPassword });
  if (!card || card.balance < total) {
    return res.status(400).json({ message: 'পর্যাপ্ত ব্যালেন্স নেই' });
  }

  const orderCount = await Order.countDocuments();
  const orderId = `ORD-${1001 + orderCount}`;

  const order = await Order.create({
    orderId,
    user: req.session.userId,
    name, phone, email, address, area, cardId,
    items, subtotal, shipping, total
  });

  card.balance -= total;
  await card.save();

  const msg = `
<b>নতুন অর্ডার!</b>
<b>আইডি:</b> #${orderId}
<b>গ্রাহক:</b> ${name} (${phone})
<b>ঠিকানা:</b> ${address} (${area === 'dhaka' ? 'ঢাকা' : 'বাইরে'})
<b>মোট:</b> ৳${total}
  `.trim();
  await sendTelegram(msg);

  res.json({ orderId });
});

// === ইউজারের অর্ডার (admin + client) ===
router.get('/orders/user', async (req, res) => {
  if (!req.session.userId) return res.status(401).json([]);
  const orders = await Order.find({ user: req.session.userId }).sort({ createdAt: -1 });
  res.json(orders);
});

module.exports = router;