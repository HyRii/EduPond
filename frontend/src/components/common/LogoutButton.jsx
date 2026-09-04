import { useNavigate } from "react-router-dom";
import { logout } from "../../utils/auth";

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <button
      type="button"
      className="logout-button"
      onClick={handleLogout}
    >
      Logout
    </button>
  );
};

export default LogoutButton;