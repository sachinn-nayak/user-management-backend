import express from 'express';
import bcrypt from 'bcrypt';
import db from '../db.js';
import crypto from 'crypto';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
} from '../utils/jwt.js';
import { sendResetEmail } from '../utils/sendEmails.js';


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
     await db.query(
      `UPDATE customer_credentials 
       SET refresh_token = $1, updated_at = NOW() 
       WHERE customer_id = $2`,
      [refreshToken, cred.customer_id]
    );
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

router.post('/refresh-token', async (req, res) => {
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

router.post('/logout', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'Missing refresh token' });
  try {
    const result = await db.query(
      `UPDATE customer_credentials 
       SET refresh_token = NULL, updated_at = NOW() 
       WHERE refresh_token = $1 
       RETURNING *`,
      [refreshToken]
    );
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid refresh token' });
    }
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  try {
    const user = await db.query(
      'SELECT * FROM customers WHERE email = $1',
      [email]
    );
    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 min
    await db.query(
      `UPDATE customer_credentials 
       SET reset_token = $1, reset_token_expiry = $2 
       WHERE customer_id= $3`,
      [resetToken, expiry, user.rows[0].id]
    );
    console.log("Reset Token:", resetToken, expiry, user.rows[0].id);
   const resetLink = `https://yourapp.com/reset-password?token=${resetToken}`
   console.log("Reset Link:", resetLink);
    await sendResetEmail(email, resetLink);
    res.json({ message: 'Password reset link sent to your email' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token and new password required' });
  }
  try {
    const result = await db.query(
      `SELECT * FROM customer_credentials 
       WHERE reset_token = $1 AND reset_token_expiry > NOW()`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query(
      `UPDATE customer_credentials 
       SET password_hash = $1, reset_token = NULL, reset_token_expiry = NULL 
       WHERE id = $2`,
      [hashedPassword, result.rows[0].id]
    );

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});


export default router;
