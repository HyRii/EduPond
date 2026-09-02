const pool = require("../config/database");

const createCourse = async ({
  instructorId,
  categoryId,
  title,
  slug,
  description,
  goal,
  difficulty,
  durationMinutes,
  thumbnailUrl,
  certificateEnabled,
}) => {
  const [categories] = await pool.execute(
    `SELECT id
     FROM categories
     WHERE id = ?
     AND status = 'ACTIVE'
     LIMIT 1`,
    [categoryId]
  );

  if (categories.length === 0) {
    const error = new Error("Category not found or inactive");
    error.statusCode = 400;
    throw error;
  }

  const [existingCourses] = await pool.execute(
    `SELECT id
     FROM courses
     WHERE slug = ?
     LIMIT 1`,
    [slug]
  );

  if (existingCourses.length > 0) {
    const error = new Error("Course slug already exists");
    error.statusCode = 409;
    throw error;
  }

  const [result] = await pool.execute(
    `INSERT INTO courses (
      instructor_id,
      category_id,
      title,
      slug,
      description,
      goal,
      difficulty,
      duration_minutes,
      thumbnail_url,
      certificate_enabled,
      status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'DRAFT')`,
    [
      instructorId,
      categoryId,
      title,
      slug,
      description || null,
      goal || null,
      difficulty || "BEGINNER",
      durationMinutes || null,
      thumbnailUrl || null,
      certificateEnabled ?? false,
    ]
  );

  return getCourseById(result.insertId);
};

const getCourses = async () => {
  const [rows] = await pool.execute(
    `SELECT
      c.id,
      c.instructor_id,
      u.name AS instructor_name,
      c.category_id,
      cat.name AS category_name,
      c.title,
      c.slug,
      c.description,
      c.goal,
      c.difficulty,
      c.duration_minutes,
      c.thumbnail_url,
      c.certificate_enabled,
      c.status,
      c.published_at,
      c.created_at,
      c.updated_at
    FROM courses c
    INNER JOIN users u
      ON u.id = c.instructor_id
    INNER JOIN categories cat
      ON cat.id = c.category_id
    ORDER BY c.created_at DESC`
  );

  return rows;
};

const getCourseById = async (courseId) => {
  const [rows] = await pool.execute(
    `SELECT
      c.id,
      c.instructor_id,
      u.name AS instructor_name,
      c.category_id,
      cat.name AS category_name,
      c.title,
      c.slug,
      c.description,
      c.goal,
      c.difficulty,
      c.duration_minutes,
      c.thumbnail_url,
      c.certificate_enabled,
      c.status,
      c.published_at,
      c.created_at,
      c.updated_at
    FROM courses c
    INNER JOIN users u
      ON u.id = c.instructor_id
    INNER JOIN categories cat
      ON cat.id = c.category_id
    WHERE c.id = ?
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

const updateCourse = async (
  courseId,
  userId,
  userRole,
  {
    categoryId,
    title,
    slug,
    description,
    goal,
    difficulty,
    durationMinutes,
    thumbnailUrl,
    certificateEnabled,
  }
) => {
  const course = await getCourseById(courseId);

if (userRole !== "ADMIN" && course.instructor_id !== userId) {
  const error = new Error(
    "You can only update your own course"
  );
  error.statusCode = 403;
  throw error;
}

  if (categoryId !== undefined) {
    const [categories] = await pool.execute(
      `SELECT id
       FROM categories
       WHERE id = ?
       AND status = 'ACTIVE'
       LIMIT 1`,
      [categoryId]
    );

    if (categories.length === 0) {
      const error = new Error(
        "Category not found or inactive"
      );
      error.statusCode = 400;
      throw error;
    }
  }

  if (slug && slug !== course.slug) {
    const [existingCourses] = await pool.execute(
      `SELECT id
       FROM courses
       WHERE slug = ?
       AND id != ?
       LIMIT 1`,
      [slug, courseId]
    );

    if (existingCourses.length > 0) {
      const error = new Error(
        "Course slug already exists"
      );
      error.statusCode = 409;
      throw error;
    }
  }

  await pool.execute(
    `UPDATE courses
     SET
       category_id = ?,
       title = ?,
       slug = ?,
       description = ?,
       goal = ?,
       difficulty = ?,
       duration_minutes = ?,
       thumbnail_url = ?,
       certificate_enabled = ?
     WHERE id = ?`,
    [
      categoryId ?? course.category_id,
      title ?? course.title,
      slug ?? course.slug,
      description ?? course.description,
      goal ?? course.goal,
      difficulty ?? course.difficulty,
      durationMinutes ?? course.duration_minutes,
      thumbnailUrl ?? course.thumbnail_url,
      certificateEnabled ?? course.certificate_enabled,
      courseId,
    ]
  );

  return getCourseById(courseId);
};

const deleteCourse = async (
  courseId,
  userId,
  userRole
) => {
  const course = await getCourseById(courseId);

  if (
    userRole !== "ADMIN" &&
    course.instructor_id !== userId
  ) {
    const error = new Error(
      "You can only delete your own course"
    );
    error.statusCode = 403;
    throw error;
  }

  await pool.execute(
    `DELETE FROM courses
     WHERE id = ?`,
    [courseId]
  );

  return course;
};

module.exports = {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
};