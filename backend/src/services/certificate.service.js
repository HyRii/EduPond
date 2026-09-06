const fs = require("fs/promises");
const path = require("path");
const pool = require("../config/database");
const { renderCertificateJpeg } = require("../utils/certificateTemplate");

const CERTIFICATE_DIR = path.resolve(
  __dirname,
  "../../uploads/certificates"
);

const getAppBaseUrl = () => {
  const configured = String(
    process.env.APP_BASE_URL || ""
  ).trim();

  if (configured) {
    return configured.replace(/\/$/, "");
  }

  return `http://localhost:${process.env.PORT || 3000}`;
};

const generateCertificateNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, "0");

  return `EDUPOND-${timestamp}-${random}`;
};

const buildCertificateUrl = (fileName) =>
  `${getAppBaseUrl()}/uploads/certificates/${encodeURIComponent(fileName)}`;

const getCertificateRenderData = async (certificateId) => {
  const [rows] = await pool.execute(
    `
      SELECT
        cert.id,
        cert.enrollment_id,
        cert.certificate_no,
        cert.issued_at,
        cert.file_url,
        u.name AS student_name,
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

  return rows[0] || null;
};

const generateCertificateFile = async (certificate) => {
  await fs.mkdir(CERTIFICATE_DIR, { recursive: true });

  const fileName = `${certificate.certificate_no}.jpg`;
  const filePath = path.join(CERTIFICATE_DIR, fileName);

  const imageBuffer = await renderCertificateJpeg({
    studentName: certificate.student_name,
    courseTitle: certificate.course_title,
    instructorName: certificate.instructor_name,
    certificateNo: certificate.certificate_no,
    issuedAt: certificate.issued_at,
  });

  await fs.writeFile(filePath, imageBuffer);

  return {
    fileName,
    fileUrl: buildCertificateUrl(fileName),
  };
};

const issueCertificateIfEligible = async (enrollmentId) => {
  const connection = await pool.getConnection();
  let certificateId = null;
  let existingCertificate = null;

  try {
    await connection.beginTransaction();

    const [enrollments] = await connection.execute(
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

    if (enrollments.length === 0) {
      const error = new Error("Enrollment not found");
      error.statusCode = 404;
      throw error;
    }

    const enrollment = enrollments[0];

    if (!Boolean(enrollment.certificate_enabled)) {
      await connection.commit();
      return null;
    }

    const [totalRows] = await connection.execute(
      `
        SELECT COUNT(*) AS total_required
        FROM lessons l
        INNER JOIN course_sections cs
          ON cs.id = l.section_id
        WHERE cs.course_id = ?
          AND l.is_required = TRUE
      `,
      [enrollment.course_id]
    );

    const [completedRows] = await connection.execute(
      `
        SELECT COUNT(*) AS completed_required
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
      [enrollmentId, enrollment.course_id]
    );

    const totalRequired = Number(totalRows[0]?.total_required || 0);
    const completedRequired = Number(
      completedRows[0]?.completed_required || 0
    );

    if (
      totalRequired === 0 ||
      completedRequired < totalRequired
    ) {
      await connection.commit();
      return null;
    }

    const [quizzes] = await connection.execute(
      `
        SELECT q.id
        FROM quizzes q
        INNER JOIN lessons l
          ON l.id = q.lesson_id
        INNER JOIN course_sections cs
          ON cs.id = l.section_id
        WHERE cs.course_id = ?
      `,
      [enrollment.course_id]
    );

    for (const quiz of quizzes) {
      const [attempts] = await connection.execute(
        `
          SELECT passed, score
          FROM quiz_attempts
          WHERE quiz_id = ?
            AND enrollment_id = ?
          ORDER BY passed DESC, score DESC, attempted_at DESC
          LIMIT 1
        `,
        [quiz.id, enrollmentId]
      );

      if (
        attempts.length === 0 ||
        !Boolean(attempts[0].passed)
      ) {
        await connection.commit();
        return null;
      }
    }

    const [existing] = await connection.execute(
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
      existingCertificate = existing[0];
      await connection.commit();
    } else {
      let inserted = null;

      for (let attempt = 0; attempt < 5; attempt += 1) {
        const certificateNo = generateCertificateNumber();

        try {
          const [result] = await connection.execute(
            `
              INSERT INTO certificates (
                enrollment_id,
                certificate_no
              )
              VALUES (?, ?)
            `,
            [enrollmentId, certificateNo]
          );

          inserted = {
            id: result.insertId,
            enrollment_id: Number(enrollmentId),
            certificate_no: certificateNo,
            issued_at: new Date(),
            file_url: null,
          };
          break;
        } catch (error) {
          if (error.code !== "ER_DUP_ENTRY") {
            throw error;
          }
        }
      }

      if (!inserted) {
        const error = new Error(
          "Failed to generate unique certificate number"
        );
        error.statusCode = 500;
        throw error;
      }

      certificateId = inserted.id;
      existingCertificate = inserted;
      await connection.commit();
    }
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  // EDITED (Phase 3D): Render the JPEG after the DB transaction has committed.
  // A renderer/filesystem failure no longer rolls back course progress or the
  // certificate record itself.
  if (!existingCertificate) {
    return null;
  }

  const certificate =
    (certificateId
      ? await getCertificateRenderData(certificateId)
      : await getCertificateRenderData(existingCertificate.id)) ||
    existingCertificate;

  if (certificate.file_url) {
    return {
      ...certificate,
      certificate_url: certificate.file_url,
    };
  }

  try {
    const generated = await generateCertificateFile(certificate);

    await pool.execute(
      `
        UPDATE certificates
        SET file_url = ?
        WHERE id = ?
      `,
      [generated.fileUrl, certificate.id]
    );

    return {
      ...certificate,
      file_url: generated.fileUrl,
      certificate_url: generated.fileUrl,
    };
  } catch (error) {
    // Keep the certificate issued even when image rendering fails.
    console.error(
      "Certificate image generation failed:",
      error
    );

    return {
      ...certificate,
      certificate_url: certificate.file_url,
    };
  }
};

const getMyCertificates = async (studentId) => {
  const [rows] = await pool.execute(
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

  return rows.map((row) => ({
    ...row,
    certificate_url: row.file_url,
  }));
};

const getCertificateById = async (
  certificateId,
  userId,
  role
) => {
  const [rows] = await pool.execute(
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
    const error = new Error("Certificate not found");
    error.statusCode = 404;
    throw error;
  }

  const certificate = rows[0];

  if (
    role !== "ADMIN" &&
    Number(certificate.student_id) !== Number(userId)
  ) {
    const error = new Error(
      "You are not allowed to access this certificate"
    );
    error.statusCode = 403;
    throw error;
  }

  return {
    ...certificate,
    certificate_url: certificate.file_url,
  };
};

module.exports = {
  issueCertificateIfEligible,
  getMyCertificates,
  getCertificateById,
};
