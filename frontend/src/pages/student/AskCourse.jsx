import { useEffect, useState } from "react";
import { getCategories } from "../../services/category.service";
import { createRequest, getMyRequests } from "../../services/courseRequest.service";
import Badge from "../../components/common/Badge";
import EmptyState from "../../components/common/EmptyState";
import WaterLilyButton from "../../components/common/WaterLilyButton";

const AskCourse = () => {
  const [categories, setCategories] = useState([]);
  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState({ courseName: "", categoryId: "", reason: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const [categoryResponse, requestResponse] = await Promise.all([
        getCategories(), getMyRequests(),
      ]);
      setCategories(categoryResponse?.data?.categories || []);
      setRequests(requestResponse?.data?.requests || []);
    } catch (err) {
      setError(err.message || "Failed to load course requests.");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const submit = async (event) => {
    event.preventDefault();
    if (!form.courseName.trim() || !form.categoryId || !form.reason.trim()) {
      setError("Course name, category, and reason are required.");
      return;
    }
    try {
      setSaving(true); setError("");
      await createRequest({ ...form, categoryId: Number(form.categoryId) });
      setForm({ courseName: "", categoryId: "", reason: "" });
      await load();
    } catch (err) { setError(err.message || "Failed to submit request."); }
    finally { setSaving(false); }
  };

  return (
    <section className="student-page">
      <div className="student-page-header">
        <div>
          <p className="page-eyebrow">ASK COURSE</p>
          <h1>Cast a wish into the pond 🌊</h1>
          <p className="page-description">
            Tell EduPond what you want to learn next — instructors and
            admins can see every ripple you send out.
          </p>
        </div>
      </div>

      {error && <div className="student-error">{error}</div>}

      <div className="pond-panel relative overflow-hidden p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-blob bg-pond-100/70 blur-2xl" />

        <h2 className="relative mb-5 text-lg text-pond-800">
          Request a new course
        </h2>

        <form className="relative grid grid-cols-1 gap-5 sm:grid-cols-2" onSubmit={submit}>
          <div className="form-field">
            <label htmlFor="request-name">Course name</label>
            <input
              id="request-name"
              placeholder="e.g. Intro to Watercolor Painting"
              value={form.courseName}
              onChange={(e) => setForm({ ...form, courseName: e.target.value })}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="request-category">Category</label>
            <select
              id="request-category"
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              required
            >
              <option value="">Select category</option>
              {categories.filter((c) => c.status === "ACTIVE" || !c.status).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="form-field full-width">
            <label htmlFor="request-reason">Why do you need this course?</label>
            <textarea
              id="request-reason"
              rows="5"
              placeholder="Share a bit of context — your goals, level, or what sparked the idea."
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              required
            />
          </div>

          <div className="form-actions full-width">
            <WaterLilyButton type="submit" variant="bloom" loading={saving}>
              {saving ? "Sending..." : "Submit Request"}
            </WaterLilyButton>
          </div>
        </form>
      </div>

      <div className="student-page-header mt-10">
        <div>
          <p className="page-eyebrow">RIPPLES</p>
          <h2>My Requests</h2>
        </div>
      </div>

      {loading ? (
        <div className="student-state">Loading requests...</div>
      ) : requests.length === 0 ? (
        <EmptyState
          title="No requests yet"
          message="Your submitted course requests will appear here."
        />
      ) : (
        <div className="student-list">
          {requests.map((request) => (
            <article key={request.id} className="student-list-item">
              <div>
                <h3>{request.course_name}</h3>
                <p>{request.reason}</p>
                <div className="course-meta">
                  <span>{request.category_name}</span>
                  <span>{new Date(request.created_at).toLocaleDateString()}</span>
                </div>
                {request.admin_note && (
                  <p className="mt-2 text-sm">
                    <strong>Admin note:</strong> {request.admin_note}
                  </p>
                )}
              </div>
              <Badge>{request.status}</Badge>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default AskCourse;
