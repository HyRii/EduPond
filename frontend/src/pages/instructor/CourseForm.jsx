import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getCategories,
} from "../../services/category.service";

import {
  getCourseById,
  createCourse,
  updateCourse,
} from "../../services/course.service";

const initialForm = {
  categoryId: "",
  title: "",
  slug: "",
  description: "",
  goal: "",
  difficulty: "BEGINNER",
  durationMinutes: "",
  thumbnailUrl: "",
  certificateEnabled: false,
};

const CourseForm = () => {

  const { id } = useParams();

  const navigate = useNavigate();

  const editing = Boolean(id);

  const [form, setForm] =
    useState(initialForm);

  const [categories, setCategories] =
    useState([]);

  const [loading, setLoading] =
    useState(editing);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {

    const loadForm = async () => {

      try {

        setLoading(true);

        const categoryResponse =
          await getCategories();

        setCategories(
          categoryResponse?.data?.categories || []
        );

        if (editing) {

          const courseResponse =
            await getCourseById(id);

          const course =
            courseResponse?.data?.course;

          if (!course) {
            throw new Error(
              "Course not found."
            );
          }

          setForm({
            categoryId:
              course.category_id ?? "",
            title:
              course.title ?? "",
            slug:
              course.slug ?? "",
            description:
              course.description ?? "",
            goal:
              course.goal ?? "",
            difficulty:
              course.difficulty ??
              "BEGINNER",
            durationMinutes:
              course.duration_minutes ?? "",
            thumbnailUrl:
              course.thumbnail_url ?? "",
            certificateEnabled:
              Boolean(
                course.certificate_enabled
              ),
          });
        }

      } catch (error) {

        setError(
          error.message ||
          "Failed to load course."
        );

      } finally {

        setLoading(false);

      }

    };

    loadForm();

  }, [editing, id]);

  const updateField = (
    field,
    value
  ) => {

    setForm((current) => ({
      ...current,
      [field]: value,
    }));

  };

  const handleSubmit = async (
    event
  ) => {

    event.preventDefault();

    try {

      setSaving(true);
      setError("");

      const payload = {
        categoryId:
          Number(form.categoryId),

        title:
          form.title.trim(),

        slug:
          form.slug.trim().toLowerCase(),

        description:
          form.description.trim(),

        goal:
          form.goal.trim(),

        difficulty:
          form.difficulty,

        durationMinutes:
          form.durationMinutes === ""
            ? null
            : Number(
                form.durationMinutes
              ),

        thumbnailUrl:
          form.thumbnailUrl.trim(),

        certificateEnabled:
          form.certificateEnabled,
      };

      let response;

      if (editing) {

        response =
          await updateCourse(
            id,
            payload
          );

      } else {

        response =
          await createCourse(
            payload
          );

      }

      const course =
        response?.data?.course;

      const courseId =
        course?.id || id;

      navigate(
        `/instructor/courses/${courseId}/edit`
      );

    } catch (error) {

      setError(
        error.message ||
        "Failed to save course."
      );

    } finally {

      setSaving(false);

    }

  };

  if (loading) {

    return (
      <div className="instructor-loading">
        Loading course...
      </div>
    );

  }

  return (
    <section className="instructor-page">

      <div className="instructor-page-header">

        <div>

          <p className="page-eyebrow">
            INSTRUCTOR
          </p>

          <h1>
            {editing
              ? "Edit Course"
              : "Create Course"}
          </h1>

          <p className="page-description">
            Define your course before building its lessons.
          </p>

        </div>

      </div>

      {error && (
        <div className="instructor-error">
          {error}
        </div>
      )}

      <form
        className="instructor-form"
        onSubmit={handleSubmit}
      >

        <div className="form-field">

          <label htmlFor="course-title">
            Title
          </label>

          <input
            id="course-title"
            type="text"
            value={form.title}
            onChange={(event) =>
              updateField(
                "title",
                event.target.value
              )
            }
            required
          />

        </div>

        <div className="form-field">

          <label htmlFor="course-slug">
            Slug
          </label>

          <input
            id="course-slug"
            type="text"
            value={form.slug}
            onChange={(event) =>
              updateField(
                "slug",
                event.target.value
              )
            }
            placeholder="example-course"
            required
          />

        </div>

        <div className="form-field">

          <label htmlFor="course-category">
            Category
          </label>

          <select
            id="course-category"
            value={form.categoryId}
            onChange={(event) =>
              updateField(
                "categoryId",
                event.target.value
              )
            }
            required
          >

            <option value="">
              Select category
            </option>

            {categories.map(
              (category) => (

                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>

              )
            )}

          </select>

        </div>

        <div className="form-field">

          <label htmlFor="course-difficulty">
            Difficulty
          </label>

          <select
            id="course-difficulty"
            value={form.difficulty}
            onChange={(event) =>
              updateField(
                "difficulty",
                event.target.value
              )
            }
          >

            <option value="BEGINNER">
              Beginner
            </option>

            <option value="INTERMEDIATE">
              Intermediate
            </option>

            <option value="ADVANCED">
              Advanced
            </option>

          </select>

        </div>

        <div className="form-field">

          <label htmlFor="course-duration">
            Estimated Duration (minutes)
          </label>

          <input
            id="course-duration"
            type="number"
            min="0"
            value={form.durationMinutes}
            onChange={(event) =>
              updateField(
                "durationMinutes",
                event.target.value
              )
            }
          />

        </div>

        <div className="form-field">

          <label htmlFor="course-thumbnail">
            Thumbnail URL
          </label>

          <input
            id="course-thumbnail"
            type="url"
            value={form.thumbnailUrl}
            onChange={(event) =>
              updateField(
                "thumbnailUrl",
                event.target.value
              )
            }
          />

        </div>

        <div className="form-field full-width">

          <label htmlFor="course-goal">
            Goal
          </label>

          <textarea
            id="course-goal"
            rows="4"
            value={form.goal}
            onChange={(event) =>
              updateField(
                "goal",
                event.target.value
              )
            }
          />

        </div>

        <div className="form-field full-width">

          <label htmlFor="course-description">
            Description
          </label>

          <textarea
            id="course-description"
            rows="6"
            value={form.description}
            onChange={(event) =>
              updateField(
                "description",
                event.target.value
              )
            }
          />

        </div>

        <label className="checkbox-field full-width">

          <input
            type="checkbox"
            checked={
              form.certificateEnabled
            }
            onChange={(event) =>
              updateField(
                "certificateEnabled",
                event.target.checked
              )
            }
          />

          Certificate enabled

        </label>

        <div className="form-actions full-width">

          <button
            type="submit"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : "Save Course"}
          </button>

          {editing && (
            <button
              type="button"
              onClick={() =>
                navigate(
                  `/instructor/courses/${id}/builder`
                )
              }
            >
              Open Course Builder
            </button>
          )}

        </div>

      </form>

    </section>
  );
};

export default CourseForm;