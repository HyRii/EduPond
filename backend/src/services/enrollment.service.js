const pool = require("../config/database");

const enrollCourse = async (studentId, courseId) => {
  // 1. Pastikan course exists dan published
  const [courses] = await pool.execute(
    `
      SELECT
        id,
        title,
        status
      FROM courses
      WHERE id = ?
      LIMIT 1
    `,
    [courseId]
  );

  if (courses.length === 0) {
    const error = new Error("Course not found");
    error.statusCode = 404;
    throw error;
  }

  const course = courses[0];

  if (course.status !== "PUBLISHED") {
    const error = new Error(
      "Only published courses can be enrolled"
    );
    error.statusCode = 400;
    throw error;
  }

  // 2. Cek duplicate enrollment
  const [existing] = await pool.execute(
    `
      SELECT
        id,
        status
      FROM enrollments
      WHERE student_id = ?
        AND course_id = ?
      LIMIT 1
    `,
    [studentId, courseId]
  );

  if (existing.length > 0) {
    const error = new Error(
      "You are already enrolled in this course"
    );
    error.statusCode = 409;
    throw error;
  }

  // 3. Create enrollment
  const [result] = await pool.execute(
    `
      INSERT INTO enrollments (
        student_id,
        course_id
      )
      VALUES (?, ?)
    `,
    [studentId, courseId]
  );

  return {
    id: result.insertId,
    student_id: studentId,
    course_id: courseId,
    status: "ACTIVE",
  };
};

const getMyEnrollments = async (studentId) => {
  const [rows] = await pool.execute(
    `
      SELECT
        e.id,
        e.course_id,
        c.title,
        c.slug,
        c.thumbnail_url,
        c.difficulty,
        c.duration_minutes,
        u.name AS instructor_name,
        cat.name AS category_name,
        e.status,
        e.enrolled_at,
        e.completed_at
      FROM enrollments e
      INNER JOIN courses c
        ON c.id = e.course_id
      INNER JOIN users u
        ON u.id = c.instructor_id
      INNER JOIN categories cat
        ON cat.id = c.category_id
      WHERE e.student_id = ?
      ORDER BY e.enrolled_at DESC
    `,
    [studentId]
  );

  return rows;
};

const getEnrollmentById = async (
  enrollmentId,
  studentId
) => {

  const [rows] =
    await pool.execute(
      `
        SELECT
          e.id,
          e.student_id,
          e.course_id,

          c.title,
          c.slug,
          c.description,
          c.goal,
          c.thumbnail_url,
          c.difficulty,
          c.duration_minutes,

          u.name AS instructor_name,
          cat.name AS category_name,

          e.status,
          e.enrolled_at,
          e.completed_at

        FROM enrollments e

        INNER JOIN courses c
          ON c.id = e.course_id

        INNER JOIN users u
          ON u.id = c.instructor_id

        INNER JOIN categories cat
          ON cat.id = c.category_id

        WHERE e.id = ?
          AND e.student_id = ?

        LIMIT 1
      `,
      [
        enrollmentId,
        studentId,
      ]
    );

  if (rows.length === 0) {

    const error = new Error(
      "Enrollment not found"
    );

    error.statusCode = 404;

    throw error;

  }

  const enrollment = rows[0];

  /*
   * Required lesson count
   */
  const [totalRows] =
    await pool.execute(
      `
        SELECT
          COUNT(*) AS total_required

        FROM lessons l

        INNER JOIN course_sections cs
          ON cs.id = l.section_id

        WHERE cs.course_id = ?
          AND l.is_required = TRUE
      `,
      [enrollment.course_id]
    );

  /*
   * Completed required lesson count
   */
  const [completedRows] =
    await pool.execute(
      `
        SELECT
          COUNT(*) AS completed_required

        FROM lesson_progress lp

        INNER JOIN lessons l
          ON l.id = lp.lesson_id

        INNER JOIN course_sections cs
          ON cs.id = l.section_id

        WHERE lp.enrollment_id = ?
          AND lp.status = 'COMPLETED'
          AND l.is_required = TRUE
          AND cs.course_id = ?
      `,
      [
        enrollmentId,
        enrollment.course_id,
      ]
    );

  /*
   * Individual lesson progress.
   */
  const [progressRows] =
    await pool.execute(
      `
        SELECT
          lp.lesson_id,
          lp.status,
          lp.started_at,
          lp.completed_at

        FROM lesson_progress lp

        INNER JOIN lessons l
          ON l.id = lp.lesson_id

        INNER JOIN course_sections cs
          ON cs.id = l.section_id

        WHERE lp.enrollment_id = ?
          AND cs.course_id = ?
      `,
      [
        enrollmentId,
        enrollment.course_id,
      ]
    );

  const totalRequired =
    Number(
      totalRows[0]
        ?.total_required || 0
    );

  const completedRequired =
    Number(
      completedRows[0]
        ?.completed_required || 0
    );

  const progressPercentage =
    totalRequired === 0
      ? 0
      : Math.round(
          (
            completedRequired /
            totalRequired
          ) *
          100
        );

  return {
    ...enrollment,

    total_required:
      totalRequired,

    completed_required:
      completedRequired,

    progress_percentage:
      progressPercentage,

    lesson_progress:
      progressRows,
  };
};

module.exports = {
  enrollCourse,
  getMyEnrollments,
  getEnrollmentById,
};