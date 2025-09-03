import { verifyAccessToken } from "../utils/jwt.js";

export function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Token required' });
    }
    try {
    const user = verifyAccessToken(token);
    req.user = user;
    next();
    }   catch (err) {
        return res.status(403).json({ error: 'Invalid token' });
    }
}
