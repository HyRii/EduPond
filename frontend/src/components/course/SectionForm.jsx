import { useEffect, useState } from "react";

const SectionForm = ({
  section,
  onSave,
  onCancel,
  // EDITED (Phase 3A): new optional prop, same reasoning as
  // LessonForm's defaultSortOrder -- avoids every new section
  // defaulting to order "1".
  defaultSortOrder,
}) => {

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [sortOrder, setSortOrder] =
    useState(1);

  useEffect(() => {

    setTitle(
      section?.title || ""
    );

    setDescription(
      section?.description || ""
    );

    // EDITED (Phase 3A): when editing an existing section, keep using
    // its own sort_order. When adding a new one (section is
    // null/undefined), propose defaultSortOrder instead of always "1".
    setSortOrder(
      section?.sort_order ||
        defaultSortOrder ||
        1
    );

  }, [section, defaultSortOrder]);

  const handleSubmit = (
    event
  ) => {

    event.preventDefault();

    onSave({
      title: title.trim(),
      description:
        description.trim(),
      sortOrder:
        Number(sortOrder),
    });

  };

  return (
    <form
      className="builder-form"
      onSubmit={handleSubmit}
    >

      <div className="form-field">

        <label>
          Section title
        </label>

        <input
          type="text"
          value={title}
          onChange={(event) =>
            setTitle(
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

        <input
          type="text"
          value={description}
          onChange={(event) =>
            setDescription(
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
          value={sortOrder}
          onChange={(event) =>
            setSortOrder(
              event.target.value
            )
          }
          required
        />

      </div>

      <div className="form-actions">

        <button type="submit">
          Save
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

export default SectionForm;