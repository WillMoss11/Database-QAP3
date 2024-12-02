// db.js
const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017';  // Change this if you're using a cloud MongoDB instance
const dbName = 'booksDB';

async function connectToDB() {
    const client = new MongoClient(url);
    await client.connect();
    console.log("Connected to MongoDB");
    return client.db(dbName);
}

module.exports = connectToDB;
