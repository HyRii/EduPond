import { useEffect, useState } from "react";
import { getCategories } from "../../services/category.service";
import { createRequest, getMyRequests } from "../../services/courseRequest.service";
import Badge from "../../components/common/Badge";
import EmptyState from "../../components/common/EmptyState";

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
          <h1>Request a Course</h1>
          <p className="page-description">Tell EduPond what you want to learn next.</p>
        </div>
      </div>
      {error && <div className="student-error">{error}</div>}
      <form className="builder-form" onSubmit={submit}>
        <div className="form-field">
          <label htmlFor="request-name">Course name</label>
          <input id="request-name" value={form.courseName}
            onChange={(e) => setForm({ ...form, courseName: e.target.value })} required />
        </div>
        <div className="form-field">
          <label htmlFor="request-category">Category</label>
          <select id="request-category" value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required>
            <option value="">Select category</option>
            {categories.filter((c) => c.status === "ACTIVE" || !c.status).map((c) =>
              <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="form-field full-width">
          <label htmlFor="request-reason">Why do you need this course?</label>
          <textarea id="request-reason" rows="5" value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })} required />
        </div>
        <div className="form-actions">
          <button type="submit" disabled={saving}>{saving ? "Submitting..." : "Submit Request"}</button>
        </div>
      </form>
      <div className="student-page-header">
        <div><h2>My Requests</h2></div>
      </div>
      {loading ? <div className="student-state">Loading requests...</div> :
        requests.length === 0 ? <EmptyState title="No requests yet" message="Your submitted course requests will appear here." /> :
        <div className="student-list">{requests.map((request) =>
          <article key={request.id} className="student-list-item">
            <div>
              <h3>{request.course_name}</h3>
              <p>{request.reason}</p>
              <div className="course-meta"><span>{request.category_name}</span><span>{new Date(request.created_at).toLocaleDateString()}</span></div>
              {request.admin_note && <p><strong>Admin note:</strong> {request.admin_note}</p>}
            </div>
            <Badge>{request.status}</Badge>
          </article>
        )}</div>}
    </section>
  );
};

export default AskCourse;
