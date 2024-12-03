// bookQueries.js
const { MongoClient } = require('mongodb');

const mongoUrl = 'mongodb://localhost:27017';
const dbName = 'booksDB';

let db;

// Connect to the MongoDB database
const connectToDB = async () => {
  const client = new MongoClient(mongoUrl);
  try {
    await client.connect();
    db = client.db(dbName);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
  }
};

// Ensure books collection exists and insert sample data
const createBooksCollection = async () => {
  try {
    const collection = db.collection('books');
    const books = await collection.find().toArray();
    if (books.length === 0) {
      await collection.insertMany([
        { title: 'The Hobbit', author: 'J.R.R. Tolkien', genre: 'Fantasy', year: 1937 },
        { title: 'To Kill a Mockingbird', author: 'Harper Lee', genre: 'Fiction', year: 1960 },
        { title: '1984', author: 'George Orwell', genre: 'Dystopian', year: 1949 }
      ]);
      console.log('Inserted sample books data');
    }
  } catch (err) {
    console.error('Error creating books collection or inserting data:', err);
  }
};

// Get all book titles
const getAllBookTitles = async () => {
  try {
    const collection = db.collection('books');
    const books = await collection.find().toArray();
    return books.map(book => book.title);
  } catch (err) {
    throw new Error('Failed to fetch books titles');
  }
};

// Find books by author
const getBooksByAuthor = async (author) => {
  try {
    const collection = db.collection('books');
    return await collection.find({ author }).toArray();
  } catch (err) {
    throw new Error('Failed to fetch books by author');
  }
};

// Update book genre by title
const updateBookGenre = async (title, genre) => {
  try {
    const collection = db.collection('books');
    const result = await collection.updateOne(
      { title },
      { $set: { genre } }
    );
    if (result.modifiedCount === 0) {
      throw new Error('Book not found');
    }
    return 'Book genre updated successfully';
  } catch (err) {
    throw new Error('Failed to update book genre');
  }
};

// Delete a book by title
const deleteBookByTitle = async (title) => {
  try {
    const collection = db.collection('books');
    const result = await collection.deleteOne({ title });
    if (result.deletedCount === 0) {
      throw new Error('Book not found');
    }
    return 'Book deleted successfully';
  } catch (err) {
    throw new Error('Failed to delete book');
  }
};

module.exports = {
  connectToDB,
  createBooksCollection,
  getAllBookTitles,
  getBooksByAuthor,
  updateBookGenre,
  deleteBookByTitle
};
