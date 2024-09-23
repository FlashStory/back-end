const { body, validationResult } = require('express-validator');

const validateCollection = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('icon').trim().notEmpty().withMessage('Icon is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

const validatePost = [
  // ... implement validation for post fields
];

module.exports = { validateCollection, validatePost };