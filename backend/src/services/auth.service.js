const bcrypt = require("bcrypt");
const pool = require("../config/database");

const registerUser = async ({
  name,
  email,
  password,
  role,
}) => {
  const [existingUsers] = await pool.execute(
    `SELECT id
     FROM users
     WHERE email = ?
     LIMIT 1`,
    [email]
  );

  if (existingUsers.length > 0) {
    const error = new Error("Email is already registered");
    error.statusCode = 409;
    throw error;
  }

  const [roles] = await pool.execute(
    `SELECT id, name
     FROM roles
     WHERE name = ?
     LIMIT 1`,
    [role]
  );

  if (roles.length === 0) {
    const error = new Error("Invalid role");
    error.statusCode = 400;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const [result] = await pool.execute(
    `INSERT INTO users (
      role_id,
      name,
      email,
      password_hash,
      status
    )
    VALUES (?, ?, ?, ?, 'ACTIVE')`,
    [
      roles[0].id,
      name,
      email,
      passwordHash,
    ]
  );

  return {
    id: result.insertId,
    name,
    email,
    role,
  };
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
  registerUser,
  login,
};