const pool =
  require("../config/database");

const {
  issueCertificateIfEligible,
} = require("./certificate.service");

const markLessonComplete = async (
  enrollmentId,
  lessonId,
  studentId
) => {

  const connection =
    await pool.getConnection();

  try {

    await connection.beginTransaction();

    /*
     * 1. Pastikan enrollment memang
     *    milik student yang sedang login.
     */
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

    if (
      enrollments.length === 0
    ) {

      const error =
        new Error(
          "Enrollment not found"
        );

      error.statusCode = 404;

      throw error;

    }

    const enrollment =
      enrollments[0];

    /*
     * Hanya enrollment ACTIVE yang
     * boleh menambah lesson progress.
     *
     * Setelah 100%, enrollment menjadi
     * COMPLETED dan tidak bisa kembali
     * ke ACTIVE.
     */
    if (
      enrollment.status !==
      "ACTIVE"
    ) {

      const error =
        new Error(
          "Enrollment is not active"
        );

      error.statusCode = 400;

      throw error;

    }

    /*
     * 2. Pastikan lesson adalah bagian
     *    dari course enrollment.
     */
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

    if (
      lessons.length === 0
    ) {

      const error =
        new Error(
          "Lesson does not belong to this course"
        );

      error.statusCode = 400;

      throw error;

    }

    /*
     * 3. Simpan lesson progress.
     *
     * Unique constraint:
     * enrollment_id + lesson_id
     *
     * membuat operation ini idempotent.
     */
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
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        )
        ON DUPLICATE KEY UPDATE
          status = 'COMPLETED',
          completed_at =
            CURRENT_TIMESTAMP
      `,
      [
        enrollmentId,
        lessonId,
      ]
    );

    /*
     * 4. Total required lesson
     *    pada course.
     */
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

    /*
     * 5. Required lesson yang
     *    sudah completed.
     */
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

    /*
     * 6. Hitung progress percentage.
     */
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

    /*
     * 7. Kalau seluruh required lesson
     *    selesai, tandai enrollment COMPLETED.
     */
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
            completed_at =
              CURRENT_TIMESTAMP
          WHERE id = ?
            AND status = 'ACTIVE'
        `,
        [enrollmentId]
      );

    }

    /*
     * 8. Commit progress terlebih dahulu.
     */
    await connection.commit();

    /*
     * 9. Setelah progress berhasil
     *    disimpan, cek certificate eligibility.
     *
     * Certificate service akan melakukan
     * pengecekan:
     * - progress 100%
     * - certificate_enabled
     * - quiz requirement
     * - certificate belum pernah diterbitkan
     */
    let certificate = null;

    try {

      certificate =
        await issueCertificateIfEligible(
          enrollmentId
        );

    } catch (certificateError) {

      /*
       * Progress tetap dianggap berhasil.
       *
       * Certificate failure tidak boleh
       * melakukan rollback terhadap
       * lesson progress yang sudah committed.
       *
       * Error tetap dilempar agar API memberi
       * tahu frontend bahwa ada masalah
       * certificate generation.
       */
      throw certificateError;

    }

    return {
      enrollmentId,
      lessonId,

      progressPercentage,

      totalRequired,
      completedRequired,

      enrollmentStatus,
      completedAt,

      certificate,
    };

  } catch (error) {

    /*
     * Rollback hanya kalau transaction
     * masih aktif.
     */
    try {
      await connection.rollback();
    } catch (rollbackError) {
      console.error(
        "Progress rollback error:",
        rollbackError
      );
    }

    throw error;

  } finally {

    connection.release();

  }
};

module.exports = {
  markLessonComplete,
};