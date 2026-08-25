import { useEffect, useState } from "react";
import api from "../services/api";

function HomePage() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const checkApi = async () => {
      try {
        const response = await api.get("/health");
        setMessage(response.data.message);
      } catch (error) {
        setMessage("Unable to connect to EduPond API.");
      }
    };

    checkApi();
  }, []);

  return (
    <div>
      <h1>EduPond</h1>
      <p>A pond of knowledge.</p>
      <p>Full-Stack Education Platform</p>

      <hr />

      <p>API Status: {message}</p>
    </div>
  );
}

export default HomePage;