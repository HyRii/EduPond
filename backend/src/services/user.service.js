const pool = require("../config/database");

const listUsers = async ({ role, status }) => {
  let query = `
    SELECT
      u.id,
      u.name,
      u.email,
      u.status,
      u.created_at,
      u.updated_at,
      r.name AS role
    FROM users u
    INNER JOIN roles r ON r.id = u.role_id
    WHERE 1 = 1
  `;

  const params = [];

  if (role) {
    query += " AND r.name = ?";
    params.push(role);
  }

  if (status) {
    query += " AND u.status = ?";
    params.push(status);
  }

  query += " ORDER BY u.created_at DESC";

  const [rows] = await pool.execute(
    query,
    params
  );

  return rows;
};

const updateUserStatus = async (
  userId,
  status
) => {
  const allowedStatuses = [
    "ACTIVE",
    "INACTIVE",
  ];

  if (!allowedStatuses.includes(status)) {
    const error = new Error(
      "Invalid user status"
    );

    error.statusCode = 400;

    throw error;
  }

  const [result] = await pool.execute(
    `UPDATE users
     SET status = ?
     WHERE id = ?`,
    [status, userId]
  );

  if (result.affectedRows === 0) {
    const error = new Error(
      "User not found"
    );

    error.statusCode = 404;

    throw error;
  }

  const [rows] = await pool.execute(
    `SELECT
        u.id,
        u.name,
        u.email,
        u.status,
        u.created_at,
        u.updated_at,
        r.name AS role
     FROM users u
     INNER JOIN roles r
       ON r.id = u.role_id
     WHERE u.id = ?
     LIMIT 1`,
    [userId]
  );

  return rows[0];
};

module.exports = {
  listUsers,
  updateUserStatus,
};