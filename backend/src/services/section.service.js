const pool = require("../config/database");

const getCourseById = async (courseId) => {
  const [rows] = await pool.execute(
    `SELECT id, instructor_id
     FROM courses
     WHERE id = ?
     LIMIT 1`,
    [courseId]
  );

  if (rows.length === 0) {
    const error = new Error("Course not found");
    error.statusCode = 404;
    throw error;
  }

  return rows[0];
};

const getSectionById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT
      cs.id,
      cs.course_id,
      c.instructor_id,
      cs.title,
      cs.description,
      cs.sort_order,
      cs.created_at,
      cs.updated_at
    FROM course_sections cs
    INNER JOIN courses c
      ON c.id = cs.course_id
    WHERE cs.id = ?
    LIMIT 1`,
    [id]
  );

  if (rows.length === 0) {
    const error = new Error("Section not found");
    error.statusCode = 404;
    throw error;
  }

  return rows[0];
};

const createSection = async (
  courseId,
  userId,
  userRole,
  {
    title,
    description,
    sortOrder,
  }
) => {
  const course = await getCourseById(courseId);

  if (
    userRole !== "ADMIN" &&
    course.instructor_id !== userId
  ) {
    const error = new Error(
      "You can only manage sections of your own course"
    );
    error.statusCode = 403;
    throw error;
  }

  const [result] = await pool.execute(
    `INSERT INTO course_sections (
      course_id,
      title,
      description,
      sort_order
    )
    VALUES (?, ?, ?, ?)`,
    [
      courseId,
      title,
      description || null,
      sortOrder ?? 1,
    ]
  );

  return getSectionById(result.insertId);
};

const getSectionsByCourseId = async (courseId) => {
  await getCourseById(courseId);

  const [rows] = await pool.execute(
    `SELECT
      id,
      course_id,
      title,
      description,
      sort_order,
      created_at,
      updated_at
    FROM course_sections
    WHERE course_id = ?
    ORDER BY sort_order ASC, id ASC`,
    [courseId]
  );

  return rows;
};

const updateSection = async (
  id,
  userId,
  userRole,
  {
    title,
    description,
    sortOrder,
  }
) => {
  const section = await getSectionById(id);

  if (
    userRole !== "ADMIN" &&
    section.instructor_id !== userId
  ) {
    const error = new Error(
      "You can only update sections of your own course"
    );
    error.statusCode = 403;
    throw error;
  }

  await pool.execute(
    `UPDATE course_sections
     SET
       title = ?,
       description = ?,
       sort_order = ?
     WHERE id = ?`,
    [
      title ?? section.title,
      description !== undefined
        ? description
        : section.description,
      sortOrder ?? section.sort_order,
      id,
    ]
  );

  return getSectionById(id);
};

const deleteSection = async (
  id,
  userId,
  userRole
) => {
  const section = await getSectionById(id);

  if (
    userRole !== "ADMIN" &&
    section.instructor_id !== userId
  ) {
    const error = new Error(
      "You can only delete sections of your own course"
    );
    error.statusCode = 403;
    throw error;
  }

  await pool.execute(
    `DELETE FROM course_sections
     WHERE id = ?`,
    [id]
  );

  return section;
};

module.exports = {
  createSection,
  getSectionsByCourseId,
  updateSection,
  deleteSection,
};