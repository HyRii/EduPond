import { useEffect, useState } from "react";

import Badge from "../../components/common/Badge";
import EmptyState from "../../components/common/EmptyState";

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../services/category.service";

const CategoryManagement = () => {

  const [categories, setCategories] = useState([]);

  const [name, setName] = useState("");
  const [description, setDescription] =
    useState("");

  const [editingId, setEditingId] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const loadCategories = async () => {

    try {

      setLoading(true);
      setError("");

      const response =
        await getCategories();

      setCategories(
        response?.data?.categories || []
      );

    } catch (error) {

      setError(
        error.message ||
        "Failed to load categories."
      );

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const resetForm = () => {
    setName("");
    setDescription("");
    setEditingId(null);
  };

  const handleSubmit = async (event) => {

    event.preventDefault();

    try {

      setSaving(true);
      setError("");

      const payload = {
        name: name.trim(),
        description: description.trim(),
      };

      if (!payload.name) {
        throw new Error(
          "Category name is required."
        );
      }

      if (editingId) {

        await updateCategory(
          editingId,
          payload
        );

      } else {

        await createCategory(payload);

      }

      resetForm();

      await loadCategories();

    } catch (error) {

      setError(
        error.message ||
        "Failed to save category."
      );

    } finally {

      setSaving(false);

    }
  };

  const handleEdit = (category) => {

    setEditingId(category.id);

    setName(category.name || "");

    setDescription(
      category.description || ""
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (categoryId) => {

    const confirmed = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmed) {
      return;
    }

    try {

      setError("");

      await deleteCategory(
        categoryId
      );

      await loadCategories();

    } catch (error) {

      setError(
        error.message ||
        "Failed to delete category."
      );

    }
  };

  return (
    <section className="admin-page">

      <div className="admin-page-header">

        <div>
          <p className="page-eyebrow">
            ADMIN
          </p>

          <h1>Category Management</h1>

          <p className="page-description">
            Create and maintain course categories.
          </p>
        </div>

      </div>

      {error && (
        <div className="admin-error">
          {error}
        </div>
      )}

      <div className="admin-form-card">

        <h2>
          {editingId
            ? "Edit Category"
            : "Create Category"}
        </h2>

        <form
          className="admin-form"
          onSubmit={handleSubmit}
        >

          <div className="form-field">

            <label htmlFor="category-name">
              Name
            </label>

            <input
              id="category-name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="e.g. Web Development"
              required
            />

          </div>

          <div className="form-field">

            <label htmlFor="category-description">
              Description
            </label>

            <textarea
              id="category-description"
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              placeholder="Category description"
              rows={4}
            />

          </div>

          <div className="form-actions">

            <button
              type="submit"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Category"
                  : "Create Category"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}

          </div>

        </form>

      </div>

      <div className="admin-section">

        <div className="admin-section-header">

          <h2>
            Existing Categories
          </h2>

        </div>

        {loading ? (

          <div className="admin-loading">
            Loading categories...
          </div>

        ) : categories.length === 0 ? (

          <EmptyState
            title="No categories yet"
            message="Create your first course category."
          />

        ) : (

          <div className="admin-list">

            {categories.map((category) => (

              <article
                key={category.id}
                className="admin-list-item"
              >

                <div>

                  <div className="admin-list-title">

                    <h3>
                      {category.name}
                    </h3>

                    <Badge
                      variant={
                        category.status ===
                        "ACTIVE"
                          ? "success"
                          : "danger"
                      }
                    >
                      {category.status}
                    </Badge>

                  </div>

                  <p>
                    {category.description ||
                      "No description."}
                  </p>

                </div>

                <div className="form-actions">

                  <button
                    type="button"
                    onClick={() =>
                      handleEdit(category)
                    }
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(
                        category.id
                      )
                    }
                  >
                    Delete
                  </button>

                </div>

              </article>

            ))}

          </div>

        )}

      </div>

    </section>
  );
};

export default CategoryManagement;