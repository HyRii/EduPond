const pool = require("../config/database");
// EDITED (Phase 3D): Certificate issuance is triggered immediately after a passing quiz.
const { issueCertificateIfEligible } = require("./certificate.service");

const QUIZ_RETRY_COOLDOWN_MS = 60 * 60 * 1000;

const getLessonForInstructor = async (
  lessonId,
  instructorId
) => {
  const [rows] = await pool.execute(
    `
      SELECT
        l.id AS lesson_id,
        l.title AS lesson_title,
        cs.course_id,
        c.title AS course_title,
        c.instructor_id
      FROM lessons l
      INNER JOIN course_sections cs
        ON cs.id = l.section_id
      INNER JOIN courses c
        ON c.id = cs.course_id
      WHERE l.id = ?
      LIMIT 1
    `,
    [lessonId]
  );

  if (rows.length === 0) {
    const error = new Error("Lesson not found");
    error.statusCode = 404;
    throw error;
  }

  const lesson = rows[0];

  if (
    Number(lesson.instructor_id) !==
    Number(instructorId)
  ) {
    const error = new Error(
      "You can only manage quiz for your own lesson"
    );
    error.statusCode = 403;
    throw error;
  }

  return lesson;
};

const getQuizByIdRaw = async (quizId) => {
  const [rows] = await pool.execute(
    `
      SELECT
        q.id,
        q.lesson_id,
        q.title,
        q.description,
        q.passing_score,
        q.created_at,
        q.updated_at,
        l.title AS lesson_title,
        cs.course_id,
        c.title AS course_title,
        c.instructor_id
      FROM quizzes q
      INNER JOIN lessons l
        ON l.id = q.lesson_id
      INNER JOIN course_sections cs
        ON cs.id = l.section_id
      INNER JOIN courses c
        ON c.id = cs.course_id
      WHERE q.id = ?
      LIMIT 1
    `,
    [quizId]
  );

  if (rows.length === 0) {
    const error = new Error("Quiz not found");
    error.statusCode = 404;
    throw error;
  }

  return rows[0];
};

const getQuizQuestions = async (
  quizId,
  includeCorrectAnswer
) => {
  const [questionRows] = await pool.execute(
    `
      SELECT
        id,
        quiz_id,
        question_text,
        question_type,
        points,
        sort_order,
        created_at
      FROM quiz_questions
      WHERE quiz_id = ?
      ORDER BY sort_order ASC, id ASC
    `,
    [quizId]
  );

  const questions = [];

  for (const question of questionRows) {
    const [optionRows] = await pool.execute(
      `
        SELECT
          id,
          question_id,
          option_text,
          sort_order
          ${
            includeCorrectAnswer
              ? ", is_correct"
              : ""
          }
        FROM quiz_options
        WHERE question_id = ?
        ORDER BY sort_order ASC, id ASC
      `,
      [question.id]
    );

    questions.push({
      ...question,
      options: optionRows,
    });
  }

  return questions;
};

const createQuiz = async (
  lessonId,
  instructorId,
  {
    title,
    description,
    passingScore,
  }
) => {
  await getLessonForInstructor(
    lessonId,
    instructorId
  );

  const [existing] = await pool.execute(
    `
      SELECT id
      FROM quizzes
      WHERE lesson_id = ?
      LIMIT 1
    `,
    [lessonId]
  );

  if (existing.length > 0) {
    const error = new Error(
      "This lesson already has a quiz"
    );
    error.statusCode = 409;
    throw error;
  }

  const [result] = await pool.execute(
    `
      INSERT INTO quizzes (
        lesson_id,
        title,
        description,
        passing_score
      )
      VALUES (?, ?, ?, ?)
    `,
    [
      lessonId,
      title,
      description || null,
      passingScore ?? 70,
    ]
  );

  return getQuizById(
    result.insertId,
    instructorId,
    "INSTRUCTOR"
  );
};

