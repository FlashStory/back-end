require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
const Collection = require('./models/Collection');
const Post = require('./models/Post');
const connectDB = require('./config/database');

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Collection.deleteMany({});
    await Post.deleteMany({});

    // Read JSON file
    const rawData = await fs.readFile(path.join(__dirname, 'data.json'), 'utf8');
    const collections = JSON.parse(rawData);

    for (const collectionData of collections) {
      const collection = new Collection({
        name: collectionData.name,
        avatar: collectionData.avatar
      });

      const posts = collectionData.posts.map(postContent => 
        new Post({ 
          content: postContent,
          collectionName: collectionData.name,
          collectionId: collection._id
        })
      );

      // Save posts and get their IDs
      const savedPosts = await Post.insertMany(posts);
      
      // Add post IDs to the collection
      collection.posts = savedPosts.map(post => post._id);
      
      // Save the collection
      await collection.save();
    }

    console.log('Seed data inserted successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
  }
};

seedData();