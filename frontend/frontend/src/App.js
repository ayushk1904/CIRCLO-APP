import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CircleDetail from "./pages/CircleDetail";
import ProtectedRoute from "./routes/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import AcceptInvite from "./pages/AcceptInvite";

function App() {
  const { user, loading } = useAuth();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    document.body.classList.remove("dark", "light");
    document.body.classList.add(savedTheme === "light" ? "light" : "dark");
  }, []);

  return (
    <BrowserRouter>
      {loading && (
        <div className="app-loading-overlay">
          <p>Loading...</p>
        </div>
      )}

      {!loading && <Navbar />}

      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" replace /> : <Login />}
        />

        <Route
          path="/register"
          element={user ? <Navigate to="/dashboard" replace /> : <Register />}
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/circles/:id"
          element={
            <ProtectedRoute>
              <CircleDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/invite/:token"
          element={
            <ProtectedRoute>
              <AcceptInvite />
            </ProtectedRoute>
          }
        />

        <Route
          path="/"
          element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
