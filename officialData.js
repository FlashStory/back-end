require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs").promises;
const path = require("path");
const Collection = require("./models/Collection");
const Post = require("./models/Post");
const Topic = require("./models/Topic");
const connectDB = require("./config/database");

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Collection.deleteMany({});
    await Post.deleteMany({});
    await Topic.deleteMany({});

    // Read JSON file
    const rawData = await fs.readFile(
      path.join(__dirname, "data.json"),
      "utf8"
    );
    const collections = JSON.parse(rawData);

    // Create a map to store topics
    const topicMap = new Map();

    for (const collectionData of collections) {
      // Create or get topic if it exists
      if (collectionData.topic) {
        let topic = topicMap.get(collectionData.topic);
        if (!topic) {
          topic = new Topic({ name: collectionData.topic });
          await topic.save();
          topicMap.set(collectionData.topic, topic);
        }
      }

      const collection = new Collection({
        name: collectionData.name,
        avatar: collectionData.avatar,
      });

      const posts = collectionData.posts.map(
        (postContent) =>
          new Post({
            content: postContent,
            collectionName: collectionData.name,
            collectionId: collection._id,
          })
      );

      // Save posts and get their IDs
      const savedPosts = await Post.insertMany(posts);

      // Add post IDs to the collection
      collection.posts = savedPosts.map((post) => post._id);

      // If the collection has a topic, add it to the topic's collections
      if (collectionData.topic) {
        const topic = topicMap.get(collectionData.topic);
        topic.collections.push(collection._id);
        await topic.save();
      }

      // Save the collection
      await collection.save();
    }

    console.log("Seed data inserted successfully");
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    await mongoose.disconnect();
  }
};

seedData();
