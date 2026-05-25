const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

const authenticate = async (req, res, next) => {
  try {
    // 1. Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. No token provided.',
      });
    }

    // 2. Extract token
    const token = authHeader.split(' ')[1];

    // 3. Verify token signature and expiry
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Check user still exists and is active
    const result = await query(
      'SELECT id, email, first_name, last_name, is_active FROM users WHERE id = $1',
      [decoded.sub]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User no longer exists.',
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        status: 'error',
        message: 'Your account has been deactivated.',
      });
    }

    // 5. Attach user to request
    req.user = user;
    next();

  } catch (err) {
    next(err);
  }
};

module.exports = { authenticate };