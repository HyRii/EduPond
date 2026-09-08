import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import PondBackground from "../components/common/PondBackground";
import PondMark from "../components/common/PondMark";
import WaterLilyButton from "../components/common/WaterLilyButton";
import { isAuthenticated, getRole } from "../utils/auth";

const ROLE_HOME = {
  ADMIN: "/admin",
  INSTRUCTOR: "/instructor",
  STUDENT: "/student",
};

const HomePage = () => {
  const [message, setMessage] = useState("Checking the water...");
  const [apiOk, setApiOk] = useState(null);

  useEffect(() => {
    const checkApi = async () => {
      try {
        const response = await api.get("/health");
        setMessage(response.data.message);
        setApiOk(true);
      } catch (error) {
        setMessage("Unable to connect to EduPond API.");
        setApiOk(false);
      }
    };

    checkApi();
  }, []);

  const authenticated = isAuthenticated();
  const dashboardPath = ROLE_HOME[getRole()] || "/login";

  return (
    <div className="home-page">
      <PondBackground variant="light" bubbleCount={20} />

      {/* floating lily pads decorating the hero */}
      <div className="pointer-events-none absolute left-[8%] top-[18%] hidden h-16 w-16 rounded-blob bg-pond-400/50 shadow-pond-sm animate-float md:block" />
      <div className="pointer-events-none absolute right-[10%] top-[28%] hidden h-10 w-10 rounded-blob-2 bg-pond-300/60 shadow-pond-sm animate-float-slow md:block" />
      <div className="pointer-events-none absolute bottom-[16%] left-[16%] hidden h-12 w-12 rounded-blob bg-pond-400/40 shadow-pond-sm animate-float md:block" />

      <div className="relative z-10 flex max-w-2xl flex-col items-center">
        <PondMark size={84} className="mb-4 animate-float drop-shadow" />

        <p className="pond-eyebrow mb-3">Full-Stack Education Platform</p>

        <h1 className="text-shadow-soft">EduPond</h1>
        <p className="text-lg">A pond of knowledge.</p>
        <p>Learn, teach and grow — one ripple at a time.</p>

        <div className="home-actions">
          {authenticated ? (
            <WaterLilyButton as={Link} to={dashboardPath} variant="bloom">
              Go to my dashboard
            </WaterLilyButton>
          ) : (
            <>
              <WaterLilyButton as={Link} to="/login" variant="bloom">
                Login
              </WaterLilyButton>
              <WaterLilyButton as={Link} to="/register/student" variant="leaf">
                Join as Student
              </WaterLilyButton>
              <WaterLilyButton as={Link} to="/register/instructor" variant="leaf">
                Become an Instructor
              </WaterLilyButton>
            </>
          )}
        </div>

        <div className="mt-10 flex items-center gap-2 rounded-full border border-pond-200 bg-white/70 px-4 py-2 text-xs font-semibold text-pond-600 shadow-pond-sm backdrop-blur-sm">
          <span
            className={`h-2 w-2 rounded-full ${
              apiOk === null
                ? "bg-gold-400 animate-pulse"
                : apiOk
                  ? "bg-pond-500"
                  : "bg-koi-500"
            }`}
          />
          API Status: {message}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
