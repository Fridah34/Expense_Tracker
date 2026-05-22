const { body } = require ('express-validator');

const authValidator = {
    register:[
        body('email')
         .trim()
         .isEmail()
         .withMessage('Please provide a valid email address')
         .customSanitizer((value) => value.toLowerCase()),
        
        body('firstName')
         .trim()
         .notEmpty()
         .withMessage('First Name is required')
         .isLength({ min:2, max: 50 })
         .withMessage('First name must be between 2 and 50 characters')
         .matches(/^[a-zA-Z\s]+$/)
         .withMessage('First name can only contain letters'),
    

        body('lastName')
         .trim()
         .notEmpty()
         .withMessage('Last Name is required')
         .isLength({ min:2, max:50})
         .withMessage('Last name must be between 2 and 50 characters ')
         .matches(/^[a-zA-Z\s]+$/)
         .withMessage('Last Name can only contain letters'),
        

        body('password')
         .isLength({ min:8 })
         .withMessage('Password must be at least 8 characters')
         .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
         .withMessage('Password must contain uppercase, lowercase and a number'),
    ],

    login:[
         body('email')
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email address')
      .customSanitizer((value) => value.toLowerCase()),

    body('password')
      .notEmpty()
      .withMessage('Password is required'),
    ],
};

module.exports = authValidator;