
const { verifyToken } = require('../utils/jwt');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No autorizado' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido' });
  }
}

function adminMiddleware(req, res, next) {
  if (!req.user || req.user.rol !== 'ADMIN') {
    return res.status(403).json({ message: 'Requiere rol ADMIN' });
  }
  return next();
}

module.exports = { authMiddleware, adminMiddleware };
