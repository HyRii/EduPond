const pool = require("../config/database");

const COURSE_STATUSES = [
  "DRAFT",
  "PENDING_REVIEW",
  "PUBLISHED",
  "REJECTED",
  "ARCHIVED",
];

const PROPOSAL_STATUSES = [
  "DRAFT",
  "PENDING_REVIEW",
  "APPROVED",
  "REJECTED",
  "REVISION_REQUESTED",
  "ARCHIVED",
];

const REQUEST_STATUSES = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "POSTED",
  "ARCHIVED",
];

const ENROLLMENT_STATUSES = ["ACTIVE", "COMPLETED", "CANCELLED"];

// Turns [{status:'DRAFT', count: 3}, ...] into
// { DRAFT: 3, PENDING_REVIEW: 0, ..., total: 3 } so the frontend never has
// to guard against a missing key for a status with zero rows.
const toStatusMap = (rows, knownStatuses) => {
  const map = {};
  let total = 0;

  for (const status of knownStatuses) {
    map[status] = 0;
  }

  for (const row of rows) {
    const count = Number(row.count) || 0;
    map[row.status] = count;
    total += count;
  }

  map.total = total;
  return map;
};

const getAggregatedDemand = async (limit) => {
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
     ORDER BY request_count DESC, r.course_name ASC
     LIMIT ${Number(limit) || 5}`
  );
  return rows;
};

const getAdminMetrics = async () => {
  const [[userRow]] = await pool.execute(
    `SELECT
       SUM(CASE WHEN r.name = 'STUDENT' THEN 1 ELSE 0 END) AS students,
       SUM(CASE WHEN r.name = 'INSTRUCTOR' THEN 1 ELSE 0 END) AS instructors,
       SUM(CASE WHEN r.name = 'ADMIN' THEN 1 ELSE 0 END) AS admins,
       SUM(CASE WHEN u.status = 'INACTIVE' THEN 1 ELSE 0 END) AS inactive
     FROM users u
     INNER JOIN roles r ON r.id = u.role_id`
  );

  const [courseRows] = await pool.execute(
    `SELECT status, COUNT(*) AS count FROM courses GROUP BY status`
  );

  const [[requestRow]] = await pool.execute(
    `SELECT COUNT(*) AS count FROM student_course_requests WHERE status = 'PENDING'`
  );

  const [[proposalRow]] = await pool.execute(
    `SELECT COUNT(*) AS count FROM instructor_course_proposals WHERE status = 'PENDING_REVIEW'`
  );

  const [[enrollmentRow]] = await pool.execute(
    `SELECT COUNT(*) AS count FROM enrollments`
  );

  const [[certificateRow]] = await pool.execute(
    `SELECT COUNT(*) AS count FROM certificates`
  );

  const topDemand = await getAggregatedDemand(5);

  return {
    users: {
      students: Number(userRow?.students) || 0,
      instructors: Number(userRow?.instructors) || 0,
      admins: Number(userRow?.admins) || 0,
      inactive: Number(userRow?.inactive) || 0,
    },
    courses: toStatusMap(courseRows, COURSE_STATUSES),
    pendingCourseRequests: Number(requestRow?.count) || 0,
    pendingProposals: Number(proposalRow?.count) || 0,
    totalEnrollments: Number(enrollmentRow?.count) || 0,
    totalCertificatesIssued: Number(certificateRow?.count) || 0,
    topDemand,
  };
};

const getInstructorMetrics = async (instructorId) => {
  const [courseRows] = await pool.execute(
    `SELECT status, COUNT(*) AS count
     FROM courses
     WHERE instructor_id = ?
     GROUP BY status`,
    [instructorId]
  );

  const [[enrollmentRow]] = await pool.execute(
    `SELECT COUNT(*) AS count
     FROM enrollments e
     INNER JOIN courses c ON c.id = e.course_id
     WHERE c.instructor_id = ?`,
    [instructorId]
  );

  const [proposalRows] = await pool.execute(
    `SELECT status, COUNT(*) AS count
     FROM instructor_course_proposals
     WHERE instructor_id = ?
     GROUP BY status`,
    [instructorId]
  );

  const [[demandRow]] = await pool.execute(
    `SELECT COUNT(*) AS count
     FROM student_course_requests
     WHERE status = 'APPROVED'`
  );

  const [recentEnrollments] = await pool.execute(
    `SELECT
       e.id AS enrollment_id,
       e.status,
       e.enrolled_at,
       u.name AS student_name,
       c.id AS course_id,
       c.title AS course_title
     FROM enrollments e
     INNER JOIN courses c ON c.id = e.course_id
     INNER JOIN users u ON u.id = e.student_id
     WHERE c.instructor_id = ?
     ORDER BY e.enrolled_at DESC
     LIMIT 5`,
    [instructorId]
  );

  return {
    courses: toStatusMap(courseRows, COURSE_STATUSES),
    totalEnrollments: Number(enrollmentRow?.count) || 0,
    proposals: toStatusMap(proposalRows, PROPOSAL_STATUSES),
    availableDemand: Number(demandRow?.count) || 0,
    recentEnrollments,
  };
};

const getStudentMetrics = async (studentId) => {
  const [enrollmentRows] = await pool.execute(
    `SELECT status, COUNT(*) AS count
     FROM enrollments
     WHERE student_id = ?
     GROUP BY status`,
    [studentId]
  );

  // Weighted progress across every non-cancelled enrollment: how many
  // required lessons the student has completed out of all required lessons
  // in the courses they're enrolled in. Mirrors the per-enrollment formula
  // in enrollment.service.js, just aggregated for the whole student.
  const [[progressRow]] = await pool.execute(
    `SELECT
       COALESCE(SUM(req.total_required), 0) AS total_required,
       COALESCE(SUM(comp.completed_required), 0) AS completed_required
     FROM enrollments e
     LEFT JOIN (
       SELECT cs.course_id, COUNT(*) AS total_required
       FROM lessons l
       INNER JOIN course_sections cs ON cs.id = l.section_id
       WHERE l.is_required = TRUE
       GROUP BY cs.course_id
     ) req ON req.course_id = e.course_id
     LEFT JOIN (
       SELECT lp.enrollment_id, COUNT(*) AS completed_required
       FROM lesson_progress lp
       INNER JOIN lessons l ON l.id = lp.lesson_id
       INNER JOIN course_sections cs ON cs.id = l.section_id
       WHERE lp.status = 'COMPLETED' AND l.is_required = TRUE
       GROUP BY lp.enrollment_id
     ) comp ON comp.enrollment_id = e.id
     WHERE e.student_id = ? AND e.status != 'CANCELLED'`,
    [studentId]
  );

  const totalRequired = Number(progressRow?.total_required) || 0;
  const completedRequired = Number(progressRow?.completed_required) || 0;
  const averageProgress =
    totalRequired === 0
      ? 0
      : Math.round((completedRequired / totalRequired) * 100);

  const [[certificateRow]] = await pool.execute(
    `SELECT COUNT(*) AS count
     FROM certificates cert
     INNER JOIN enrollments e ON e.id = cert.enrollment_id
     WHERE e.student_id = ?`,
    [studentId]
  );

  const [requestRows] = await pool.execute(
    `SELECT status, COUNT(*) AS count
     FROM student_course_requests
     WHERE student_id = ?
     GROUP BY status`,
    [studentId]
  );

  const [continueLearning] = await pool.execute(
    `SELECT
       e.id AS enrollment_id,
       c.title,
       c.thumbnail_url,
       c.difficulty
     FROM enrollments e
     INNER JOIN courses c ON c.id = e.course_id
     WHERE e.student_id = ? AND e.status = 'ACTIVE'
     ORDER BY e.enrolled_at DESC
     LIMIT 3`,
    [studentId]
  );

  return {
    enrollments: toStatusMap(enrollmentRows, ENROLLMENT_STATUSES),
    averageProgress,
    certificatesCount: Number(certificateRow?.count) || 0,
    requests: toStatusMap(requestRows, REQUEST_STATUSES),
    continueLearning,
  };
};

module.exports = {
  getAdminMetrics,
  getInstructorMetrics,
  getStudentMetrics,
};
