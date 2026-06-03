const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');
const { query } = require('../config/db');

const generateToken = (userId, email) => {
    return jwt.sign(
        { sub: userId, email } ,
        process.env.JWT_SECRET,
        {expiresIn: process.env.JWT_EXPIRES_IN }
    );
};

const formatUser = (user) => ({
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    isActive: user.is_active,
});

const SESSION_DURATION = 10*60*1000;


const COOKIE_OPTIONS = {
  httpOnly : true,
  sameSite: 'strict',
  secure: process.env.NODE_ENV === 'production',
  maxAge : SESSION_DURATION,
}

const authController = {
    register: async ( req, res,next ) => {
        try {
            const { email, firstName, lastName, password} =req.body;

            //check of the email  already exists 
            const existingUser = await UserModel.findByEmail(email);
            if(existingUser ) {
                return res.status(409).json({
                    status:'error',
                    message: "An account with this email already exists",
                });
            }

            //Hash password
            const saltRounds = 12;
            const hashedpassword = await bcrypt.hash(password, saltRounds);

            //create User
            const user = await UserModel.create({
                email,
                firstName,
                lastName,
                password: hashedpassword,
            });

            //generate token
            const token = generateToken(user.id, user.email);
            res.cookie('token', token, COOKIE_OPTIONS);


            res.status(201).json({
              status: 'success',
              data: {
                user: formatUser(user),
              },
            });
        } catch(err) {
            next(err);
        }
    },

    login: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await UserModel.findByEmail(email);

      // Same error for wrong email OR wrong password — security best practice
      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid email or password',
        });
      }

      // Compare passwords
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid email or password',
        });
      }

      // Check account is active
      if (!user.is_active) {
        return res.status(401).json({
          status: 'error',
          message: 'Your account has been deactivated',
        });
      }

      // Generate token
      const token = generateToken(user.id, user.email);
      res.cookie('token', token, COOKIE_OPTIONS);


      res.status(200).json({
        status: 'success',
        data: {
          user: formatUser(user),
        },
      });
    } catch (err) {
      next(err);
    }
  },

  logout: ( req, res) => {
    res.clearCookie('token', {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });
    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully',
    });
  },

  getProfile: async (req, res, next) => {
    try {
      const user = await UserModel.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found',
        });
      }

      res.status(200).json({
        status: 'success',
        data: { user: formatUser(user) },
      });
    } catch (err) {
      next(err);
    }
  },

   refresh: async (req, res, next) => {
        try {
            const token = req.cookies?.token;

            if (!token) {
                return res.status(401).json({
                    status: 'error',
                    message: 'No token provided.',
                });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const user = await UserModel.findById(decoded.sub);

            if (!user || !user.is_active) {
                return res.status(401).json({
                    status: 'error',
                    message: 'User not found or inactive.',
                });
            }

            const freshToken = generateToken(user.id, user.email);
            res.cookie('token', freshToken, COOKIE_OPTIONS);

            return res.status(200).json({
                status: 'success',
                message: 'Token refreshed.',
            });

        } catch (err) {
            res.clearCookie('token');
            next(err);
        }
    },
};

module.exports = authController;
module.exports.SESSION_DURATION = SESSION_DURATION;
module.exports.COOKIE_OPTIONS    = COOKIE_OPTIONS;