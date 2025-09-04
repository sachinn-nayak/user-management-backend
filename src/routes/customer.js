import express from 'express';
import db from '../db.js';
import { authenticate } from '../middleware/auth.js';
import bcrypt from 'bcrypt';

const router = express.Router();

/**
 * @openapi
 * /customers/signup:
 *   post:
 *     summary: Register a new customer
 *     description: Creates a new customer with credentials and hashed password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CustomerSignupRequest'
 *     responses:
 *       201:
 *         description: Customer created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Customer created successfully
 *                 customer:
 *                   $ref: '#/components/schemas/CustomerResponse'
 *       400:
 *         description: Missing required fields or username already exists
 *       500:
 *         description: Database error
 */
router.post('/signup', async (req, res) => {
    const { name, email, phone_number, address, username, password } = req.body;
    if (!name || !email || !phone_number || !address || !username || !password) {
        return res.status(400).json({ error: 'All fields are required: name, email, phone_number, address, username, password' });
    }
    try {
        await db.query('BEGIN');
        const usernameCheck = await db.query(
            'SELECT id FROM customer_credentials WHERE username = $1',
            [username]
        );
        if (usernameCheck.rows.length > 0) {
            await db.query('ROLLBACK');
            return res.status(400).json({ error: 'Username already exists' });
        }
        const customerResult = await db.query(
            'INSERT INTO customers (name, email, phone_number, address) VALUES ($1, $2, $3, $4) RETURNING id, name, email, phone_number, address',
            [name, email, phone_number, address]
        );
        const customer = customerResult.rows[0];
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        await db.query(
            'INSERT INTO customer_credentials (customer_id, username, password_hash) VALUES ($1, $2, $3)',
            [customer.id, username, passwordHash]
        );  
        await db.query('COMMIT');
        res.status(201).json({ message: 'Customer created successfully', customer });
    } catch (err) {
        await db.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

router.get('/get-by-id', authenticate, async (req, res) => {
  try {
    const customerId = req.user.id; 
    console.log("Customer ID from token:", req.user);
    const result = await db.query(
      'SELECT id, name, email, phone_number, address FROM customers WHERE id = $1',
      [customerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching customer:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/update',authenticate, async (req, res) => {
  const id = req.user.id;
  if (!id) {
    return res.status(400).json({ error: 'Unautherized Access' });
  }
  console.log("Customer ID from token for update:", req.user);
  const updates = req.body;
  const keys = Object.keys(updates).filter(k => updates[k] !== undefined);
  if (keys.length === 0) {
    return res.status(400).json({ error: 'At least one field (name, email, phone_number, address) is required to update' });
  }
  const setClause = keys.map((k, i) => `${k}=$${i + 1}`).join(', ');
  const values = keys.map(k => updates[k]);
  values.push(id);
  const query = `UPDATE customers SET ${setClause} WHERE id=$${keys.length + 1} RETURNING id, name, email, phone_number, address`;
  try {
    const { rows } = await db.query(query, values);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

export default router;
