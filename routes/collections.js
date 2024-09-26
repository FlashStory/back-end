const express = require("express");
const router = express.Router();
const Collection = require("../models/Collection");
const Topic = require("../models/Topic");
const { validateCollection } = require("../utils/validation");

// GET all collections
router.get("/", async (req, res, next) => {
  try {
    const collections = await Collection.find();
    res.json(collections);
  } catch (error) {
    next(error);
  }
});

// GET all topics
router.get("/topics", async (req, res, next) => {
  try {
    const topics = await Topic.find();
    res.json(topics);
  } catch (error) {
    next(error);
  }
});

// GET collections by topic
router.get("/topic/:topicId", async (req, res, next) => {
  try {
    const topic = await Topic.findById(req.params.topicId).populate(
      "collections"
    );
    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }
    res.json(topic.collections);
  } catch (error) {
    next(error);
  }
});

// POST new collection
router.post("/", validateCollection, async (req, res, next) => {
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
