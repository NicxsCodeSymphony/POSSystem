const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 3000
const db = require('./db')

app.use(express.json())

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.post('/category', (req, res) => {
  const { category_name } = req.body;
  if (!category_name) {
    return res.status(400).json({ error: 'Category name is required' });
  }
  const sql = `INSERT INTO category (category_name) VALUES (?)`;
  db.run(sql, [category_name], function (err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ id: this.lastID });
  });
});

app.get('/category', (req, res) => {
  const sql = `SELECT * FROM category`;
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ categories: rows });
  });
});

app.delete('/category/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM category WHERE category_id = ?';
  db.run(sql, [id], function (err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ message: 'Successfully deleted' });
  });
});

// PRODUCT CRUD

// Endpoint to add a product
app.post('/products', (req, res) => {
  const { product_name, sku, price, category_id } = req.body; // Extract properties from request body

  // Validate that all required fields are provided
  if (!product_name || !sku || !price || !category_id) {
    return res.status(400).json({ error: 'Product name, SKU, price, and category ID are required' });
  }

  const sql = `INSERT INTO product (product_name, sku, price, category_id) VALUES (?, ?, ?, ?)`;

  // Execute the query
  db.run(sql, [product_name, sku, price, category_id], function (err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ id: this.lastID });
  });
});

app.post('/products', (req, res) => {
  const { product_name, sku, price, category_id } = req.body;

  // Check for required fields
  if (!product_name || !sku || !price || !category_id) {
    return res.status(400).json({ error: 'Product name, SKU, price, and category ID are required' });
  }

  // Query to check if a product with the same name and same SKU exists
  const checkSql = `SELECT COUNT(*) AS count FROM product WHERE product_name = ? OR sku = ?`;

  db.get(checkSql, [product_name, sku], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (row.count >= 0) {
      return res.status(400).json({ error: 'Product with the same name and SKU already exists' });
    } else {
      const sql = `INSERT INTO product (product_name, sku, price, category_id) VALUES (?, ?, ?, ?)`;

      db.run(sql, [product_name, sku, price, category_id], function (err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to add product to checkout' });
        }
        // Return the ID of the newly added product
        res.json({ id: this.lastID });
      });
    }
  });
});





app.get('/products/:id', (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: 'Category ID is required' });
  }
  const sql = `
      SELECT p.id, p.product_name, p.sku, p.price, c.category_name
      FROM product p
      INNER JOIN category c ON p.category_id = c.category_id
      WHERE c.category_id = ?
      GROUP BY p.product_name
  `;

  // Execute the query
  db.all(sql, [id], (err, rows) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(400).json({ error: err.message });
    }

    console.log('Unique products:', rows);
    res.json({ products: rows });
  });
});

app.get('/selectedProduct', (req, res) => {
  const { productName } = req.query;

  if (!productName) {
    return res.status(400).json({ error: 'Category ID is required' });
  }
  const sql = `
      SELECT p.*, c.category_name
      FROM product p
      INNER JOIN category c ON p.category_id = c.category_id
      WHERE p.product_name = ?
  `;

  // Execute the query
  db.all(sql, [productName], (err, rows) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(400).json({ error: err.message });
    }

    console.log('Unique products:', rows);
    res.json({ products: rows });
  });
});

app.get('/product', (req, res) => {
  const sql = `SELECT p.*, c.category_name FROM product p INNER JOIN category c ON p.category_id = c.category_id`;
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ product: rows });
  });
});

