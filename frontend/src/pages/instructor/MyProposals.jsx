// NEW FILE (Phase 4): Instructor proposal status and feedback list.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyProposals } from "../../services/proposal.service";
import Badge from "../../components/common/Badge";
import EmptyState from "../../components/common/EmptyState";

const MyProposals = () => {
  const [proposals,setProposals]=useState([]); const [error,setError]=useState("");
  const load=()=>getMyProposals().then(r=>setProposals(r?.data?.proposals||[])).catch(e=>setError(e.message||"Failed to load proposals."));
  useEffect(()=>{load();},[]);
  return <section className="instructor-page">
    <div className="instructor-page-header"><div><p className="page-eyebrow">PROPOSALS</p><h1>My Proposals</h1><p className="page-description">Track proposals and Admin feedback.</p></div><Link to="/instructor/proposals/new" className="primary-link">New Proposal</Link></div>
    {error&&<div className="instructor-error">{error}</div>}
    {!proposals.length?<EmptyState title="No proposals yet" message="Create a proposal from an approved course request or from scratch."/>:
    <div className="instructor-list">{proposals.map(p=><article key={p.id} className="instructor-list-item"><div className="instructor-course-info"><div className="instructor-course-header"><h2>{p.course_name}</h2><Badge>{p.status}</Badge></div><p>{p.description||"No description."}</p><div className="course-meta"><span>{p.category_name}</span>{p.admin_note&&<span>Feedback: {p.admin_note}</span>}</div></div>{["REJECTED","REVISION_REQUESTED"].includes(p.status)&&<Link to={`/instructor/proposals/${p.id}/edit`}>Revise</Link>}{p.status==="APPROVED"&&p.course_id&&<span>Course #{p.course_id} published</span>}</article>)}</div>}
  </section>;
};
export default MyProposals;
