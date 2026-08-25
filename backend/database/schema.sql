CREATE DATABASE IF NOT EXISTS edupond
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE edupond;

CREATE TABLE roles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    role_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_users_role
        FOREIGN KEY (role_id)
        REFERENCES roles(id),

    INDEX idx_users_role_id (role_id),
    INDEX idx_users_status (status)
) ENGINE=InnoDB;

CREATE TABLE categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_categories_status (status)
) ENGINE=InnoDB;

CREATE TABLE courses (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    instructor_id BIGINT UNSIGNED NOT NULL,
    category_id BIGINT UNSIGNED NOT NULL,

    title VARCHAR(200) NOT NULL,
    slug VARCHAR(220) NOT NULL UNIQUE,
    description TEXT,
    goal TEXT,

    difficulty ENUM(
        'BEGINNER',
        'INTERMEDIATE',
        'ADVANCED'
    ) NOT NULL DEFAULT 'BEGINNER',

    duration_minutes INT UNSIGNED,

    thumbnail_url VARCHAR(500),

    certificate_enabled BOOLEAN NOT NULL DEFAULT FALSE,

    status ENUM(
        'DRAFT',
        'PENDING_REVIEW',
        'PUBLISHED',
        'REJECTED',
        'ARCHIVED'
    ) NOT NULL DEFAULT 'DRAFT',

    published_at TIMESTAMP NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_courses_instructor
        FOREIGN KEY (instructor_id)
        REFERENCES users(id),

    CONSTRAINT fk_courses_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id),

    INDEX idx_courses_instructor_id (instructor_id),
    INDEX idx_courses_category_id (category_id),
    INDEX idx_courses_status (status),
    INDEX idx_courses_difficulty (difficulty)
) ENGINE=InnoDB;

CREATE TABLE course_sections (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    course_id BIGINT UNSIGNED NOT NULL,

    title VARCHAR(200) NOT NULL,
    description TEXT,
    sort_order INT UNSIGNED NOT NULL DEFAULT 1,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_course_sections_course
        FOREIGN KEY (course_id)
        REFERENCES courses(id)
        ON DELETE CASCADE,

    INDEX idx_course_sections_course_id (course_id),
    INDEX idx_course_sections_sort_order (course_id, sort_order)
) ENGINE=InnoDB;

CREATE TABLE lessons (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    section_id BIGINT UNSIGNED NOT NULL,

    title VARCHAR(200) NOT NULL,
    description TEXT,

    content_type ENUM(
        'VIDEO',
        'ARTICLE',
        'DOCUMENT',
        'LINK'
    ) NOT NULL DEFAULT 'VIDEO',

    content_url VARCHAR(500),
    resource_url VARCHAR(500),

    duration_minutes INT UNSIGNED,

    is_required BOOLEAN NOT NULL DEFAULT TRUE,

    sort_order INT UNSIGNED NOT NULL DEFAULT 1,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_lessons_section
        FOREIGN KEY (section_id)
        REFERENCES course_sections(id)
        ON DELETE CASCADE,

    INDEX idx_lessons_section_id (section_id),
    INDEX idx_lessons_sort_order (section_id, sort_order)
) ENGINE=InnoDB;

CREATE TABLE enrollments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    student_id BIGINT UNSIGNED NOT NULL,
    course_id BIGINT UNSIGNED NOT NULL,

    status ENUM(
        'ACTIVE',
        'COMPLETED',
        'CANCELLED'
    ) NOT NULL DEFAULT 'ACTIVE',

    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,

    CONSTRAINT fk_enrollments_student
        FOREIGN KEY (student_id)
        REFERENCES users(id),

    CONSTRAINT fk_enrollments_course
        FOREIGN KEY (course_id)
        REFERENCES courses(id),

    UNIQUE KEY uq_enrollment_student_course (
        student_id,
        course_id
    ),

    INDEX idx_enrollments_student_id (student_id),
    INDEX idx_enrollments_course_id (course_id),
    INDEX idx_enrollments_status (status)
) ENGINE=InnoDB;

CREATE TABLE lesson_progress (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    enrollment_id BIGINT UNSIGNED NOT NULL,
    lesson_id BIGINT UNSIGNED NOT NULL,

    status ENUM(
        'NOT_STARTED',
        'IN_PROGRESS',
        'COMPLETED'
    ) NOT NULL DEFAULT 'NOT_STARTED',

    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_lesson_progress_enrollment
        FOREIGN KEY (enrollment_id)
        REFERENCES enrollments(id),

    CONSTRAINT fk_lesson_progress_lesson
        FOREIGN KEY (lesson_id)
        REFERENCES lessons(id),

    UNIQUE KEY uq_progress_enrollment_lesson (
        enrollment_id,
        lesson_id
    ),

    INDEX idx_lesson_progress_enrollment_id (enrollment_id),
    INDEX idx_lesson_progress_lesson_id (lesson_id),
    INDEX idx_lesson_progress_status (status)
) ENGINE=InnoDB;

