// NEW FILE (Phase 4): Instructor proposal and admin curation business logic.
const pool = require("../config/database");

const getProposalById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT
       p.id, p.instructor_id, u.name AS instructor_name,
       p.requested_course_request_id, p.course_id,
       p.category_id, c.name AS category_name,
       p.course_name, p.description, p.goal, p.difficulty,
       p.duration_minutes, p.certificate_enabled, p.thumbnail_url,
       p.status, p.admin_note, p.reviewed_by, p.reviewed_at,
       p.created_at, p.updated_at
     FROM instructor_course_proposals p
     INNER JOIN users u ON u.id = p.instructor_id
     INNER JOIN categories c ON c.id = p.category_id
     WHERE p.id = ? LIMIT 1`,
    [id]
  );
  if (!rows.length) {
    const error = new Error("Course proposal not found");
    error.statusCode = 404;
    throw error;
  }
  return rows[0];
};

const assertCategory = async (categoryId) => {
  const [rows] = await pool.execute(
    `SELECT id FROM categories WHERE id = ? AND status = 'ACTIVE' LIMIT 1`,
    [categoryId]
  );
  if (!rows.length) {
    const error = new Error("Category not found or inactive");
    error.statusCode = 400;
    throw error;
  }
};

const assertInstructorOwnsEditableProposal = async (id, instructorId) => {
  const proposal = await getProposalById(id);
  if (Number(proposal.instructor_id) !== Number(instructorId)) {
    const error = new Error("You can only edit your own proposal");
    error.statusCode = 403;
    throw error;
  }
  if (!["DRAFT", "REJECTED", "REVISION_REQUESTED"].includes(proposal.status)) {
    const error = new Error("This proposal cannot be edited in its current state");
    error.statusCode = 409;
    throw error;
  }
  return proposal;
};

const createProposal = async (instructorId, data) => {
  await assertCategory(data.categoryId);
  if (!data.courseName?.trim()) {
    const error = new Error("Course name is required");
    error.statusCode = 400;
    throw error;
  }

  if (data.requestedCourseRequestId) {
    const [requests] = await pool.execute(
      `SELECT id FROM student_course_requests
       WHERE id = ? AND status = 'APPROVED' LIMIT 1`,
      [data.requestedCourseRequestId]
    );
    if (!requests.length) {
      const error = new Error("Referenced course request must be approved");
      error.statusCode = 400;
      throw error;
    }
  }

  const [result] = await pool.execute(
    `INSERT INTO instructor_course_proposals
      (instructor_id, requested_course_request_id, category_id, course_name,
       description, goal, difficulty, duration_minutes, certificate_enabled,
       thumbnail_url, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'DRAFT')`,
    [
      instructorId,
      data.requestedCourseRequestId || null,
      data.categoryId,
      data.courseName.trim(),
      data.description?.trim() || null,
      data.goal?.trim() || null,
      data.difficulty || "BEGINNER",
      data.durationMinutes ?? null,
      data.certificateEnabled ?? false,
      data.thumbnailUrl?.trim() || null,
    ]
  );
  return getProposalById(result.insertId);
};

const updateProposal = async (id, instructorId, data) => {
  const proposal = await assertInstructorOwnsEditableProposal(id, instructorId);
  if (data.categoryId !== undefined) await assertCategory(data.categoryId);

  await pool.execute(
    `UPDATE instructor_course_proposals
     SET category_id = ?, course_name = ?, description = ?, goal = ?,
         difficulty = ?, duration_minutes = ?, certificate_enabled = ?,
         thumbnail_url = ?, requested_course_request_id = ?
     WHERE id = ?`,
    [
      data.categoryId ?? proposal.category_id,
      data.courseName?.trim() ?? proposal.course_name,
      data.description !== undefined ? data.description?.trim() || null : proposal.description,
      data.goal !== undefined ? data.goal?.trim() || null : proposal.goal,
      data.difficulty ?? proposal.difficulty,
      data.durationMinutes !== undefined ? data.durationMinutes : proposal.duration_minutes,
      data.certificateEnabled !== undefined ? data.certificateEnabled : proposal.certificate_enabled,
      data.thumbnailUrl !== undefined ? data.thumbnailUrl?.trim() || null : proposal.thumbnail_url,
      data.requestedCourseRequestId !== undefined
        ? data.requestedCourseRequestId || null
        : proposal.requested_course_request_id,
      id,
    ]
  );
  return getProposalById(id);
};

const addProposalSection = async (proposalId, instructorId, data) => {
  const proposal = await assertInstructorOwnsEditableProposal(proposalId, instructorId);
  if (!data.title?.trim()) {
    const error = new Error("Section title is required");
    error.statusCode = 400;
    throw error;
  }
  const [result] = await pool.execute(
    `INSERT INTO proposal_sections (proposal_id, title, description, sort_order)
     VALUES (?, ?, ?, ?)`,
    [proposal.id, data.title.trim(), data.description?.trim() || null, data.sortOrder || 1]
  );
  return getProposalSectionById(result.insertId);
};

const getProposalSectionById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT ps.*, p.instructor_id, p.status AS proposal_status
     FROM proposal_sections ps
     INNER JOIN instructor_course_proposals p ON p.id = ps.proposal_id
     WHERE ps.id = ? LIMIT 1`,
    [id]
  );
  if (!rows.length) {
    const error = new Error("Proposal section not found");
    error.statusCode = 404;
    throw error;
  }
  return rows[0];
};

