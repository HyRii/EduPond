// EDITED (Phase 3D): Added generated certificate JPEG thumbnails.
import {
  useEffect,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  getMyCertificates,
} from "../../services/certificate.service";

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCertificates = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getMyCertificates();
        setCertificates(
          response?.data?.certificates || []
        );
      } catch (error) {
        setError(
          error.message ||
            "Failed to load certificates."
        );
      } finally {
        setLoading(false);
      }
    };

    loadCertificates();
  }, []);

  if (loading) {
    return (
      <section className="student-page">
        <div className="student-state">
          Loading certificates...
        </div>
      </section>
    );
  }

  return (
    <section className="student-page">
      <div className="student-page-header">
        <div>
          <p className="page-eyebrow">STUDENT</p>
          <h1>My Certificates</h1>
          <p className="page-description">
            Certificates you have earned.
          </p>
        </div>
      </div>

      {error && (
        <div className="student-error">{error}</div>
      )}

      {certificates.length === 0 ? (
        <div className="student-empty">
          <h2>No certificates yet</h2>
          <p>
            Complete eligible courses to earn certificates.
          </p>
        </div>
      ) : (
        <div className="student-certificate-grid">
          {certificates.map((certificate) => (
            <article
              key={certificate.id}
              className="student-certificate-card"
            >
              {certificate.certificate_url && (
                <img
                  src={certificate.certificate_url}
                  alt={`Certificate for ${certificate.course_title}`}
                  className="certificate-thumbnail"
                />
              )}

              <div className="certificate-card-body">
                <p className="page-eyebrow">CERTIFICATE</p>
                <h2>{certificate.course_title}</h2>
                <p>
                  Certificate No:
                  <br />
                  <strong>{certificate.certificate_no}</strong>
                </p>
                <p>
                  Issued: {new Date(
                    certificate.issued_at
                  ).toLocaleDateString()}
                </p>

                <Link
                  to={`/student/certificates/${certificate.id}`}
                >
                  View Certificate
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default Certificates;
