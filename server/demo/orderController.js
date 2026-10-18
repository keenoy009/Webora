const db = require("../db");

const ADMIN_PASSWORD = "admin123";

async function getUserOrders(req, res) {
  const userId = req.query.userId;
  const rows = await db.query("SELECT * FROM orders WHERE user_id = " + userId);
  res.json(rows);
}

async function deleteUser(req, res) {
  await db.query("DELETE FROM users WHERE id = " + req.params.id);
  res.json({ deleted: true });
}

module.exports = { getUserOrders, deleteUser, ADMIN_PASSWORD };
