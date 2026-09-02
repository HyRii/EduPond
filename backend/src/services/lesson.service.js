const pool = require("../config/database");

const getSectionById = async (sectionId) => {
  const [rows] = await pool.execute(
    `SELECT
      cs.id,
      cs.course_id,
      c.instructor_id
    FROM course_sections cs
    INNER JOIN courses c
      ON c.id = cs.course_id
    WHERE cs.id = ?
    LIMIT 1`,
    [sectionId]
  );

  if (rows.length === 0) {
    const error = new Error("Section not found");
    error.statusCode = 404;
    throw error;
  }

  return rows[0];
};

const getLessonById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT
      l.id,
      l.section_id,
      cs.course_id,
      c.instructor_id,
      l.title,
      l.description,
      l.content_type,
      l.content_url,
      l.resource_url,
      l.duration_minutes,
      l.is_required,
      l.sort_order,
      l.created_at,
      l.updated_at
    FROM lessons l
    INNER JOIN course_sections cs
      ON cs.id = l.section_id
    INNER JOIN courses c
      ON c.id = cs.course_id
    WHERE l.id = ?
    LIMIT 1`,
    [id]
  );

  if (rows.length === 0) {
    const error = new Error("Lesson not found");
    error.statusCode = 404;
    throw error;
  }

  return rows[0];
};

const createLesson = async (
  sectionId,
  userId,
  userRole,
  {
    title,
    description,
    contentType,
    contentUrl,
    resourceUrl,
    durationMinutes,
    isRequired,
    sortOrder,
  }
) => {
  const section = await getSectionById(sectionId);

  if (
    userRole !== "ADMIN" &&
    section.instructor_id !== userId
  ) {
    const error = new Error(
      "You can only manage lessons of your own course"
    );
    error.statusCode = 403;
    throw error;
  }

  const [result] = await pool.execute(
    `INSERT INTO lessons (
      section_id,
      title,
      description,
      content_type,
      content_url,
      resource_url,
      duration_minutes,
      is_required,
      sort_order
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      sectionId,
      title,
      description || null,
      contentType || "VIDEO",
      contentUrl || null,
      resourceUrl || null,
      durationMinutes ?? null,
      isRequired ?? true,
      sortOrder ?? 1,
    ]
  );

  return getLessonById(result.insertId);
};

const getLessonsBySectionId = async (sectionId) => {
  await getSectionById(sectionId);

  const [rows] = await pool.execute(
    `SELECT
      id,
      section_id,
      title,
      description,
      content_type,
      content_url,
      resource_url,
      duration_minutes,
      is_required,
      sort_order,
      created_at,
      updated_at
    FROM lessons
    WHERE section_id = ?
    ORDER BY sort_order ASC, id ASC`,
    [sectionId]
  );

  return rows;
};

const updateLesson = async (
  id,
  userId,
  userRole,
  {
    title,
    description,
    contentType,
    contentUrl,
    resourceUrl,
    durationMinutes,
    isRequired,
    sortOrder,
  }
) => {
  const lesson = await getLessonById(id);

  if (
    userRole !== "ADMIN" &&
    lesson.instructor_id !== userId
  ) {
    const error = new Error(
      "You can only update lessons of your own course"
    );
    error.statusCode = 403;
    throw error;
  }

  await pool.execute(
    `UPDATE lessons
     SET
       title = ?,
       description = ?,
       content_type = ?,
       content_url = ?,
       resource_url = ?,
       duration_minutes = ?,
       is_required = ?,
       sort_order = ?
     WHERE id = ?`,
    [
      title ?? lesson.title,
      description !== undefined
        ? description
        : lesson.description,
      contentType ?? lesson.content_type,
      contentUrl !== undefined
        ? contentUrl
        : lesson.content_url,
      resourceUrl !== undefined
        ? resourceUrl
        : lesson.resource_url,
      durationMinutes !== undefined
        ? durationMinutes
        : lesson.duration_minutes,
      isRequired !== undefined
        ? isRequired
        : lesson.is_required,
      sortOrder ?? lesson.sort_order,
      id,
    ]
  );

  return getLessonById(id);
};

const deleteLesson = async (
  id,
  userId,
  userRole
) => {
  const lesson = await getLessonById(id);

  if (
    userRole !== "ADMIN" &&
    lesson.instructor_id !== userId
  ) {
    const error = new Error(
      "You can only delete lessons of your own course"
    );
    error.statusCode = 403;
    throw error;
  }

  await pool.execute(
    `DELETE FROM lessons
     WHERE id = ?`,
    [id]
  );

  return lesson;
};

module.exports = {
  createLesson,
  getLessonsBySectionId,
  updateLesson,
  deleteLesson,
};