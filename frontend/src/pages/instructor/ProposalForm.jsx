import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { getCategories } from "../../services/category.service";
import { createProposal, updateProposal, getMyProposalDetail, addProposalSection, addProposalLesson, submitProposal } from "../../services/proposal.service";

const blankLesson = () => ({ title: "", description: "", contentType: "VIDEO", contentUrl: "", resourceUrl: "", durationMinutes: "", isRequired: true });
const blankSection = () => ({ title: "", description: "", lessons: [blankLesson()] });

const ProposalForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [params] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    courseName: "", categoryId: "", description: "", goal: "",
    difficulty: "BEGINNER", durationMinutes: "", certificateEnabled: false,
    requestedCourseRequestId: params.get("requestId") || "",
  });
  const [sections, setSections] = useState([blankSection()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getCategories().then((r) => setCategories(r?.data?.categories || []))
      .catch((e) => setError(e.message || "Failed to load categories."));
    if (id) {
      getMyProposalDetail(id).then((r) => {
        const p = r?.data?.proposal;
        if (!p) return;
        setForm({
          courseName: p.course_name || "", categoryId: p.category_id || "",
          description: p.description || "", goal: p.goal || "",
          difficulty: p.difficulty || "BEGINNER", durationMinutes: p.duration_minutes ?? "",
          certificateEnabled: Boolean(p.certificate_enabled),
          requestedCourseRequestId: p.requested_course_request_id || "",
        });
        setSections((p.sections || []).map((s) => ({
          title: s.title || "", description: s.description || "",
          lessons: (s.lessons || []).map((l) => ({
            title: l.title || "", description: l.description || "",
            contentType: l.content_type || "VIDEO", contentUrl: l.content_url || "",
            resourceUrl: l.resource_url || "", durationMinutes: l.duration_minutes ?? "",
            isRequired: Boolean(l.is_required),
          })),
        })));
      }).catch((e) => setError(e.message || "Failed to load proposal."));
    }
  }, [id]);

  const updateSection = (index, field, value) => setSections((s) => s.map((x, i) => i === index ? { ...x, [field]: value } : x));
  const updateLesson = (si, li, field, value) => setSections((s) => s.map((section, i) => i !== si ? section : {
    ...section, lessons: section.lessons.map((lesson, j) => j === li ? { ...lesson, [field]: value } : lesson),
  }));

  const save = async (event) => {
    event.preventDefault();
    try {
      setSaving(true); setError("");
      if (!form.courseName.trim() || !form.categoryId) throw new Error("Course name and category are required.");
      if (!sections.length || sections.some((s) => !s.title.trim() || !s.lessons.length || s.lessons.some((l) => !l.title.trim()))) {
        throw new Error("Each proposal must contain sections and lessons with titles.");
      }

      const payload = {
        ...form,
        categoryId: Number(form.categoryId),
        durationMinutes: form.durationMinutes === "" ? null : Number(form.durationMinutes),
        requestedCourseRequestId: form.requestedCourseRequestId ? Number(form.requestedCourseRequestId) : null,
      };

      let proposalId = id;
      if (id) {
        await updateProposal(id, payload);
      } else {
        const response = await createProposal(payload);
        proposalId = response?.data?.proposal?.id;
        if (!proposalId) throw new Error("Proposal was not created.");
      }

      // Existing revision drafts keep their existing section/lesson tree.
      // New proposals create the nested draft tree here.
      if (!id) for (let si = 0; si < sections.length; si += 1) {
        const sectionResponse = await addProposalSection(proposalId, {
          title: sections[si].title.trim(), description: sections[si].description.trim(), sortOrder: si + 1,
        });
        const sectionId = sectionResponse?.data?.section?.id;
        for (let li = 0; li < sections[si].lessons.length; li += 1) {
          const lesson = sections[si].lessons[li];
          await addProposalLesson(proposalId, sectionId, {
            ...lesson,
            durationMinutes: lesson.durationMinutes === "" ? null : Number(lesson.durationMinutes),
            sortOrder: li + 1,
          });
        }
      }
      await submitProposal(proposalId);
      navigate("/instructor/proposals");
    } catch (err) { setError(err.message || "Failed to save proposal."); }
    finally { setSaving(false); }
  };

  return (
    <section className="instructor-page">
      <div className="instructor-page-header"><div><p className="page-eyebrow">PROPOSAL</p><h1>{id ? "Revise Course Proposal" : "Create Course Proposal"}</h1>
        <p className="page-description">Build a course proposal and send it to Admin for review.</p></div>
        <Link to="/instructor/proposals">← Back</Link></div>
      {error && <div className="instructor-error">{error}</div>}
      <form className="builder-form" onSubmit={save}>
        {[
          ["courseName","Course name"],["description","Description"],["goal","Learning goal"]
        ].map(([field,label]) => <div className="form-field full-width" key={field}><label>{label}</label>
          <textarea rows={field === "courseName" ? 2 : 4} value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} required={field === "courseName"} /></div>)}
        <div className="form-field"><label>Category</label><select value={form.categoryId} onChange={(e) => setForm({...form,categoryId:e.target.value})} required>
          <option value="">Select category</option>{categories.map((c)=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        <div className="form-field"><label>Difficulty</label><select value={form.difficulty} onChange={(e)=>setForm({...form,difficulty:e.target.value})}><option>BEGINNER</option><option>INTERMEDIATE</option><option>ADVANCED</option></select></div>
        <div className="form-field"><label>Duration (minutes)</label><input type="number" min="0" value={form.durationMinutes} onChange={(e)=>setForm({...form,durationMinutes:e.target.value})}/></div>
        <label className="checkbox-field"><input type="checkbox" checked={form.certificateEnabled} onChange={(e)=>setForm({...form,certificateEnabled:e.target.checked})}/> Certificate enabled</label>
        <div className="full-width">
          <h2>Sections & Lessons</h2>
          {sections.map((section, si) => <article key={si} className="builder-section">
            <div className="form-field"><label>Section {si+1} title</label><input value={section.title} onChange={(e)=>updateSection(si,"title",e.target.value)} required/></div>
            <div className="form-field"><label>Description</label><textarea rows="2" value={section.description} onChange={(e)=>updateSection(si,"description",e.target.value)}/></div>
            {section.lessons.map((lesson,li)=><div key={li} className="builder-form">
              <h3>Lesson {li+1}</h3>
              <div className="form-field"><label>Title</label><input value={lesson.title} onChange={(e)=>updateLesson(si,li,"title",e.target.value)} required/></div>
              <div className="form-field"><label>Description</label><textarea rows="2" value={lesson.description} onChange={(e)=>updateLesson(si,li,"description",e.target.value)}/></div>
              <div className="form-field"><label>Content type</label><select value={lesson.contentType} onChange={(e)=>updateLesson(si,li,"contentType",e.target.value)}><option>VIDEO</option><option>ARTICLE</option><option>DOCUMENT</option><option>LINK</option></select></div>
              <div className="form-field"><label>Content URL</label><input type="url" value={lesson.contentUrl} onChange={(e)=>updateLesson(si,li,"contentUrl",e.target.value)}/></div>
              <div className="form-field"><label>Resource URL</label><input type="url" value={lesson.resourceUrl} onChange={(e)=>updateLesson(si,li,"resourceUrl",e.target.value)}/></div>
              <div className="form-field"><label>Duration</label><input type="number" min="0" value={lesson.durationMinutes} onChange={(e)=>updateLesson(si,li,"durationMinutes",e.target.value)}/></div>
              <label className="checkbox-field"><input type="checkbox" checked={lesson.isRequired} onChange={(e)=>updateLesson(si,li,"isRequired",e.target.checked)}/> Required</label>
            </div>)}
            <button type="button" onClick={()=>setSections((s)=>s.map((x,i)=>i===si?{...x,lessons:[...x.lessons,blankLesson()]}:x))}>+ Add Lesson</button>
          </article>)}
          <button type="button" onClick={()=>setSections((s)=>[...s,blankSection()])}>+ Add Section</button>
        </div>
        <div className="form-actions"><button type="submit" disabled={saving}>{saving ? "Submitting..." : (id ? "Update & Resubmit Proposal" : "Save & Submit Proposal")}</button></div>
      </form>
    </section>
  );
};
export default ProposalForm;