CREATE TABLE quizzes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    lesson_id BIGINT UNSIGNED NOT NULL,

    title VARCHAR(200) NOT NULL,
    description TEXT,

    passing_score DECIMAL(5,2) NOT NULL DEFAULT 70.00,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_quizzes_lesson
        FOREIGN KEY (lesson_id)
        REFERENCES lessons(id)
        ON DELETE CASCADE,

    UNIQUE KEY uq_quiz_lesson (lesson_id),

    INDEX idx_quizzes_lesson_id (lesson_id)
) ENGINE=InnoDB;

CREATE TABLE quiz_questions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    quiz_id BIGINT UNSIGNED NOT NULL,

    question_text TEXT NOT NULL,

    question_type ENUM(
        'SINGLE_CHOICE'
    ) NOT NULL DEFAULT 'SINGLE_CHOICE',

    points DECIMAL(5,2) NOT NULL DEFAULT 1.00,

    sort_order INT UNSIGNED NOT NULL DEFAULT 1,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_quiz_questions_quiz
        FOREIGN KEY (quiz_id)
        REFERENCES quizzes(id)
        ON DELETE CASCADE,

    INDEX idx_quiz_questions_quiz_id (quiz_id),
    INDEX idx_quiz_questions_sort_order (quiz_id, sort_order)
) ENGINE=InnoDB;

CREATE TABLE quiz_options (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    question_id BIGINT UNSIGNED NOT NULL,

    option_text VARCHAR(500) NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,

    sort_order INT UNSIGNED NOT NULL DEFAULT 1,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_quiz_options_question
        FOREIGN KEY (question_id)
        REFERENCES quiz_questions(id)
        ON DELETE CASCADE,

    INDEX idx_quiz_options_question_id (question_id),
    INDEX idx_quiz_options_sort_order (question_id, sort_order)
) ENGINE=InnoDB;

CREATE TABLE quiz_attempts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    quiz_id BIGINT UNSIGNED NOT NULL,
    enrollment_id BIGINT UNSIGNED NOT NULL,

    score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    passed BOOLEAN NOT NULL DEFAULT FALSE,

    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_quiz_attempts_quiz
        FOREIGN KEY (quiz_id)
        REFERENCES quizzes(id),

    CONSTRAINT fk_quiz_attempts_enrollment
        FOREIGN KEY (enrollment_id)
        REFERENCES enrollments(id),

    INDEX idx_quiz_attempts_quiz_id (quiz_id),
    INDEX idx_quiz_attempts_enrollment_id (enrollment_id),
    INDEX idx_quiz_attempts_passed (passed)
) ENGINE=InnoDB;

CREATE TABLE certificates (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    enrollment_id BIGINT UNSIGNED NOT NULL,

    certificate_no VARCHAR(100) NOT NULL UNIQUE,

    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    file_url VARCHAR(500),

    CONSTRAINT fk_certificates_enrollment
        FOREIGN KEY (enrollment_id)
        REFERENCES enrollments(id),

    UNIQUE KEY uq_certificate_enrollment (
        enrollment_id
    ),

    INDEX idx_certificates_certificate_no (certificate_no)
) ENGINE=InnoDB;

CREATE TABLE student_course_requests (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    student_id BIGINT UNSIGNED NOT NULL,
    category_id BIGINT UNSIGNED NOT NULL,

    course_name VARCHAR(200) NOT NULL,
    reason TEXT NOT NULL,

    status ENUM(
        'PENDING',
        'APPROVED',
        'REJECTED',
        'POSTED',
        'ARCHIVED'
    ) NOT NULL DEFAULT 'PENDING',

    admin_note TEXT,

    reviewed_by BIGINT UNSIGNED NULL,
    reviewed_at TIMESTAMP NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_student_requests_student
        FOREIGN KEY (student_id)
        REFERENCES users(id),

    CONSTRAINT fk_student_requests_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id),

    CONSTRAINT fk_student_requests_reviewer
        FOREIGN KEY (reviewed_by)
        REFERENCES users(id),

    INDEX idx_student_requests_student_id (student_id),
    INDEX idx_student_requests_category_id (category_id),
    INDEX idx_student_requests_status (status),
    INDEX idx_student_requests_reviewed_by (reviewed_by)
) ENGINE=InnoDB;

