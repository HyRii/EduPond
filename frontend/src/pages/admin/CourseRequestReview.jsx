import { useEffect, useState } from "react";
import { getDemand, listRequests, reviewRequest } from "../../services/courseRequest.service";
import { getCategories } from "../../services/category.service";
import Badge from "../../components/common/Badge";
import EmptyState from "../../components/common/EmptyState";

const CourseRequestReview = () => {
  const [requests,setRequests]=useState([]),[demand,setDemand]=useState([]),[categories,setCategories]=useState([]);
  const [status,setStatus]=useState("PENDING"),[categoryId,setCategoryId]=useState(""),[error,setError]=useState("");
  const load=async()=>{try{setError("");const [r,d,c]=await Promise.all([listRequests({status,categoryId}),getDemand(),getCategories()]);setRequests(r?.data?.requests||[]);setDemand(d?.data?.demand||[]);setCategories(c?.data?.categories||[]);}catch(e){setError(e.message||"Failed to load requests.");}};
  useEffect(()=>{load();},[status,categoryId]);
  const review=async(id,next)=>{const note=window.prompt(`Optional note for ${next.toLowerCase()}:`,"");try{await reviewRequest(id,next,note||"");await load();}catch(e){setError(e.message||"Failed to review request.");}};
  return <section className="admin-page"><div className="admin-page-header"><div><p className="page-eyebrow">ASK COURSE</p><h1>Course Request Review</h1><p className="page-description">Moderate demand and identify the courses students need most.</p></div></div>
    {error&&<div className="admin-error">{error}</div>}
    <div className="admin-filter-bar"><div className="admin-filter"><label>Status</label><select value={status} onChange={e=>setStatus(e.target.value)}><option>PENDING</option><option>APPROVED</option><option>REJECTED</option><option>POSTED</option><option>ARCHIVED</option></select></div><div className="admin-filter"><label>Category</label><select value={categoryId} onChange={e=>setCategoryId(e.target.value)}><option value="">All categories</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div></div>
    <div className="admin-list"><h2>Requests</h2>{requests.length?requests.map(r=><article key={r.id} className="admin-list-item"><div><div className="admin-list-title"><h2>{r.course_name}</h2><Badge>{r.status}</Badge></div><p>{r.reason}</p><div className="course-meta"><span>{r.category_name}</span><span>Student: {r.student_name}</span></div></div>{r.status==="PENDING"&&<div className="form-actions"><button onClick={()=>review(r.id,"APPROVED")}>Approve</button><button onClick={()=>review(r.id,"REJECTED")}>Reject</button></div>}</article>):<EmptyState title="No matching requests" message="Try another filter."/>}</div>
    <div className="admin-list"><h2>Aggregated Demand</h2>{demand.map(d=><article key={`${d.category_id}-${d.course_name}`} className="admin-list-item"><div><h3>{d.course_name}</h3><p>{d.category_name}</p></div><strong>{d.request_count} request{Number(d.request_count)===1?"":"s"}</strong></article>)}</div>
  </section>;
};
export default CourseRequestReview;
