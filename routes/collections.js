const express = require('express');
const router = express.Router();
const Collection = require('../models/Collection');
const { validateCollection } = require('../utils/validation');

// GET all collections
router.get('/', async (req, res, next) => {
  try {
    const collections = await Collection.find();
    res.json(collections);
  } catch (error) {
    next(error);
  }
});

// POST new collection
router.post('/', validateCollection, async (req, res, next) => {
  try {
    const collection = new Collection(req.body);
    await collection.save();
    res.status(201).json(collection);
  } catch (error) {
    next(error);
  }
});

// ... implement GET, PUT, DELETE for single collection

module.exports = router;