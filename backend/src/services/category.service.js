const pool = require("../config/database");

const createCategory = async ({
  name,
  description,
}) => {
  const [existingCategories] = await pool.execute(
    `SELECT id
     FROM categories
     WHERE name = ?
     LIMIT 1`,
    [name]
  );

  if (existingCategories.length > 0) {
    const error = new Error("Category already exists");
    error.statusCode = 409;
    throw error;
  }

  const [result] = await pool.execute(
    `INSERT INTO categories (
      name,
      description,
      status
    )
    VALUES (?, ?, 'ACTIVE')`,
    [name, description || null]
  );

  return {
    id: result.insertId,
    name,
    description: description || null,
    status: "ACTIVE",
  };
};

const getCategories = async () => {
  const [rows] = await pool.execute(
    `SELECT
      id,
      name,
      description,
      status,
      created_at,
      updated_at
     FROM categories
     ORDER BY name ASC`
  );

  return rows;
};

const getCategoryById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT
      id,
      name,
      description,
      status,
      created_at,
      updated_at
     FROM categories
     WHERE id = ?
     LIMIT 1`,
    [id]
  );

  if (rows.length === 0) {
    const error = new Error("Category not found");
    error.statusCode = 404;
    throw error;
  }

  return rows[0];
};

const updateCategory = async (
  id,
  {
    name,
    description,
    status,
  }
) => {
  const existingCategory = await getCategoryById(id);

  if (name && name !== existingCategory.name) {
    const [duplicateCategories] = await pool.execute(
      `SELECT id
       FROM categories
       WHERE name = ?
       AND id != ?
       LIMIT 1`,
      [name, id]
    );

    if (duplicateCategories.length > 0) {
      const error = new Error("Category already exists");
      error.statusCode = 409;
      throw error;
    }
  }

  const updatedName = name ?? existingCategory.name;
  const updatedDescription =
    description ?? existingCategory.description;
  const updatedStatus =
    status ?? existingCategory.status;

  await pool.execute(
    `UPDATE categories
     SET
       name = ?,
       description = ?,
       status = ?
     WHERE id = ?`,
    [
      updatedName,
      updatedDescription,
      updatedStatus,
      id,
    ]
  );

  return getCategoryById(id);
};

const deleteCategory = async (id) => {
  const category = await getCategoryById(id);

  await pool.execute(
    `DELETE FROM categories
     WHERE id = ?`,
    [id]
  );

  return category;
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};