const addQuestion = async (
  quizId,
  instructorId,
  {
    questionText,
    questionType,
    points,
    sortOrder,
    options,
  }
) => {
  const quiz =
    await getQuizByIdRaw(quizId);

  if (
    Number(quiz.instructor_id) !==
    Number(instructorId)
  ) {
    const error = new Error(
      "You can only manage your own quiz"
    );
    error.statusCode = 403;
    throw error;
  }

  const normalizedOptions =
    Array.isArray(options)
      ? options
      : [];

  if (normalizedOptions.length < 2) {
    const error = new Error(
      "A question must have at least 2 options"
    );
    error.statusCode = 400;
    throw error;
  }

  const correctOptions =
    normalizedOptions.filter(
      (option) =>
        option?.isCorrect === true
    );

  if (correctOptions.length !== 1) {
    const error = new Error(
      "A single-choice question must have exactly one correct option"
    );
    error.statusCode = 400;
    throw error;
  }

  const connection =
    await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [questionResult] =
      await connection.execute(
        `
          INSERT INTO quiz_questions (
            quiz_id,
            question_text,
            question_type,
            points,
            sort_order
          )
          VALUES (?, ?, ?, ?, ?)
        `,
        [
          quizId,
          questionText,
          questionType || "SINGLE_CHOICE",
          points ?? 1,
          sortOrder ?? 1,
        ]
      );

    const questionId =
      questionResult.insertId;

    for (
      let index = 0;
      index <
      normalizedOptions.length;
      index++
    ) {
      const option =
        normalizedOptions[index];

      await connection.execute(
        `
          INSERT INTO quiz_options (
            question_id,
            option_text,
            is_correct,
            sort_order
          )
          VALUES (?, ?, ?, ?)
        `,
        [
          questionId,
          option.optionText,
          option.isCorrect === true,
          option.sortOrder ??
            index + 1,
        ]
      );
    }

    await connection.commit();

    return {
      id: questionId,
      quiz_id: Number(quizId),
      question_text: questionText,
      question_type:
        questionType || "SINGLE_CHOICE",
      points: points ?? 1,
      sort_order: sortOrder ?? 1,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const addOption = async (
  questionId,
  instructorId,
  {
    optionText,
    isCorrect,
    sortOrder,
  }
) => {
  const [rows] = await pool.execute(
    `
      SELECT
        qq.id AS question_id,
        q.instructor_id
      FROM quiz_questions qq
      INNER JOIN quizzes qz
        ON qz.id = qq.quiz_id
      INNER JOIN lessons l
        ON l.id = qz.lesson_id
      INNER JOIN course_sections cs
        ON cs.id = l.section_id
      INNER JOIN courses q
        ON q.id = cs.course_id
      WHERE qq.id = ?
      LIMIT 1
    `,
    [questionId]
  );

  if (rows.length === 0) {
    const error = new Error(
      "Question not found"
    );
    error.statusCode = 404;
    throw error;
  }

  if (
    Number(rows[0].instructor_id) !==
    Number(instructorId)
  ) {
    const error = new Error(
      "You can only manage your own quiz"
    );
    error.statusCode = 403;
    throw error;
  }

  const [result] = await pool.execute(
    `
      INSERT INTO quiz_options (
        question_id,
        option_text,
        is_correct,
        sort_order
      )
      VALUES (?, ?, ?, ?)
    `,
    [
      questionId,
      optionText,
      Boolean(isCorrect),
      sortOrder ?? 1,
    ]
  );

  return {
    id: result.insertId,
    question_id: Number(questionId),
    option_text: optionText,
    is_correct: Boolean(isCorrect),
    sort_order: sortOrder ?? 1,
  };
};

const getQuizById = async (
  quizId,
  userId,
  userRole
) => {
  const quiz =
    await getQuizByIdRaw(quizId);

  if (
    userRole === "INSTRUCTOR" &&
    Number(quiz.instructor_id) !==
      Number(userId)
  ) {
    const error = new Error(
      "You can only view your own quiz"
    );
    error.statusCode = 403;
    throw error;
  }

  const includeCorrectAnswer =
    userRole === "INSTRUCTOR";

  const questions =
    await getQuizQuestions(
      quizId,
      includeCorrectAnswer
    );

  return {
    id: quiz.id,
    lesson_id: quiz.lesson_id,
    lesson_title: quiz.lesson_title,
    course_id: quiz.course_id,
    course_title: quiz.course_title,
    title: quiz.title,
    description: quiz.description,
    passing_score: Number(
      quiz.passing_score
    ),
    questions,
    created_at: quiz.created_at,
    updated_at: quiz.updated_at,
  };
};

const getQuizByLessonId = async (
  lessonId,
  userId,
  userRole
) => {
  const [rows] = await pool.execute(
    `
      SELECT q.id
      FROM quizzes q
      INNER JOIN lessons l
        ON l.id = q.lesson_id
      INNER JOIN course_sections cs
        ON cs.id = l.section_id
      INNER JOIN courses c
        ON c.id = cs.course_id
      WHERE q.lesson_id = ?
      LIMIT 1
    `,
    [lessonId]
  );

  if (rows.length === 0) {
    const error = new Error(
      "Quiz not found for this lesson"
    );
    error.statusCode = 404;
    throw error;
  }

  return getQuizById(
    rows[0].id,
    userId,
    userRole
  );
};

const getStudentEnrollmentForQuiz = async (
  quizId,
  enrollmentId,
  studentId
) => {
  const [rows] = await pool.execute(
    `
      SELECT
        e.id,
        e.student_id,
        e.course_id,
        e.status,
        q.id AS quiz_id,
        c.id AS quiz_course_id
      FROM enrollments e
      INNER JOIN quizzes q
        ON q.id = ?
      INNER JOIN lessons l
        ON l.id = q.lesson_id
      INNER JOIN course_sections cs
        ON cs.id = l.section_id
      INNER JOIN courses c
        ON c.id = cs.course_id
      WHERE e.id = ?
        AND e.student_id = ?
        AND e.course_id = c.id
      LIMIT 1
    `,
    [
      quizId,
      enrollmentId,
      studentId,
    ]
  );

  if (rows.length === 0) {
    const error = new Error(
      "Active enrollment for this quiz was not found"
    );
    error.statusCode = 403;
    throw error;
  }

  if (
    rows[0].status !== "ACTIVE" &&
    rows[0].status !== "COMPLETED"
  ) {
    const error = new Error(
      "Enrollment is not active"
    );
    error.statusCode = 403;
    throw error;
  }

  return rows[0];
};

const getRetryStatus = async (
  quizId,
  enrollmentId,
  studentId
) => {
  await getStudentEnrollmentForQuiz(
    quizId,
    enrollmentId,
    studentId
  );

  const [rows] = await pool.execute(
    `
      SELECT
        id,
        score,
        passed,
        attempted_at
      FROM quiz_attempts
      WHERE quiz_id = ?
        AND enrollment_id = ?
      ORDER BY attempted_at DESC, id DESC
      LIMIT 1
    `,
    [quizId, enrollmentId]
  );

  if (rows.length === 0) {
    return {
      can_attempt: true,
      cooldown_active: false,
      retry_available_at: null,
      last_attempt: null,
    };
  }

  const lastAttempt = rows[0];
  const lastAttemptTime = new Date(lastAttempt.attempted_at).getTime();
  const retryAvailableAt = new Date(
    lastAttemptTime + QUIZ_RETRY_COOLDOWN_MS
  );
  const cooldownActive =
    !Boolean(lastAttempt.passed) &&
    Date.now() < retryAvailableAt.getTime();

  return {
    can_attempt: !cooldownActive,
    cooldown_active: cooldownActive,
    retry_available_at: cooldownActive
      ? retryAvailableAt.toISOString()
      : null,
    last_attempt: {
      id: lastAttempt.id,
      score: Number(lastAttempt.score),
      passed: Boolean(lastAttempt.passed),
      attempted_at: lastAttempt.attempted_at,
    },
  };
};

const submitAttempt = async (
  quizId,
  enrollmentId,
  studentId,
  answers
) => {
  await getStudentEnrollmentForQuiz(
    quizId,
    enrollmentId,
    studentId
  );

  // EDITED (Phase 3D): A failed attempt starts a one-hour retry cooldown.
  const retryStatus = await getRetryStatus(
    quizId,
    enrollmentId,
    studentId
  );

  if (retryStatus.cooldown_active) {
    const error = new Error(
      "You did not pass the quiz. You can retry one hour after your last failed attempt."
    );
    error.statusCode = 429;
    error.retryAvailableAt = retryStatus.retry_available_at;
    throw error;
  }

  const [questions] = await pool.execute(
    `
      SELECT
        id,
        points
      FROM quiz_questions
      WHERE quiz_id = ?
      ORDER BY sort_order ASC, id ASC
    `,
    [quizId]
  );

  if (questions.length === 0) {
    const error = new Error(
      "Quiz has no questions"
    );
    error.statusCode = 400;
    throw error;
  }

  const [options] = await pool.execute(
    `
      SELECT
        qo.id,
        qo.question_id,
        qo.is_correct
      FROM quiz_options qo
      INNER JOIN quiz_questions qq
        ON qq.id = qo.question_id
      WHERE qq.quiz_id = ?
    `,
    [quizId]
  );

  const answerMap = new Map();

  if (Array.isArray(answers)) {
    for (const answer of answers) {
      answerMap.set(
        Number(answer.questionId),
        Number(answer.optionId)
      );
    }
  }

  const optionMap = new Map();

  for (const option of options) {
    optionMap.set(
      Number(option.id),
      {
        questionId:
          Number(option.question_id),
        isCorrect:
          Boolean(option.is_correct),
      }
    );
  }

  let totalPoints = 0;
  let earnedPoints = 0;

  for (const question of questions) {
    const questionId =
      Number(question.id);

    const points =
      Number(question.points) || 0;

    totalPoints += points;

    const selectedOptionId =
      answerMap.get(questionId);

    if (
      !selectedOptionId
    ) {
      continue;
    }

    const selectedOption =
      optionMap.get(
        selectedOptionId
      );

    if (
      selectedOption &&
      selectedOption.questionId ===
        questionId &&
      selectedOption.isCorrect
    ) {
      earnedPoints += points;
    }
  }

  const score =
    totalPoints > 0
      ? Number(
          (
            (earnedPoints /
              totalPoints) *
            100
          ).toFixed(2)
        )
      : 0;

  const quiz =
    await getQuizByIdRaw(quizId);

  const passingScore =
    Number(quiz.passing_score);

  const passed =
    score >= passingScore;

  const connection =
    await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [result] =
      await connection.execute(
        `
          INSERT INTO quiz_attempts (
            quiz_id,
            enrollment_id,
            score,
            passed
          )
          VALUES (?, ?, ?, ?)
        `,
        [
          quizId,
          enrollmentId,
          score,
          passed,
        ]
      );

    await connection.commit();

    let certificate = null;

    // EDITED (Phase 3D): Passing a quiz now triggers the same eligibility
    // check used by lesson completion. The certificate service runs after
    // this transaction has committed.
    if (passed) {
      certificate = await issueCertificateIfEligible(
        enrollmentId
      );
    }

    return {
      id: result.insertId,
      quiz_id: Number(quizId),
      enrollment_id:
        Number(enrollmentId),
      score,
      passed,
      passing_score:
        passingScore,
      total_points: totalPoints,
      earned_points: earnedPoints,
      certificate,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const getAttempts = async (
  quizId,
  userId,
  userRole
) => {
  const quiz =
    await getQuizByIdRaw(quizId);

  let query = `
    SELECT
      qa.id,
      qa.quiz_id,
      qa.enrollment_id,
      qa.score,
      qa.passed,
      qa.attempted_at,
      e.student_id,
      u.name AS student_name
    FROM quiz_attempts qa
    INNER JOIN enrollments e
      ON e.id = qa.enrollment_id
    INNER JOIN users u
      ON u.id = e.student_id
    WHERE qa.quiz_id = ?
  `;

  const params = [quizId];

  if (userRole === "STUDENT") {
    query += `
      AND e.student_id = ?
    `;

    params.push(userId);
  } else if (userRole === "INSTRUCTOR") {
    if (
      Number(quiz.instructor_id) !==
      Number(userId)
    ) {
      const error = new Error(
        "You can only view attempts for your own quiz"
      );
      error.statusCode = 403;
      throw error;
    }
  }

  query += `
    ORDER BY qa.attempted_at DESC, qa.id DESC
  `;

  const [rows] =
    await pool.execute(
      query,
      params
    );

  return rows.map((row) => ({
    ...row,
    score: Number(row.score),
    passed: Boolean(row.passed),
  }));
};

module.exports = {
  createQuiz,
  addQuestion,
  addOption,
  getQuizById,
  getQuizByLessonId,
  submitAttempt,
  getRetryStatus,
  getAttempts,
};