// NEW FILE (Phase 4): Ask Course student-request and admin-demand business logic.
const pool = require("../config/database");

const getCategory = async (categoryId) => {
  const [rows] = await pool.execute(
    `SELECT id, name FROM categories WHERE id = ? AND status = 'ACTIVE' LIMIT 1`,
    [categoryId]
  );
  if (!rows.length) {
    const error = new Error("Category not found or inactive");
    error.statusCode = 400;
    throw error;
  }
  return rows[0];
};

const createRequest = async ({ studentId, categoryId, courseName, reason }) => {
  await getCategory(categoryId);
  if (!courseName?.trim() || !reason?.trim()) {
    const error = new Error("Course name and reason are required");
    error.statusCode = 400;
    throw error;
  }

  const [result] = await pool.execute(
    `INSERT INTO student_course_requests
      (student_id, category_id, course_name, reason, status)
     VALUES (?, ?, ?, ?, 'PENDING')`,
    [studentId, categoryId, courseName.trim(), reason.trim()]
  );

  return getRequestById(result.insertId);
};

const getRequestById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT
       r.id, r.student_id, u.name AS student_name,
       r.category_id, c.name AS category_name,
       r.course_name, r.reason, r.status, r.admin_note,
       r.reviewed_by, r.reviewed_at, r.created_at, r.updated_at
     FROM student_course_requests r
     INNER JOIN users u ON u.id = r.student_id
     INNER JOIN categories c ON c.id = r.category_id
     WHERE r.id = ? LIMIT 1`,
    [id]
  );
  if (!rows.length) {
    const error = new Error("Course request not found");
    error.statusCode = 404;
    throw error;
  }
  return rows[0];
};

const getMyRequests = async (studentId) => {
  const [rows] = await pool.execute(
    `SELECT
       r.id, r.category_id, c.name AS category_name,
       r.course_name, r.reason, r.status, r.admin_note,
       r.reviewed_at, r.created_at
     FROM student_course_requests r
     INNER JOIN categories c ON c.id = r.category_id
     WHERE r.student_id = ?
     ORDER BY r.created_at DESC`,
    [studentId]
  );
  return rows;
};

const listAllRequests = async ({ status, categoryId }) => {
  let query = `
    SELECT
      r.id, r.student_id, u.name AS student_name,
      r.category_id, c.name AS category_name,
      r.course_name, r.reason, r.status, r.admin_note,
      r.reviewed_at, r.created_at
    FROM student_course_requests r
    INNER JOIN users u ON u.id = r.student_id
    INNER JOIN categories c ON c.id = r.category_id
    WHERE 1 = 1
  `;
  const params = [];

  if (status) {
    query += " AND r.status = ?";
    params.push(status);
  }
  if (categoryId) {
    query += " AND r.category_id = ?";
    params.push(categoryId);
  }

  query += " ORDER BY r.created_at DESC";
  const [rows] = await pool.execute(query, params);
  return rows;
};

const getAggregatedDemand = async () => {
  const [rows] = await pool.execute(
    `SELECT
       r.category_id,
       c.name AS category_name,
       r.course_name,
       COUNT(*) AS request_count
     FROM student_course_requests r
     INNER JOIN categories c ON c.id = r.category_id
     WHERE r.status IN ('PENDING', 'APPROVED')
     GROUP BY r.category_id, c.name, r.course_name
     ORDER BY request_count DESC, r.course_name ASC`
  );
  return rows;
};

const reviewRequest = async (id, adminId, status, adminNote) => {
  const request = await getRequestById(id);
  const allowed = ["APPROVED", "REJECTED", "POSTED", "ARCHIVED"];
  if (!allowed.includes(status)) {
    const error = new Error("Invalid request status");
    error.statusCode = 400;
    throw error;
  }
  if (!["PENDING", "APPROVED"].includes(request.status) && status !== "ARCHIVED") {
    const error = new Error("This request has already been processed");
    error.statusCode = 409;
    throw error;
  }

  await pool.execute(
    `UPDATE student_course_requests
     SET status = ?, admin_note = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [status, adminNote?.trim() || null, adminId, id]
  );
  return getRequestById(id);
};

module.exports = {
  createRequest,
  getMyRequests,
  listAllRequests,
  getAggregatedDemand,
  reviewRequest,
};
