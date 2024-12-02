const express = require('express');
const { Pool } = require('pg');
const app = express();
const PORT = 3000;

// PostgreSQL connection pool
const pool = new Pool({
    user: 'postgres', // Replace with your PostgreSQL username
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
