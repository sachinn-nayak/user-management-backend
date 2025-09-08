import express from 'express';
import db from '../db.js';
const router = express.Router();


router.post('/create', async (req, res) => {
  const { name, email ,phone_number} = req.body;
    if (!name || !email || !phone_number) {
        return res.status(400).json({ error: 'Name and email are required' });
    }   
    try {
        const result = await db.query(
            'INSERT INTO users (name, email,phone_number) VALUES ($1, $2 ,$3) RETURNING id, name, email,phone_number',
            [name, email,phone_number]
        );
        res.status(201).json({ message: 'User created successfully', user: result.rows[0] });
    } catch (err) {
        if (err.code === '23505') { 
            return res.status(400).json({ error: 'Email already exists' });
        }
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }   
});


router.get('', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT id, name FROM users ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

export default router;