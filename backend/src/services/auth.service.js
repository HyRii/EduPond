const bcrypt = require("bcrypt");
const pool = require("../config/database");

const registerStudent = async ({ name, email, password }) => {
  const connection = await pool.getConnection();

  try {
    const [existingUsers] = await connection.execute(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (existingUsers.length > 0) {
      const error = new Error("Email is already registered");
      error.statusCode = 409;
      throw error;
    }

    const [roles] = await connection.execute(
      "SELECT id FROM roles WHERE name = 'STUDENT' LIMIT 1"
    );

    if (roles.length === 0) {
      const error = new Error("STUDENT role is not configured");
      error.statusCode = 500;
      throw error;
    }

    const studentRoleId = roles[0].id;

    const passwordHash = await bcrypt.hash(password, 12);

    const [result] = await connection.execute(
      `INSERT INTO users
        (role_id, name, email, password_hash, status)
       VALUES (?, ?, ?, ?, 'ACTIVE')`,
      [studentRoleId, name, email, passwordHash]
    );

    return {
      id: result.insertId,
      name,
      email,
      role: "STUDENT",
    };
  } finally {
    connection.release();
  }
};

const login = async ({ email, password }) => {
  const [users] = await pool.execute(
    `SELECT
        u.id,
        u.name,
        u.email,
        u.password_hash,
        u.status,
        r.name AS role
     FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE u.email = ?
     LIMIT 1`,
    [email]
  );

  if (users.length === 0) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const user = users[0];

  if (user.status !== "ACTIVE") {
    const error = new Error("User account is inactive");
    error.statusCode = 403;
    throw error;
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.password_hash
  );

  if (!passwordMatches) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
};

module.exports = {
  registerStudent,
  login,
};