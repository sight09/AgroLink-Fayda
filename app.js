const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// Import MySQL connection
const db = require("./db/config");

// Middleware
app.use(cors());
app.use(express.json());

// Mount auth routes
const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("API is running!");
});

// GET all users
app.get("/users", (req, res) => {
  const query = "SELECT * FROM users";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).send("Database query error");
    }
    res.json(results);
  });
});

// POST add new user
app.post("/users", (req, res) => {
  const { name, email } = req.body;
  const sql = "INSERT INTO users (name, email) VALUES (?, ?)";
  db.query(sql, [name, email], (err, result) => {
    if (err) {
      console.error("Insert error:", err);
      return res.status(500).send("Error inserting data");
    }
    res.json({ message: "User added", id: result.insertId });
  });
});

// PUT update user by id
app.put("/users/:id", (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  const sql = "UPDATE users SET name = ?, email = ? WHERE id = ?";
  db.query(sql, [name, email, id], (err) => {
    if (err) {
      console.error("Update error:", err);
      return res.status(500).send("Error updating data");
    }
    res.send("User updated");
  });
});

// DELETE user by id
app.delete("/users/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM users WHERE id = ?";
  db.query(sql, [id], (err) => {
    if (err) {
      console.error("Delete error:", err);
      return res.status(500).send("Error deleting data");
    }
    res.send("User deleted");
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
