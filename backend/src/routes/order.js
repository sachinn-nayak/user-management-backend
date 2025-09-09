import express from 'express';
import db from '../db.js'
const router = express.Router();

router.post('/', async (req, res) => {
    const { payment_date, amount, payment_method, status } = req.body;  
    if (!amount || !payment_method) {
        return res.status(400).json({ error: 'amount and payment_method are required' });
    }   
    try {
        const result = await db.query(
            'INSERT INTO payments (payment_date, amount, payment_method, status) VALUES ($1, $2, $3, $4) RETURNING *',
            [payment_date || new Date(), amount, payment_method, status || 'completed']
        );  
        res.status(201).json({ message: 'Payment recorded successfully', payment: result.rows[0] });
        console.log("Payment recorded:", result.rows[0]);
    }   
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

export default router;