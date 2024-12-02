// bookQueries.js
const database = require('../database'); // Adjust path if it's in another folder

// Sample books data
const sampleBooks = [
    { title: 'The Hobbit', author: 'J.R.R. Tolkien', genre: 'Fantasy', year: 1937 },
    { title: 'To Kill a Mockingbird', author: 'Harper Lee', genre: 'Fiction', year: 1960 },
    { title: '1984', author: 'George Orwell', genre: 'Dystopian', year: 1949 }
];

// Insert the sample books into the collection
async function insertBooks() {
    const db = await connectToDB();
    const booksCollection = db.collection('books');
    await booksCollection.insertMany(sampleBooks);
    console.log("Books inserted successfully.");
}

// Retrieve the titles of all books
async function getBookTitles() {
    const db = await connectToDB();
    const booksCollection = db.collection('books');
    const titles = await booksCollection.find({}, { projection: { title: 1 } }).toArray();
    console.log('Book Titles:', titles);
    return titles;
}

// Find all books written by "J.R.R. Tolkien"
async function getBooksByAuthor() {
    const db = await connectToDB();
    const booksCollection = db.collection('books');
    const books = await booksCollection.find({ author: 'J.R.R. Tolkien' }).toArray();
    console.log('Books by J.R.R. Tolkien:', books);
    return books;
}

// Update the genre of "1984" to "Science Fiction"
async function updateBookGenre() {
    const db = await connectToDB();
    const booksCollection = db.collection('books');
    await booksCollection.updateOne(
        { title: '1984' },
        { $set: { genre: 'Science Fiction' } }
    );
    console.log("Updated the genre of '1984' to 'Science Fiction'.");
}

// Delete the book "The Hobbit"
async function deleteBook() {
    const db = await connectToDB();
    const booksCollection = db.collection('books');
    await booksCollection.deleteOne({ title: 'The Hobbit' });
    console.log("Deleted 'The Hobbit'.");
}

module.exports = { insertBooks, getBookTitles, getBooksByAuthor, updateBookGenre, deleteBook };
