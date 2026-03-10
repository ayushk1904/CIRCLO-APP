import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom";
import "./navbar.css";

function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  // ❌ Hide Navbar completely on Circle pages
  if (location.pathname.startsWith("/circles")) {
    return null;
  }

  if (!user) return null;

  return (
    <nav className="navbar">
      {/* RIGHT ONLY: Logout */}
      <div className="navbar-right">
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
