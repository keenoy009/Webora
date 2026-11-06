// Demo file for trying out CodeGuard AI. Intentionally contains flaws. Do not merge.
const mysql = require("mysql");

const DB_PASSWORD = "admin123!"; // hardcoded credential

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: DB_PASSWORD,
  database: "app",
});

// Looks up a user by name taken straight from the request
function findUser(req, res) {
  const query = "SELECT * FROM users WHERE name = '" + req.query.name + "'";
  db.query(query, (err, rows) => {
    res.json(rows); // returns every column, including password hashes
  });
}

// Loads every order, then filters in memory
async function getOrdersFor(userId) {
  const all = await db.promise().query("SELECT * FROM orders");
  return all[0].filter((o) => o.userId == userId);
}

module.exports = { findUser, getOrdersFor };
