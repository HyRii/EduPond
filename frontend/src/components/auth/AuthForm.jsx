import { useState } from "react";
import PondBackground from "../common/PondBackground";
import PondMark from "../common/PondMark";
import WaterLilyButton from "../common/WaterLilyButton";

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
      <PondBackground variant="deep" bubbleCount={18} />

      <div className="auth-card animate-float">
        <div className="flex items-center gap-3">
          <PondMark size={48} className="drop-shadow-sm" />
          <div>
            <p className="pond-eyebrow">EduPond</p>
            <p className="text-xs text-pond-400">a pond of knowledge</p>
          </div>
        </div>

        <div className="auth-header mt-5">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>

        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
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

          <WaterLilyButton
            type="submit"
            variant="bloom"
            fullWidth
            loading={loading}
            className="auth-button"
          >
            {loading ? "Please wait..." : submitText}
          </WaterLilyButton>
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
