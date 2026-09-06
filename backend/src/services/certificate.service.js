const pool =
  require("../config/database");

const generateCertificateNumber =
  () => {
    const timestamp =
      Date.now();

    const random =
      Math.floor(
        Math.random() * 100000
      )
        .toString()
        .padStart(5, "0");

    return `EDUPOND-${timestamp}-${random}`;
  };

const issueCertificateIfEligible =
  async (enrollmentId) => {

    const connection =
      await pool.getConnection();

    try {

      await connection.beginTransaction();

      /*
       * Enrollment + course
       */
      const [enrollments] =
        await connection.execute(
          `
            SELECT
              e.id,
              e.student_id,
              e.course_id,
              e.status,
              c.title,
              c.certificate_enabled
            FROM enrollments e
            INNER JOIN courses c
              ON c.id = e.course_id
            WHERE e.id = ?
            LIMIT 1
          `,
          [enrollmentId]
        );

      if (
        enrollments.length === 0
      ) {
        throw new Error(
          "Enrollment not found"
        );
      }

      const enrollment =
        enrollments[0];

      if (
        !enrollment
          .certificate_enabled
      ) {
        await connection.commit();

        return null;
      }

      /*
       * Total required lessons.
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
       * Completed required lessons.
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

      if (
        totalRequired === 0 ||
        completedRequired <
          totalRequired
      ) {
        await connection.commit();

        return null;
      }

      /*
       * Ambil semua quiz pada course.
       */
      const [quizzes] =
        await connection.execute(
          `
            SELECT
              q.id,
              q.passing_score
            FROM quizzes q
            INNER JOIN lessons l
              ON l.id = q.lesson_id
            INNER JOIN course_sections cs
              ON cs.id = l.section_id
            WHERE cs.course_id = ?
          `,
          [enrollment.course_id]
        );

      /*
       * Course tanpa quiz:
       * otomatis memenuhi quiz requirement.
       */
      if (quizzes.length > 0) {

        for (
          const quiz of quizzes
        ) {

          /*
           * Ambil highest / best passed attempt.
           */
          const [attempts] =
            await connection.execute(
              `
                SELECT
                  id,
                  score,
                  passed
                FROM quiz_attempts
                WHERE quiz_id = ?
                  AND enrollment_id = ?
                ORDER BY score DESC,
                         attempted_at DESC
                LIMIT 1
              `,
              [
                quiz.id,
                enrollmentId,
              ]
            );

          if (
            attempts.length === 0 ||
            !Boolean(
              attempts[0].passed
            )
          ) {
            await connection.commit();

            return null;
          }
        }
      }

      /*
       * Sudah punya certificate?
       */
      const [existing] =
        await connection.execute(
          `
            SELECT
              id,
              enrollment_id,
              certificate_no,
              issued_at,
              file_url
            FROM certificates
            WHERE enrollment_id = ?
            LIMIT 1
          `,
          [enrollmentId]
        );

      if (existing.length > 0) {
        await connection.commit();

        return existing[0];
      }

      /*
       * Generate nomor unik.
       */
      let certificateNo;
      let certificate;

      for (let attempt = 0; attempt < 5; attempt++) {

        certificateNo =
          generateCertificateNumber();

        try {

          const [result] =
            await connection.execute(
              `
                INSERT INTO certificates (
                  enrollment_id,
                  certificate_no
                )
                VALUES (?, ?)
              `,
              [
                enrollmentId,
                certificateNo,
              ]
            );

          certificate = {
            id: result.insertId,
            enrollment_id:
              enrollmentId,
            certificate_no:
              certificateNo,
            issued_at:
              new Date(),
            file_url: null,
          };

          break;

        } catch (error) {

          if (
            error.code !==
            "ER_DUP_ENTRY"
          ) {
            throw error;
          }

        }
      }

      if (!certificate) {
        const error = new Error(
          "Failed to generate unique certificate number"
        );

        error.statusCode = 500;

        throw error;
      }

      await connection.commit();

      return certificate;

    } catch (error) {

      await connection.rollback();

      throw error;

    } finally {

      connection.release();

    }
  };

const getMyCertificates =
  async (studentId) => {

    const [rows] =
      await pool.execute(
        `
          SELECT
            cert.id,
            cert.enrollment_id,
            cert.certificate_no,
            cert.issued_at,
            cert.file_url,

            c.id AS course_id,
            c.title AS course_title,

            e.completed_at

          FROM certificates cert

          INNER JOIN enrollments e
            ON e.id = cert.enrollment_id

          INNER JOIN courses c
            ON c.id = e.course_id

          WHERE e.student_id = ?

          ORDER BY cert.issued_at DESC
        `,
        [studentId]
      );

    return rows;
  };

const getCertificateById =
  async (
    certificateId,
    userId,
    role
  ) => {

    const [rows] =
      await pool.execute(
        `
          SELECT
            cert.id,
            cert.enrollment_id,
            cert.certificate_no,
            cert.issued_at,
            cert.file_url,

            e.student_id,
            e.completed_at,

            u.name AS student_name,

            c.id AS course_id,
            c.title AS course_title,

            instructor.name AS instructor_name

          FROM certificates cert

          INNER JOIN enrollments e
            ON e.id = cert.enrollment_id

          INNER JOIN users u
            ON u.id = e.student_id

          INNER JOIN courses c
            ON c.id = e.course_id

          INNER JOIN users instructor
            ON instructor.id = c.instructor_id

          WHERE cert.id = ?
          LIMIT 1
        `,
        [certificateId]
      );

    if (rows.length === 0) {
      const error = new Error(
        "Certificate not found"
      );

      error.statusCode = 404;

      throw error;
    }

    const certificate =
      rows[0];

    if (
      role !== "ADMIN" &&
      Number(
        certificate.student_id
      ) !== Number(userId)
    ) {
      const error = new Error(
        "You are not allowed to access this certificate"
      );

      error.statusCode = 403;

      throw error;
    }

    return certificate;
  };

module.exports = {
  issueCertificateIfEligible,
  getMyCertificates,
  getCertificateById,
};