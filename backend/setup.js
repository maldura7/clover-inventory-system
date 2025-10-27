const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const path = require('path');

const dbPath = path.join(__dirname, '../database/inventory.db');
const db = new Database(dbPath);

console.log('🔧 Setting up database...');

try {
  // Drop old tables if they exist
  db.exec(`
    DROP TABLE IF EXISTS audit_log;
    DROP TABLE IF EXISTS clover_sync_history;
    DROP TABLE IF EXISTS alerts;
    DROP TABLE IF EXISTS stock_adjustments;
    DROP TABLE IF EXISTS purchase_orders;
    DROP TABLE IF EXISTS inventory;
    DROP TABLE IF EXISTS suppliers;
    DROP TABLE IF EXISTS locations;
    DROP TABLE IF EXISTS products;
    DROP TABLE IF EXISTS users;
  `);

  console.log('✅ Dropped old tables');

  // Create tables
  db.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME
    );

    CREATE TABLE locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      address TEXT,
      city TEXT,
      state TEXT,
      zip_code TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE suppliers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      contact_person TEXT,
      email TEXT,
      phone TEXT,
      address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sku TEXT UNIQUE,
      name TEXT NOT NULL,
      description TEXT,
      category_id INTEGER,
      category_name TEXT,
      supplier_id INTEGER,
      barcode TEXT,
      cost_price DECIMAL(10, 2),
      selling_price DECIMAL(10, 2),
      unit_of_measure TEXT,
      reorder_level INTEGER DEFAULT 10,
      reorder_quantity INTEGER DEFAULT 50,
      tax_rate DECIMAL(5, 2) DEFAULT 0,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
    );

    CREATE TABLE inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      location_id INTEGER NOT NULL,
      quantity INTEGER DEFAULT 0,
      last_counted DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (location_id) REFERENCES locations(id),
      UNIQUE(product_id, location_id)
    );

    CREATE TABLE stock_adjustments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      location_id INTEGER NOT NULL,
      adjustment_type TEXT,
      quantity_change INTEGER,
      reason TEXT,
      reference_number TEXT,
      adjusted_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (location_id) REFERENCES locations(id),
      FOREIGN KEY (adjusted_by) REFERENCES users(id)
    );

    CREATE TABLE purchase_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      po_number TEXT UNIQUE,
      supplier_id INTEGER,
      status TEXT DEFAULT 'pending',
      total_amount DECIMAL(12, 2),
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    CREATE TABLE alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER,
      alert_type TEXT,
      message TEXT,
      is_read BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE clover_sync_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sync_type TEXT,
      status TEXT,
      items_synced INTEGER,
      sync_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT,
      table_name TEXT,
      record_id INTEGER,
      changes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  console.log('✅ Created all tables');

  // Create admin user
  const adminEmail = 'admin@cloverpro.com';
  const adminPassword = 'admin123';
  const hashedPassword = bcrypt.hashSync(adminPassword, 10);
  const now = new Date().toISOString();

  const result = db.prepare(`
    INSERT INTO users (email, password, name, role, created_at, updated_at, last_login)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(adminEmail, hashedPassword, 'Admin User', 'admin', now, now, now);

  console.log(`✅ Created admin user (ID: ${result.lastInsertRowid})`);

  // Create default location
  db.prepare(`
    INSERT INTO locations (name, address, city, state, zip_code)
    VALUES (?, ?, ?, ?, ?)
  `).run('Main Store', '123 Main St', 'New York', 'NY', '10001');

  console.log('✅ Created default location');

  // Create sample product
  db.prepare(`
    INSERT INTO products (sku, name, description, cost_price, selling_price, unit_of_measure, reorder_level, reorder_quantity)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run('SAMPLE-001', 'Sample Product', 'This is a sample product', 10.00, 15.00, 'unit', 10, 50);

  console.log('✅ Created sample product');

  // Add sample inventory
  db.prepare(`
    INSERT INTO inventory (product_id, location_id, quantity)
    VALUES (?, ?, ?)
  `).run(1, 1, 100);

  console.log('✅ Added sample inventory');

  console.log('\n✅ DATABASE SETUP COMPLETE!');
  console.log('\n📋 Admin Credentials:');
  console.log(`   Email: ${adminEmail}`);
  console.log(`   Password: ${adminPassword}`);
  console.log('\n🚀 Database is ready!');

} catch (error) {
  console.error('❌ Setup error:', error.message);
  process.exit(1);
}

db.close();
