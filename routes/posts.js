const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const { validatePost } = require("../utils/validation");

// GET all posts
router.get("/", async (req, res, next) => {
  try {
    const posts = await Post.find().populate("collectionId");
    res.json(posts);
  } catch (error) {
    next(error);
  }
});

// Get random posts
router.get("/random", async (req, res, next) => {
  try {
    const count = parseInt(req.query.count) || 10;
    const randomPosts = await Post.aggregate([
      // Stage 1: Group by collection
      {
        $group: {
          _id: { $toObjectId: "$collectionId" }, // Convert string to ObjectId
          posts: { $push: "$$ROOT" },
        },
      },
      // Stage 2: Get a random post from each collection
      {
        $project: {
          randomPost: {
            $arrayElemAt: [
              "$posts",
              { $floor: { $multiply: [{ $rand: {} }, { $size: "$posts" }] } },
            ],
          },
        },
      },
      // Stage 3: Unwind to flatten the result
      { $replaceRoot: { newRoot: "$randomPost" } },
      // Stage 4: Sample to get the desired number of posts
      { $sample: { size: count } },
      // Stage 5: Lookup to get collection details
      {
        $lookup: {
          from: "collections",
          localField: "collectionId",
          foreignField: "_id",
          as: "collection",
        },
      },
      // Stage 6: Unwind the collection array
      { $unwind: "$collection" },
      // Stage 7: Project to shape the final output
      {
        $project: {
          _id: { $toString: "$_id" }, // Convert ObjectId to string
          content: 1,
          collectionName: "$collection.name",
          collectionId: { $toString: "$collectionId" }, // Convert ObjectId to string
          reactions: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);
    res.json(randomPosts);
  } catch (error) {
    next(error);
  }
});

// Get post by id
router.get("/:postId", async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.json(post);
  } catch (error) {
    next(error);
  }
});

// GET all posts by collectionId
router.get("/collection/:collectionId", async (req, res, next) => {
  try {
    const posts = await Post.find({ collectionId: req.params.collectionId });
    res.json(posts);
  } catch (error) {
    next(error);
  }
});

// POST new post
router.post("/", validatePost, async (req, res, next) => {
  try {
    const post = new Post(req.body);
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    next(error);
  }
});

// POST reaction to post
router.post("/:postId/react", async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { reaction, amount } = req.body;
    const validReactions = [
      "like",
      "mindBlowing",
      "alreadyKnew",
      "hardToBelieve",
      "interesting",
    ];
    if (!validReactions.includes(reaction)) {
      return res.status(400).json({ error: "Invalid reaction type" });
    }
    if (amount !== 1 && amount !== -1) {
      return res.status(400).json({ error: "Invalid amount. Must be 1 or -1" });
    }
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    post.reactions[reaction] = Math.max(0, post.reactions[reaction] + amount);
    await post.save();
    res.json(post.reactions);
  } catch (error) {
    next(error);
  }
});

// ... implement GET, PUT, DELETE for single post

module.exports = router;
