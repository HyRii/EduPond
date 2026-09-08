import { useEffect, useState } from "react";

const initialForm = {
  title: "",
  description: "",
  contentType: "VIDEO",
  contentUrl: "",
  resourceUrl: "",
  durationMinutes: "",
  isRequired: true,
  sortOrder: 1,
};

const LessonForm = ({
  lesson,
  onSave,
  onCancel,
  defaultSortOrder,
}) => {

  const [form, setForm] =
    useState(initialForm);

  useEffect(() => {

    if (!lesson) {
      setForm({
        ...initialForm,
        sortOrder:
          defaultSortOrder || 1,
      });

      return;
    }

    setForm({
      title:
        lesson.title || "",

      description:
        lesson.description || "",

      contentType:
        lesson.content_type ||
        "VIDEO",

      contentUrl:
        lesson.content_url || "",

      resourceUrl:
        lesson.resource_url || "",

      durationMinutes:
        lesson.duration_minutes ??
        "",

      isRequired:
        Boolean(
          lesson.is_required
        ),

      sortOrder:
        lesson.sort_order || 1,
    });

  }, [lesson, defaultSortOrder]);

  const updateField = (
    field,
    value
  ) => {

    setForm((current) => ({
      ...current,
      [field]: value,
    }));

  };

  const handleSubmit = (
    event
  ) => {

    event.preventDefault();

    onSave({
      title:
        form.title.trim(),

      description:
        form.description.trim(),

      contentType:
        form.contentType,

      contentUrl:
        form.contentUrl.trim(),

      resourceUrl:
        form.resourceUrl.trim(),

      durationMinutes:
        form.durationMinutes === ""
          ? null
          : Number(
              form.durationMinutes
            ),

      isRequired:
        form.isRequired,

      sortOrder:
        Number(form.sortOrder),
    });

  };

  return (
    <form
      className="builder-form"
      onSubmit={handleSubmit}
    >

      <div className="form-field">

        <label>
          Lesson title
        </label>

        <input
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

        <label>
          Description
        </label>

        <textarea
          rows="3"
          value={form.description}
          onChange={(event) =>
            updateField(
              "description",
              event.target.value
            )
          }
        />

      </div>

      <div className="form-field">

        <label>
          Content Type
        </label>

        <select
          value={
            form.contentType
          }
          onChange={(event) =>
            updateField(
              "contentType",
              event.target.value
            )
          }
        >

          <option value="VIDEO">
            Video
          </option>

          <option value="ARTICLE">
            Article
          </option>

          <option value="DOCUMENT">
            Document
          </option>

          <option value="LINK">
            Link
          </option>

        </select>

      </div>

      <div className="form-field">

        <label>
          Content URL
        </label>

        <input
          type="url"
          value={
            form.contentUrl
          }
          onChange={(event) =>
            updateField(
              "contentUrl",
              event.target.value
            )
          }
        />

      </div>

      <div className="form-field">

        <label>
          Resource URL
        </label>

        <input
          type="url"
          value={
            form.resourceUrl
          }
          onChange={(event) =>
            updateField(
              "resourceUrl",
              event.target.value
            )
          }
        />

      </div>

      <div className="form-field">

        <label>
          Duration (minutes)
        </label>

        <input
          type="number"
          min="0"
          value={
            form.durationMinutes
          }
          onChange={(event) =>
            updateField(
              "durationMinutes",
              event.target.value
            )
          }
        />

      </div>

      <div className="form-field">

        <label>
          Order
        </label>

        <input
          type="number"
          min="1"
          value={
            form.sortOrder
          }
          onChange={(event) =>
            updateField(
              "sortOrder",
              event.target.value
            )
          }
          required
        />

      </div>

      <label className="checkbox-field">

        <input
          type="checkbox"
          checked={
            form.isRequired
          }
          onChange={(event) =>
            updateField(
              "isRequired",
              event.target.checked
            )
          }
        />

        Required lesson

      </label>

      <div className="form-actions">

        <button type="submit">
          Save Lesson
        </button>

        <button
          type="button"
          onClick={onCancel}
        >
          Cancel
        </button>

      </div>

    </form>
  );
};

export default LessonForm;