app.put('/products/:id', (req, res) => {
  const { id } = req.params;
  const { product_name, category_id, sku, price } = req.body;

  console.log("Updating product:", { id, product_name, category_id, sku, price });

  // Check if the product with the same name and SKU exists but not the current product
  const checkSql = `
    SELECT * FROM product
    WHERE (product_name = ? AND sku = ?)
    AND id <> ?
  `;
  db.get(checkSql, [product_name, sku, id], (err, row) => {
    if (err) {
      console.error("SQL Error:", err.message);
      return res.status(400).json({ error: err.message });
    }

    if (row) {
      return res.status(400).json({ error: 'Product with the same name and SKU already exists' });
    }

    // Proceed with the update if no duplicate is found
    const updateSql = `
      UPDATE product
      SET product_name = ?, category_id = ?, sku = ?, price = ?
      WHERE id = ?
    `;
    db.run(updateSql, [product_name, category_id, sku, price, id], function(err) {
      if (err) {
        console.error("SQL Error:", err.message);
        return res.status(400).json({ error: err.message });
      }
      res.json({ message: "Product updated successfully", changes: this.changes });
    });
  });
});



app.delete('/products/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM product WHERE id = ?';
  db.run(sql, [id], function (err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ message: 'Successfully deleted' });
  });
});


app.post('/checkout', (req, res) => {
  const { product_name, sku, price, category_id } = req.body;

  // Check for required fields
  if (!product_name || !sku || !price || !category_id) {
    return res.status(400).json({ error: 'Product name, SKU, price, and category ID are required' });
  }

  // Query to check if a product with the same name and same SKU exists
  const checkSql = `SELECT COUNT(*) AS count FROM checkout WHERE product_name = ? AND sku = ?`;

  db.get(checkSql, [product_name, sku], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    // If count is greater than 0, it means the product with the same name and SKU already exists
    if (row.count > 0) {
      return res.status(400).json({ error: 'Product with the same name and SKU already exists' });
    } else {
      // Proceed to add the product to the checkout if the name and SKU combination is unique
      const sql = `INSERT INTO checkout (product_name, sku, price, category_id, quantity, total) VALUES (?, ?, ?, ?, ?, ?)`;

      const quantity = 1;
      const total = price * quantity;

      db.run(sql, [product_name, sku, price, category_id, quantity, total], function (err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to add product to checkout' });
        }
        // Return the ID of the newly added product
        res.json({ id: this.lastID });
      });
    }
  });
});


app.get('/checkout', (req, res) => {
  const sql = `SELECT p.*, c.category_name FROM checkout p INNER JOIN category c ON p.category_id = c.category_id`;
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ checkouts: rows });
  });
});

app.put('/checkout/:id', (req, res) => {
  const { id } = req.params;
  const { quantity, total } = req.body;

  const sql = `UPDATE checkout SET quantity = ?, total = ? WHERE id = ?`;
  db.run(sql, [quantity, total, id], function (err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ changes: this.changes });
  });
});

app.delete('/checkout/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM checkout WHERE id = ?';
  db.run(sql, [id], function (err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ message: 'Successfully deleted' });
  });
});


app.post('/history', async (req, res) => {
  const { purchased, total, discount, initial_total } = req.body;
  const time = new Date().toISOString(); // Get the current time in ISO format

  const insertSql = `INSERT INTO history (purchased_item, total, time, discount, initial_total) VALUES (?, ?, ?, ?, ?)`;
  const deleteSql = `DELETE FROM checkout`;

  try {
    // Begin a transaction
    await db.run('BEGIN TRANSACTION');

    // Insert data into history
    await new Promise((resolve, reject) => {
      db.run(insertSql, [purchased, total, time, discount, initial_total], function (err) {
        if (err) {
          return reject(err);
        }
        resolve(this.lastID);
      });
    });

    // Delete data from checkout
    await new Promise((resolve, reject) => {
      db.run(deleteSql, (err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });

    // Commit the transaction
    await new Promise((resolve, reject) => {
      db.run('COMMIT', (err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });

    // Respond with success
    res.json({ id: this.lastID });
  } catch (error) {
    // Rollback in case of error
    await db.run('ROLLBACK');
    res.status(400).json({ error: error.message });
  }
});



app.get('/history', (req, res) => {
  const sql = `SELECT * FROM history`;
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ history: rows });
  });
});





app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
