import { useEffect, useState } from "react";

const SectionForm = ({
  section,
  onSave,
  onCancel,
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

    setSortOrder(
      section?.sort_order || 1
    );

  }, [section]);

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