const jwt = require('jsonwebtoken');
const { query } = require('../config/db');
const { SESSION_DURATION, COOKIE_OPTIONS } = require('../controllers/auth.controller');

const authenticate = async (req, res, next) => {
  try {

    // 1. Read token from the httpOnly cookie
    const token = req.cookies?.token;

    if(!token) {
      return  res.status(401).json({
        status: 'error',
        message: 'Access denied. No token provided.',
      });
    }

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

    const timeRemaining = decoded.exp * 1000 - Date.now();
    if (timeRemaining < 5 * 60 * 1000) {
      const freshToken = jwt.sign(
        { sub: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: SESSION_DURATION / 1000 }
      );
      res.cookie('token', freshToken, COOKIE_OPTIONS);
    }
    

    // 5. Attach user to request
    req.user = user;
    next();

  } catch (err) {
    next(err);
  }
};

module.exports = { authenticate };