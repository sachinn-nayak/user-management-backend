import jwt from 'jsonwebtoken';
const  JWT_SECRET = 'supersecretkey';
const JWT_REFRESH_SECRET='superrefreshsecretkey';

export const generateAccessToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role },
     JWT_SECRET, 
     { expiresIn: '1h' });
}

export const generateRefreshToken = (user) => {
    return jwt.sign({ id: user.id, role: user.role },
         JWT_REFRESH_SECRET,
            { expiresIn: '7d' });   
}   

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (err) {
    return null;
  }
};