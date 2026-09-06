const pool = require("../config/database");

const markLessonComplete = async (
  enrollmentId,
  lessonId,
  studentId
) => {
  const connection =
    await pool.getConnection();

  try {
    await connection.beginTransaction();

    //ACTIVE ENROLLMENTS
    const [enrollments] =
      await connection.execute(
        `
          SELECT
            id,
            student_id,
            course_id,
            status
          FROM enrollments
          WHERE id = ?
            AND student_id = ?
          LIMIT 1
        `,
        [
          enrollmentId,
          studentId,
        ]
      );

    if (enrollments.length === 0) {
      const error = new Error(
        "Enrollment not found"
      );

      error.statusCode = 404;

      throw error;
    }

    const enrollment =
      enrollments[0];

    if (
      enrollment.status !==
      "ACTIVE"
    ) {
      const error = new Error(
        "Enrollment is not active"
      );

      error.statusCode = 400;

      throw error;
    }

    //LESSON IS ON THE COURSE THAT ENROLLED
    const [lessons] =
      await connection.execute(
        `
          SELECT
            l.id,
            l.section_id,
            l.is_required
          FROM lessons l
          INNER JOIN course_sections cs
            ON cs.id = l.section_id
          WHERE l.id = ?
            AND cs.course_id = ?
          LIMIT 1
        `,
        [
          lessonId,
          enrollment.course_id,
        ]
      );

    if (lessons.length === 0) {
      const error = new Error(
        "Lesson does not belong to this course"
      );

      error.statusCode = 400;

      throw error;
    }

    //LESSON PROGRESS
    await connection.execute(
      `
        INSERT INTO lesson_progress (
          enrollment_id,
          lesson_id,
          status,
          started_at,
          completed_at
        )
        VALUES (
          ?,
          ?,
          'COMPLETED',
          COALESCE(
            (
              SELECT started_at
              FROM (
                SELECT started_at
                FROM lesson_progress
                WHERE enrollment_id = ?
                  AND lesson_id = ?
                LIMIT 1
              ) AS existing_progress
            ),
            CURRENT_TIMESTAMP
          ),
          CURRENT_TIMESTAMP
        )
        ON DUPLICATE KEY UPDATE
          status = 'COMPLETED',
          completed_at = CURRENT_TIMESTAMP
      `,
      [
        enrollmentId,
        lessonId,
        enrollmentId,
        lessonId,
      ]
    );

    // REQUIRED LESSON
    const [totalRows] =
      await connection.execute(
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

    //COMPLETED LESSON
    const [completedRows] =
      await connection.execute(
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

    let enrollmentStatus =
      enrollment.status;

    let completedAt = null;

    
    if (
      totalRequired > 0 &&
      completedRequired >=
        totalRequired
    ) {
      completedAt =
        new Date();

      enrollmentStatus =
        "COMPLETED";

      await connection.execute(
        `
          UPDATE enrollments
          SET
            status = 'COMPLETED',
            completed_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `,
        [enrollmentId]
      );
    }

    await connection.commit();

    return {
      enrollmentId:
        enrollmentId,

      lessonId:
        lessonId,

      progressPercentage,

      totalRequired,

      completedRequired,

      enrollmentStatus,

      completedAt,
    };

  } catch (error) {

    await connection.rollback();

    throw error;

  } finally {

    connection.release();

  }
};

module.exports = {
  markLessonComplete,
};