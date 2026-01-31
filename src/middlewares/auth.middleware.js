const { verifyToken: verifyJWT } = require('../utils/jwt');
const authService = require('../services/auth.service');

const verifyToken = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized - No token provided' });
    }
    
    const token = header.split(' ')[1];
    const payload = verifyJWT(token);
    const user = await authService.findById(payload.id);
    
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized - User not found' });
    }
    
    req.user = { id: user._id, email: user.email, role: user.role };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized - Invalid token' });
  }
};

module.exports = { verifyToken };
