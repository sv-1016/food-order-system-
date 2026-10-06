const express = require('express');
const db = require('../db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Place an order
router.post('/', authMiddleware, (req, res) => {
  const { items, address } = req.body;
  // items: [{ menu_item_id, quantity }]
  if (!items || items.length === 0)
    return res.status(400).json({ error: 'No items in order' });

  // Validate items and calculate total
  let total = 0;
  const enriched = [];
  for (const item of items) {
    const menuItem = db.prepare('SELECT * FROM menu_items WHERE id = ? AND available = 1').get(item.menu_item_id);
    if (!menuItem) return res.status(400).json({ error: `Item ${item.menu_item_id} not found` });
    total += menuItem.price * item.quantity;
    enriched.push({ ...item, price: menuItem.price });
  }

  const orderResult = db.prepare(
    'INSERT INTO orders (user_id, total, address) VALUES (?, ?, ?)'
  ).run(req.user.id, total, address || '');

  const orderId = orderResult.lastInsertRowid;
  const insertOrderItem = db.prepare(
    'INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES (?, ?, ?, ?)'
  );

  for (const item of enriched) {
    insertOrderItem.run(orderId, item.menu_item_id, item.quantity, item.price);
  }

  const order = getFullOrder(orderId);
  res.status(201).json(order);
});

// Get user's orders
router.get('/my', authMiddleware, (req, res) => {
  const orders = db.prepare(`
    SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC
  `).all(req.user.id);

  const fullOrders = orders.map(o => getFullOrder(o.id));
  res.json(fullOrders);
});

// Get single order
router.get('/:id', authMiddleware, (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (order.user_id !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ error: 'Access denied' });

  res.json(getFullOrder(order.id));
});

// Admin: Get all orders
router.get('/', adminMiddleware, (req, res) => {
  const orders = db.prepare(`
    SELECT o.*, u.name as customer_name, u.email as customer_email
    FROM orders o
    JOIN users u ON o.user_id = u.id
    ORDER BY o.created_at DESC
  `).all();

  const fullOrders = orders.map(o => ({ ...getFullOrder(o.id), customer_name: o.customer_name, customer_email: o.customer_email }));
  res.json(fullOrders);
});

// Admin: Update order status
router.patch('/:id/status', adminMiddleware, (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status))
    return res.status(400).json({ error: 'Invalid status' });

  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json(getFullOrder(req.params.id));
});

function getFullOrder(orderId) {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  if (!order) return null;

  const items = db.prepare(`
    SELECT oi.*, m.name, m.image
    FROM order_items oi
    JOIN menu_items m ON oi.menu_item_id = m.id
    WHERE oi.order_id = ?
  `).all(orderId);

  return { ...order, items };
}

module.exports = router;
