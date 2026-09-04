import { useState } from "react";

const AuthForm = ({
  title,
  subtitle,
  submitText,
  onSubmit,
  fields = [],
  footer,
}) => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(
        err.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {fields.map((field) => (
            <div
              className="form-group"
              key={field.name}
            >
              <label htmlFor={field.name}>
                {field.label}
              </label>

              <input
                id={field.name}
                name={field.name}
                type={field.type || "text"}
                placeholder={field.placeholder}
                value={formData[field.name] || ""}
                onChange={handleChange}
                required
              />
            </div>
          ))}

          <button
            className="auth-button"
            type="submit"
            disabled={loading}
          >
            {loading ? "Please wait..." : submitText}
          </button>
        </form>

        {footer && (
          <div className="auth-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthForm;