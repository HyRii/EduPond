// NEW FILE (Phase 4): Admin proposal review queue and conversion to course.
import { useEffect, useState } from "react";
import { listProposals, getProposalDetail, reviewProposal, convertProposal } from "../../services/proposal.service";
import Badge from "../../components/common/Badge";
import EmptyState from "../../components/common/EmptyState";

const ProposalReview = () => {
  const [proposals,setProposals]=useState([]),[selected,setSelected]=useState(null),[status,setStatus]=useState("PENDING_REVIEW"),[error,setError]=useState("");
  const load=()=>listProposals(status).then(r=>setProposals(r?.data?.proposals||[])).catch(e=>setError(e.message||"Failed to load proposals."));
  useEffect(()=>{load();setSelected(null);},[status]);
  const select=async(id)=>{try{setSelected((await getProposalDetail(id))?.data?.proposal||null);}catch(e){setError(e.message||"Failed to load proposal.");}};
  const review=async(next)=>{const note=window.prompt(`Admin note for ${next}:`,"");try{await reviewProposal(selected.id,next,note||"");await load();await select(selected.id);}catch(e){setError(e.message||"Failed to review proposal.");}};
  const convert=async()=>{if(!window.confirm("Convert this approved proposal into a published course?"))return;try{await convertProposal(selected.id);await load();await select(selected.id);}catch(e){setError(e.message||"Failed to convert proposal.");}};
  return <section className="admin-page"><div className="admin-page-header"><div><p className="page-eyebrow">PROPOSALS</p><h1>Proposal Review</h1><p className="page-description">Approve, reject, request revisions, then publish approved proposals.</p></div></div>
    {error&&<div className="admin-error">{error}</div>}
    <div className="admin-filter-bar"><div className="admin-filter"><label>Status</label><select value={status} onChange={e=>setStatus(e.target.value)}><option>PENDING_REVIEW</option><option>APPROVED</option><option>REJECTED</option><option>DRAFT</option></select></div></div>
    {!proposals.length?<EmptyState title="No proposals" message="There are no proposals in this state."/>:
    <div className="admin-list">{proposals.map(p=><article key={p.id} className="admin-list-item"><div><div className="admin-list-title"><h2>{p.course_name}</h2><Badge>{p.status}</Badge></div><p>{p.description||"No description."}</p><div className="course-meta"><span>{p.category_name}</span><span>Instructor: {p.instructor_name}</span>{p.requested_course_name&&<span>Demand: {p.requested_course_name}</span>}</div></div><button onClick={()=>select(p.id)}>Review</button></article>)}</div>}
    {selected&&<article className="admin-detail-card"><div className="admin-list-title"><h2>{selected.course_name}</h2><Badge>{selected.status}</Badge></div><p>{selected.description}</p>{selected.admin_note&&<p><strong>Admin note:</strong> {selected.admin_note}</p>}
      {selected.sections?.map(s=><div key={s.id}><h3>Section {s.sort_order}: {s.title}</h3>{s.lessons?.map(l=><p key={l.id}>• Lesson {l.sort_order}: {l.title} ({l.content_type})</p>)}</div>)}
      {selected.status==="PENDING_REVIEW"&&<div className="form-actions"><button onClick={()=>review("APPROVED")}>Approve</button><button onClick={()=>review("REVISION_REQUESTED")}>Request Revision</button><button onClick={()=>review("REJECTED")}>Reject</button></div>}
      {selected.status==="APPROVED"&&!selected.course_id&&<button onClick={convert}>Convert to Published Course</button>}
      {selected.course_id&&<p className="student-success">Published as course #{selected.course_id}.</p>}
    </article>}
  </section>;
};
export default ProposalReview;
