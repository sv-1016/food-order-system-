const express = require('express');
const db = require('../db');
const { adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all categories
router.get('/categories', (req, res) => {
  const categories = db.prepare('SELECT * FROM categories').all();
  res.json(categories);
});

// Get menu items (optionally filter by category)
router.get('/items', (req, res) => {
  const { category, search } = req.query;
  let query = `
    SELECT m.*, c.name as category_name, c.icon as category_icon
    FROM menu_items m
    LEFT JOIN categories c ON m.category_id = c.id
    WHERE m.available = 1
  `;
  const params = [];

  if (category && category !== 'all') {
    query += ' AND m.category_id = ?';
    params.push(category);
  }
  if (search) {
    query += ' AND (m.name LIKE ? OR m.description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  query += ' ORDER BY m.category_id, m.name';

  const items = db.prepare(query).all(...params);
  res.json(items);
});

// Get single item
router.get('/items/:id', (req, res) => {
  const item = db.prepare(`
    SELECT m.*, c.name as category_name
    FROM menu_items m
    LEFT JOIN categories c ON m.category_id = c.id
    WHERE m.id = ?
  `).get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Item not found' });
  res.json(item);
});

// Admin: Create menu item
router.post('/items', adminMiddleware, (req, res) => {
  const { name, description, price, category_id, image } = req.body;
  if (!name || !price) return res.status(400).json({ error: 'Name and price required' });

  const result = db.prepare(
    'INSERT INTO menu_items (name, description, price, category_id, image) VALUES (?, ?, ?, ?, ?)'
  ).run(name, description, price, category_id, image);

  const item = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(item);
});

// Admin: Update menu item
router.put('/items/:id', adminMiddleware, (req, res) => {
  const { name, description, price, category_id, image, available } = req.body;
  const item = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Item not found' });

  db.prepare(`
    UPDATE menu_items SET name=?, description=?, price=?, category_id=?, image=?, available=?
    WHERE id=?
  `).run(
    name ?? item.name,
    description ?? item.description,
    price ?? item.price,
    category_id ?? item.category_id,
    image ?? item.image,
    available !== undefined ? available : item.available,
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// Admin: Delete menu item
router.delete('/items/:id', adminMiddleware, (req, res) => {
  db.prepare('DELETE FROM menu_items WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Admin: Get all items including unavailable
router.get('/admin/items', adminMiddleware, (req, res) => {
  const items = db.prepare(`
    SELECT m.*, c.name as category_name
    FROM menu_items m
    LEFT JOIN categories c ON m.category_id = c.id
    ORDER BY m.category_id, m.name
  `).all();
  res.json(items);
});

module.exports = router;
