const express = require('express');
const { Pool } = require('pg');
const { insertBooks, getBookTitles, getBooksByAuthor, updateBookGenre, deleteBook } = require('./Queries/bookQueries'); // Adjusted import
const app = express();
const PORT = 3000;

// PostgreSQL connection pool
const pool = new Pool({
    user: 'your_username', // Replace with your PostgreSQL username
    host: 'localhost', // Update if necessary
    database: 'your_database', // Replace with your PostgreSQL database name
    password: 'your_password', // Replace with your PostgreSQL password
    port: 5432, // Default PostgreSQL port
});

app.use(express.json());

// Check and create tasks table if it doesn't exist
const initializeDatabase = async () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS tasks (
            id SERIAL PRIMARY KEY,
            description TEXT NOT NULL,
            status VARCHAR(50) NOT NULL
        );
    `;
    try {
        await pool.query(createTableQuery);
        console.log("Tasks table is ready.");
    } catch (err) {
        console.error("Error initializing database:", err.message);
    }
};

// MongoDB Routes for Books

// Route to insert books into MongoDB (populate the collection)
app.post('/insert-books', async (req, res) => {
    try {
        await insertBooks();
        res.status(200).json({ message: 'Books inserted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to insert books' });
    }
});

// Route to retrieve all book titles
app.get('/books/titles', async (req, res) => {
    try {
        const titles = await getBookTitles();
        res.json(titles);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve book titles' });
    }
});

// Route to find books by "J.R.R. Tolkien"
app.get('/books/author/jrr-tolkien', async (req, res) => {
    try {
        const books = await getBooksByAuthor();
        res.json(books);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve books by J.R.R. Tolkien' });
    }
});

// Route to update the genre of "1984"
app.put('/books/update-genre', async (req, res) => {
    try {
        await updateBookGenre();
        res.status(200).json({ message: 'Updated the genre of "1984" to "Science Fiction".' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update genre' });
    }
});

// Route to delete "The Hobbit"
app.delete('/books/delete-hobbit', async (req, res) => {
    try {
        await deleteBook();
        res.status(200).json({ message: 'Deleted "The Hobbit".' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete book' });
    }
});

// Existing PostgreSQL Routes for Tasks

// GET /tasks - Get all tasks
app.get('/tasks', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tasks;');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch tasks." });
    }
});

// POST /tasks - Add a new task
app.post('/tasks', async (req, res) => {
    const { description, status } = req.body;
    if (!description || !status) {
        return res.status(400).json({ error: 'Description and status are required.' });
    }
    try {
        const result = await pool.query(
            'INSERT INTO tasks (description, status) VALUES ($1, $2) RETURNING *;',
            [description, status]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Failed to add task." });
    }
});

// PUT /tasks/:id - Update a task's status
app.put('/tasks/:id', async (req, res) => {
    const taskId = parseInt(req.params.id, 10);
    const { status } = req.body;
    if (!status) {
        return res.status(400).json({ error: 'Status is required.' });
    }
    try {
        const result = await pool.query(
            'UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *;',
            [status, taskId]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Task not found.' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Failed to update task." });
    }
});

// DELETE /tasks/:id - Delete a task
app.delete('/tasks/:id', async (req, res) => {
    const taskId = parseInt(req.params.id, 10);
    try {
        const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *;', [taskId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Task not found.' });
        }
        res.json({ message: 'Task deleted successfully.' });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete task." });
    }
});

// Start server and initialize database
app.listen(PORT, async () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    await initializeDatabase();
});
