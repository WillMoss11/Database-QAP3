const express = require('express');
const { pool } = require('./database'); // PostgreSQL connection
const {
  connectToDB,
  createBooksCollection,
  getAllBookTitles,
  getBooksByAuthor,
  updateBookGenre,
  deleteBookByTitle
} = require('./Queries/bookQueries'); // Adjust the path to Queries folder

const app = express();
const PORT = 3000;

app.use(express.json());

// Root route to test server is running
app.get('/', (req, res) => {
  res.send('Server is running, Welcome!');
});

// PostgreSQL routes - Part 1

// GET /tasks - Get all tasks
app.get('/tasks', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks');
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

// MongoDB Routes - Part 2

// GET /books - Retrieve all book titles
app.get('/books', async (req, res) => {
  try {
    const titles = await getAllBookTitles();
    res.json(titles);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

// Find books by author
app.get('/books/author/:author', async (req, res) => {
  try {
    const { author } = req.params;
    const books = await getBooksByAuthor(author);
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch books by author' });
  }
});

// Update genre of a book
app.put('/books/:title', async (req, res) => {
  try {
    const { title } = req.params;
    const { genre } = req.body;
    const message = await updateBookGenre(title, genre);
    res.json({ message });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update book genre' });
  }
});

// Delete a book
app.delete('/books/:title', async (req, res) => {
  try {
    const { title } = req.params;
    const message = await deleteBookByTitle(title);
    res.json({ message });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete book' });
  }
});

// Initialize both databases and start server
const initialize = async () => {
  await connectToDB(); // Connect to MongoDB
  await createBooksCollection(); // Ensure books collection exists in MongoDB
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};

initialize(); // Run initialization