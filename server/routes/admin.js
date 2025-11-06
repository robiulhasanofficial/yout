const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const Card = require('../models/Card');
const { requireAdmin } = require('../middleware/auth');

// Admin Login (সিম্পল — পরে JWT করতে পারো)
router.post('/login', (req, res) => {
  const { password } = req.body;
  if (password === 'admin123') {
    req.session.isAdmin = true;
    return res.json({ success: true });
  }
  res.status(401).json({ message: 'পাসওয়ার্ড ভুল' });
});

// === সব অর্ডার ===
router.get('/orders', requireAdmin, async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
});

// === একটি অর্ডার ===
router.get('/orders/:id', requireAdmin, async (req, res) => {
  const order = await Order.findOne({ orderId: req.params.id });
  if (!order) return res.status(404).json({ message: 'অর্ডার পাওয়া যায়নি' });
  res.json(order);
});

// === স্ট্যাটাস আপডেট ===
router.patch('/orders/:id/status', requireAdmin, async (req, res) => {
  const { status } = req.body;
  const order = await Order.findOneAndUpdate(
    { orderId: req.params.id },
    { status },
    { new: true }
  );
  if (!order) return res.status(404).json({ message: 'অর্ডার পাওয়া যায়নি' });
  res.json(order);
});

// === সব ইউজার ===
router.get('/users', requireAdmin, async (req, res) => {
  const users = await User.aggregate([
    {
      $lookup: {
        from: 'orders',
        localField: '_id',
        foreignField: 'user',
        as: 'orders'
      }
    },
    {
      $project: {
        name: 1,
        phone: 1,
        orderCount: { $size: '$orders' }
      }
    }
  ]);
  res.json(users);
});

// === ইউজারের অর্ডার ===
router.get('/orders/user/:phone', requireAdmin, async (req, res) => {
  const user = await User.findOne({ phone: req.params.phone });
  if (!user) return res.json([]);
  const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

// === কার্ড ===
router.get('/cards', requireAdmin, async (req, res) => {
  const cards = await Card.find();
  res.json(cards);
});

router.get('/cards/:id', requireAdmin, async (req, res) => {
  const card = await Card.findOne({ id: req.params.id });
  if (!card) return res.status(404).json({ message: 'কার্ড পাওয়া যায়নি' });
  res.json(card);
});

router.post('/cards', requireAdmin, async (req, res) => {
  const { id, password, name, balance } = req.body;
  const exists = await Card.findOne({ id });
  if (exists) return res.status(400).json({ message: 'কার্ড আইডি আগে থেকে আছে' });
  await Card.create({ id, password, name, balance });
  res.json({ success: true });
});

router.put('/cards/:id', requireAdmin, async (req, res) => {
  const { id, password, name, balance } = req.body;
  const card = await Card.findOneAndUpdate(
    { id: req.params.id },
    { id, password, name, balance },
    { new: true }
  );
  if (!card) return res.status(404).json({ message: 'কার্ড পাওয়া যায়নি' });
  res.json(card);
});

module.exports = router;