CREATE TABLE instructor_course_proposals (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    instructor_id BIGINT UNSIGNED NOT NULL,
    category_id BIGINT UNSIGNED NOT NULL,

    course_name VARCHAR(200) NOT NULL,
    description TEXT,
    goal TEXT,

    difficulty ENUM(
        'BEGINNER',
        'INTERMEDIATE',
        'ADVANCED'
    ) NOT NULL DEFAULT 'BEGINNER',

    duration_minutes INT UNSIGNED,

    certificate_enabled BOOLEAN NOT NULL DEFAULT FALSE,

    thumbnail_url VARCHAR(500),

    status ENUM(
        'DRAFT',
        'PENDING_REVIEW',
        'APPROVED',
        'REJECTED',
        'ARCHIVED'
    ) NOT NULL DEFAULT 'DRAFT',

    admin_note TEXT,

    reviewed_by BIGINT UNSIGNED NULL,
    reviewed_at TIMESTAMP NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_instructor_proposals_instructor
        FOREIGN KEY (instructor_id)
        REFERENCES users(id),

    CONSTRAINT fk_instructor_proposals_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id),

    CONSTRAINT fk_instructor_proposals_reviewer
        FOREIGN KEY (reviewed_by)
        REFERENCES users(id),

    INDEX idx_instructor_proposals_instructor_id (instructor_id),
    INDEX idx_instructor_proposals_category_id (category_id),
    INDEX idx_instructor_proposals_status (status),
    INDEX idx_instructor_proposals_reviewed_by (reviewed_by)
) ENGINE=InnoDB;

CREATE TABLE proposal_sections (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    proposal_id BIGINT UNSIGNED NOT NULL,

    title VARCHAR(200) NOT NULL,
    description TEXT,
    sort_order INT UNSIGNED NOT NULL DEFAULT 1,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_proposal_sections_proposal
        FOREIGN KEY (proposal_id)
        REFERENCES instructor_course_proposals(id)
        ON DELETE CASCADE,

    INDEX idx_proposal_sections_proposal_id (proposal_id),
    INDEX idx_proposal_sections_sort_order (
        proposal_id,
        sort_order
    )
) ENGINE=InnoDB;

CREATE TABLE proposal_lessons (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    proposal_section_id BIGINT UNSIGNED NOT NULL,

    title VARCHAR(200) NOT NULL,
    description TEXT,

    content_type ENUM(
        'VIDEO',
        'ARTICLE',
        'DOCUMENT',
        'LINK'
    ) NOT NULL DEFAULT 'VIDEO',

    content_url VARCHAR(500),
    resource_url VARCHAR(500),

    duration_minutes INT UNSIGNED,

    is_required BOOLEAN NOT NULL DEFAULT TRUE,

    sort_order INT UNSIGNED NOT NULL DEFAULT 1,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_proposal_lessons_section
        FOREIGN KEY (proposal_section_id)
        REFERENCES proposal_sections(id)
        ON DELETE CASCADE,

    INDEX idx_proposal_lessons_section_id (
        proposal_section_id
    ),

    INDEX idx_proposal_lessons_sort_order (
        proposal_section_id,
        sort_order
    )
) ENGINE=InnoDB;

CREATE TABLE focus_rooms (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    course_id BIGINT UNSIGNED NULL,
    category_id BIGINT UNSIGNED NULL,

    name VARCHAR(150) NOT NULL,

    status ENUM(
        'OPEN',
        'CLOSED'
    ) NOT NULL DEFAULT 'OPEN',

    max_participants INT UNSIGNED NOT NULL DEFAULT 12,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_focus_rooms_course
        FOREIGN KEY (course_id)
        REFERENCES courses(id),

    CONSTRAINT fk_focus_rooms_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id),

    INDEX idx_focus_rooms_course_id (course_id),
    INDEX idx_focus_rooms_category_id (category_id),
    INDEX idx_focus_rooms_status (status)
) ENGINE=InnoDB;

CREATE TABLE focus_room_participants (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    room_id BIGINT UNSIGNED NOT NULL,
    student_id BIGINT UNSIGNED NOT NULL,

    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP NULL,

    CONSTRAINT fk_focus_participants_room
        FOREIGN KEY (room_id)
        REFERENCES focus_rooms(id),

    CONSTRAINT fk_focus_participants_student
        FOREIGN KEY (student_id)
        REFERENCES users(id),

    INDEX idx_focus_participants_room_id (room_id),
    INDEX idx_focus_participants_student_id (student_id),
    INDEX idx_focus_participants_active (
        room_id,
        left_at
    )
) ENGINE=InnoDB;

CREATE TABLE activity_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    user_id BIGINT UNSIGNED NULL,

    action VARCHAR(100) NOT NULL,

    entity_type VARCHAR(100) NOT NULL,
    entity_id BIGINT UNSIGNED NULL,

    metadata_json JSON NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_activity_logs_user
        FOREIGN KEY (user_id)
        REFERENCES users(id),

    INDEX idx_activity_logs_user_id (user_id),
    INDEX idx_activity_logs_action (action),
    INDEX idx_activity_logs_entity (
        entity_type,
        entity_id
    ),
    INDEX idx_activity_logs_created_at (created_at)
) ENGINE=InnoDB;