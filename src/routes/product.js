import express from 'express';
import db from '../db.js';
const router = express.Router();


router.post('/create',async (req, res) => {
    const { name, price ,stock,category_id,sku,status} = req.body;
    if (!name || !price || !stock || !sku) {
        return res.status(400).json({ error: 'Name, price, stock and sku are required' });
    }
    try {
        const result = await db.query(
            'INSERT INTO products (name, price, stock, category_id, sku, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, price, stock, category_id, sku, status',
            [name, price, stock, category_id, sku, status]
        );
        res.status(201).json({ message: 'Product created successfully', product: result.rows[0] });
    } catch (err) { 
        if (err.code === '23505') {
            return res.status(400).json({ error: 'SKU already exists' });
        }
        if (err.code === '23503') {
            return res.status(400).json({ error: 'Invalid category_id' });
        }
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

export default router;

