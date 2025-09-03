import express from 'express';
import bcrypt from 'bcrypt';
import db from '../db.js';
import {
  generateAccessToken,
  generateRefreshToken,
} from '../utils/jwt.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password required' });
  }
  try {
    const credResult = await db.query(
      `SELECT cc.customer_id, cc.password_hash, cc.role, 
              c.name, c.email, c.phone_number, c.address
       FROM customer_credentials cc 
       JOIN customers c ON cc.customer_id = c.id 
       WHERE cc.username = $1`,
      [username]
    );
    if (credResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    const cred = credResult.rows[0];
    const passwordMatch = await bcrypt.compare(password, cred.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    const tokenPayload = { id: cred.customer_id, role: cred.role };
    const token = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);
    res.json({
      token,
      refreshToken,
      customer: {
        id: cred.customer_id,
        name: cred.name,
        email: cred.email,
        phone_number: cred.phone_number,
        address: cred.address,
        role: cred.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ error: 'Missing refresh token' });

  const payload = verifyRefreshToken(refreshToken);
  if (!payload) return res.status(403).json({ error: 'Invalid refresh token' });

  const result = await db.query(
    'SELECT * FROM customer_credentials WHERE customer_id = $1 AND refresh_token = $2',
    [payload.id, refreshToken]
  );

  if (result.rows.length === 0) {
    return res.status(403).json({ error: 'Refresh token revoked' });
  }
  const newAccessToken = generateAccessToken({ id: payload.id, role: result.rows[0].role });
  res.json({ accessToken: newAccessToken });
});
export default router;