const addProposalLesson = async (proposalId, sectionId, instructorId, data) => {
  const proposal = await assertInstructorOwnsEditableProposal(proposalId, instructorId);
  const section = await getProposalSectionById(sectionId);
  if (Number(section.proposal_id) !== Number(proposal.id)) {
    const error = new Error("Section does not belong to this proposal");
    error.statusCode = 400;
    throw error;
  }
  if (!data.title?.trim()) {
    const error = new Error("Lesson title is required");
    error.statusCode = 400;
    throw error;
  }

  const [result] = await pool.execute(
    `INSERT INTO proposal_lessons
      (proposal_section_id, title, description, content_type, content_url,
       resource_url, duration_minutes, is_required, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      sectionId,
      data.title.trim(),
      data.description?.trim() || null,
      data.contentType || "VIDEO",
      data.contentUrl?.trim() || null,
      data.resourceUrl?.trim() || null,
      data.durationMinutes ?? null,
      data.isRequired ?? true,
      data.sortOrder || 1,
    ]
  );
  return getProposalLessonById(result.insertId);
};

const getProposalLessonById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT pl.*, ps.proposal_id, p.instructor_id
     FROM proposal_lessons pl
     INNER JOIN proposal_sections ps ON ps.id = pl.proposal_section_id
     INNER JOIN instructor_course_proposals p ON p.id = ps.proposal_id
     WHERE pl.id = ? LIMIT 1`,
    [id]
  );
  if (!rows.length) {
    const error = new Error("Proposal lesson not found");
    error.statusCode = 404;
    throw error;
  }
  return rows[0];
};

const submitProposal = async (id, instructorId) => {
  const proposal = await assertInstructorOwnsEditableProposal(id, instructorId);
  const [sections] = await pool.execute(
    `SELECT COUNT(*) AS count FROM proposal_sections WHERE proposal_id = ?`,
    [id]
  );
  const [lessons] = await pool.execute(
    `SELECT COUNT(*) AS count
     FROM proposal_lessons pl
     INNER JOIN proposal_sections ps ON ps.id = pl.proposal_section_id
     WHERE ps.proposal_id = ?`,
    [id]
  );
  if (!Number(sections[0].count) || !Number(lessons[0].count)) {
    const error = new Error("Proposal must contain at least one section and one lesson");
    error.statusCode = 400;
    throw error;
  }

  await pool.execute(
    `UPDATE instructor_course_proposals
     SET status = 'PENDING_REVIEW', reviewed_by = NULL, reviewed_at = NULL
     WHERE id = ?`,
    [proposal.id]
  );
  return getProposalById(id);
};

const getMyProposals = async (instructorId) => {
  const [rows] = await pool.execute(
    `SELECT p.*, c.name AS category_name
     FROM instructor_course_proposals p
     INNER JOIN categories c ON c.id = p.category_id
     WHERE p.instructor_id = ?
     ORDER BY p.created_at DESC`,
    [instructorId]
  );
  return rows;
};

const listProposals = async (status) => {
  let query = `
    SELECT p.*, u.name AS instructor_name, c.name AS category_name,
           r.course_name AS requested_course_name
    FROM instructor_course_proposals p
    INNER JOIN users u ON u.id = p.instructor_id
    INNER JOIN categories c ON c.id = p.category_id
    LEFT JOIN student_course_requests r ON r.id = p.requested_course_request_id
  `;
  const params = [];
  if (status) {
    query += " WHERE p.status = ?";
    params.push(status);
  }
  query += " ORDER BY p.created_at DESC";
  const [rows] = await pool.execute(query, params);
  return rows;
};

