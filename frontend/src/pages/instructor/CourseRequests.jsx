import { useEffect, useState } from "react";
import { getAvailableRequests } from "../../services/courseRequest.service";
import EmptyState from "../../components/common/EmptyState";
import Badge from "../../components/common/Badge";
import { Link } from "react-router-dom";

const CourseRequests = () => {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => {
    getAvailableRequests()
      .then((response) => setRequests(response?.data?.requests || []))
      .catch((err) => setError(err.message || "Failed to load demand."));
  }, []);
  return (
    <section className="instructor-page">
      <div className="instructor-page-header">
        <div><p className="page-eyebrow">ASK COURSE</p><h1>Course Requests</h1>
          <p className="page-description">Approved student demand you can use as a proposal reference.</p></div>
        <Link to="/instructor/proposals/new" className="primary-link">Create Proposal</Link>
      </div>
      {error && <div className="instructor-error">{error}</div>}
      {requests.length === 0 ? <EmptyState title="No approved requests" message="Admin-approved demand will appear here." /> :
        <div className="instructor-list">{requests.map((request) =>
          <article key={request.id} className="instructor-list-item">
            <div className="instructor-course-info">
              <div className="instructor-course-header"><h2>{request.course_name}</h2><Badge>{request.status}</Badge></div>
              <p>{request.reason}</p>
              <div className="course-meta"><span>Category: {request.category_name}</span><span>Requested by: {request.student_name}</span></div>
            </div>
            <Link to={`/instructor/proposals/new?requestId=${request.id}`}>Use for Proposal</Link>
          </article>
        )}</div>}
    </section>
  );
};
export default CourseRequests;
