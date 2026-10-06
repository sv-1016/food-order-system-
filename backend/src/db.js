// Uses Node.js built-in SQLite (available in Node 22.5+ as experimental, stable in Node 24)
const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const bcrypt = require('bcryptjs');

const db = new DatabaseSync(path.join(__dirname, '../food.db'));

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'customer',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    icon TEXT
  );

  CREATE TABLE IF NOT EXISTS menu_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    image TEXT,
    category_id INTEGER,
    available INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    total REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    menu_item_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
  );
`);

// Seed categories if empty
const catCount = db.prepare('SELECT COUNT(*) as c FROM categories').get();
if (catCount.c === 0) {
  const insertCat = db.prepare('INSERT INTO categories (name, icon) VALUES (?, ?)');
  insertCat.run('Burgers', '🍔');
  insertCat.run('Pizza', '🍕');
  insertCat.run('Sushi', '🍣');
  insertCat.run('Salads', '🥗');
  insertCat.run('Drinks', '🥤');
  insertCat.run('Desserts', '🍰');

  const insertItem = db.prepare(
    'INSERT INTO menu_items (name, description, price, category_id, image) VALUES (?, ?, ?, ?, ?)'
  );

  // Burgers
  insertItem.run('Classic Smash Burger', 'Double smash patty, cheddar, pickles, special sauce', 112.99, 1, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400');
  insertItem.run('BBQ Bacon Burger', 'Crispy bacon, BBQ sauce, onion rings, jalapeños', 114.99, 1, 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400');
  insertItem.run('Veggie Burger', 'Black bean patty, avocado, lettuce, tomato', 111.99, 1, 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400');

  // Pizza
  insertItem.run('Margherita', 'Fresh mozzarella, tomato sauce, basil', 113.99, 2, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400');
  insertItem.run('Pepperoni Feast', 'Double pepperoni, mozzarella, tomato sauce', 115.99, 2, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400');
  insertItem.run('BBQ Chicken Pizza', 'Grilled chicken, BBQ sauce, red onion, cilantro', 116.99, 2, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400');

  // Sushi
  insertItem.run('Salmon Roll (8 pcs)', 'Fresh salmon, avocado, cucumber', 114.99, 3, 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=400');
  insertItem.run('Spicy Tuna Roll', 'Tuna, spicy mayo, sriracha', 113.99, 3, 'https://images.unsplash.com/photo-1562802378-063ec186a863?w=400');

  // Salads
  insertItem.run('Caesar Salad', 'Romaine, parmesan, croutons, caesar dressing', 109.99, 4, 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400');
  insertItem.run('Greek Salad', 'Feta, olives, tomatoes, cucumber, red onion', 110.99, 4, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400');

  // Drinks
  insertItem.run('Fresh Lemonade', 'Freshly squeezed with mint', 104.99, 5, 'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9e?w=400');
  insertItem.run('Mango Smoothie', 'Real mango, yogurt, honey', 105.99, 5, 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400');
  insertItem.run('Cola', 'Classic cold cola', 102.99, 5, 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400');

  // Desserts
  insertItem.run('Chocolate Lava Cake', 'Warm chocolate cake with molten center', 107.99, 6, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400');
  insertItem.run('Cheesecake Slice', 'New York style with berry compote', 106.99, 6, 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400');
}

// Seed admin user if not exists
const adminExists = db.prepare("SELECT id FROM users WHERE email = 'admin@food.com'").get();
if (!adminExists) {
  const hash = bcrypt.hashSync('admin123', 10);
  db.prepare("INSERT INTO users (name, email, password, role) VALUES ('Admin', 'admin@food.com', ?, 'admin')").run(hash);
}

module.exports = db;