const getProposalDetail = async (id) => {
  const proposal = await getProposalById(id);
  const [sections] = await pool.execute(
    `SELECT id, proposal_id, title, description, sort_order
     FROM proposal_sections WHERE proposal_id = ?
     ORDER BY sort_order, id`,
    [id]
  );
  for (const section of sections) {
    const [lessons] = await pool.execute(
      `SELECT id, proposal_section_id, title, description, content_type,
              content_url, resource_url, duration_minutes, is_required, sort_order
       FROM proposal_lessons WHERE proposal_section_id = ?
       ORDER BY sort_order, id`,
      [section.id]
    );
    section.lessons = lessons;
  }
  proposal.sections = sections;
  return proposal;
};

const reviewProposal = async (id, adminId, status, adminNote) => {
  const proposal = await getProposalById(id);
  if (!["APPROVED", "REJECTED", "REVISION_REQUESTED"].includes(status)) {
    const error = new Error("Invalid proposal review status");
    error.statusCode = 400;
    throw error;
  }
  if (proposal.status !== "PENDING_REVIEW") {
    const error = new Error("Only proposals pending review can be reviewed");
    error.statusCode = 409;
    throw error;
  }

  await pool.execute(
    `UPDATE instructor_course_proposals
     SET status = ?, admin_note = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [status, adminNote?.trim() || null, adminId, id]
  );
  return getProposalById(id);
};

const convertApprovedProposalToCourse = async (id, adminId) => {
  const proposal = await getProposalById(id);
  if (proposal.status !== "APPROVED") {
    const error = new Error("Only approved proposals can be converted");
    error.statusCode = 409;
    throw error;
  }
  if (proposal.course_id) {
    return getProposalDetail(id);
  }

  const detail = await getProposalDetail(id);
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    let slug = proposal.course_name.trim().toLowerCase()
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 210);
    if (!slug) slug = `course-${proposal.id}`;

    const [slugRows] = await connection.execute(
      `SELECT id FROM courses WHERE slug = ? LIMIT 1`,
      [slug]
    );
    if (slugRows.length) slug = `${slug}-${proposal.id}`;

    const [courseResult] = await connection.execute(
      `INSERT INTO courses
       (instructor_id, category_id, title, slug, description, goal,
        difficulty, duration_minutes, thumbnail_url, certificate_enabled,
        status, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PUBLISHED', CURRENT_TIMESTAMP)`,
      [
        proposal.instructor_id,
        proposal.category_id,
        proposal.course_name,
        slug,
        proposal.description,
        proposal.goal,
        proposal.difficulty,
        proposal.duration_minutes,
        proposal.thumbnail_url,
        proposal.certificate_enabled,
      ]
    );

    const courseId = courseResult.insertId;

    for (const section of detail.sections) {
      const [sectionResult] = await connection.execute(
        `INSERT INTO course_sections (course_id, title, description, sort_order)
         VALUES (?, ?, ?, ?)`,
        [courseId, section.title, section.description, section.sort_order]
      );

      for (const lesson of section.lessons) {
        await connection.execute(
          `INSERT INTO lessons
           (section_id, title, description, content_type, content_url,
            resource_url, duration_minutes, is_required, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            sectionResult.insertId,
            lesson.title,
            lesson.description,
            lesson.content_type,
            lesson.content_url,
            lesson.resource_url,
            lesson.duration_minutes,
            lesson.is_required,
            lesson.sort_order,
          ]
        );
      }
    }

    await connection.execute(
      `UPDATE instructor_course_proposals
       SET course_id = ?, status = 'APPROVED', reviewed_by = ?,
           reviewed_at = COALESCE(reviewed_at, CURRENT_TIMESTAMP)
       WHERE id = ?`,
      [courseId, adminId, id]
    );

    await connection.commit();
    return getProposalDetail(id);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const getMyProposalDetail = async (id, instructorId) => {
  const proposal = await getProposalById(id);
  if (Number(proposal.instructor_id) !== Number(instructorId)) {
    const error = new Error("You can only view your own proposal");
    error.statusCode = 403;
    throw error;
  }
  return getProposalDetail(id);
};

module.exports = {
  createProposal,
  updateProposal,
  addProposalSection,
  addProposalLesson,
  submitProposal,
  getMyProposals,
  listProposals,
  getProposalDetail,
  getMyProposalDetail,
  reviewProposal,
  convertApprovedProposalToCourse,
};
