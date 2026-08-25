USE edupond;

-- =========================
-- Roles
-- =========================

INSERT INTO roles (name)
VALUES
    ('ADMIN'),
    ('INSTRUCTOR'),
    ('STUDENT');


-- =========================
-- Categories
-- =========================

INSERT INTO categories (name, description)
VALUES
    (
        'Web Development',
        'Courses about building modern websites and web applications.'
    ),
    (
        'Programming',
        'Programming fundamentals, languages, and software development.'
    ),
    (
        'Database',
        'Database design, SQL, and data management.'
    ),
    (
        'DevOps',
        'Development operations, deployment, and infrastructure.'
    );