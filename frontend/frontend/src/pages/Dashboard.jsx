import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/dashboard.css";

import Sidebar from "../components/Sidebar";
import CreateCircleModal from "../components/CreateCircleModal";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import ConfirmLeaveCircleModal from "../components/ConfirmLeaveCircleModal";

import {
  getMyCircles,
  deleteCircle,
  leaveCircle,
  getMyInvites,
} from "../services/circle.service";

import logoLight from "../assets/logo-light.png";
import logoDark from "../assets/logo-dark.png";

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [circles, setCircles] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme")
      ? localStorage.getItem("theme") === "dark"
      : true
  );

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [leaveId, setLeaveId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    document.body.classList.remove("dark", "light");
    document.body.classList.add(darkMode ? "dark" : "light");
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        const circlesRes = await getMyCircles();
        const invitesRes = await getMyInvites();

        setCircles(circlesRes.data.circles || []);
        setInvites(invitesRes.data.invites || []);
      } catch (err) {
        console.error("Dashboard load error", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const isOwner = (circle) =>
    circle.members.find((m) => m.user._id === user._id)?.role === "owner";

  const totalMembers = new Set(
    circles.flatMap((c) => c.members.map((m) => m.user._id))
  ).size;

  return (
    <div className="app-layout">
      <Sidebar
        circles={circles}
        activeCircleId={null}
        onSelectCircle={(circleId) => navigate(`/circles/${circleId}`)}
      />

      <main className="dashboard-container">
        <div className="dashboard-brand">
          <img
            src={darkMode ? logoDark : logoLight}
            alt="Circlo"
            className="dashboard-logo"
          />
        </div>

        <p className="welcome-text">
          Welcome back, <strong>{user.name}</strong>
        </p>

        {invites.length > 0 && (
          <div className="invite-box">
            <h3>Invitations</h3>
            {invites.map((invite) => (
              <div key={invite.token} className="invite-card">
                <p>
                  You were invited to <b>{invite.circleName}</b>
                </p>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate(`/invite/${invite.token}`)}
                >
                  Accept Invite
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="dashboard-actions">
          <button className="btn btn-outline" onClick={() => setDarkMode((p) => !p)}>
            {darkMode ? "Switch to Light" : "Switch to Dark"}
          </button>

          <button className="btn btn-primary" onClick={() => setIsCreateOpen(true)}>
            + Create Circle
          </button>
        </div>

        <div className="stats-grid">
          <div className="stat-card blue">
            <span>Total Circles</span>
            <strong>{circles.length}</strong>
          </div>

          <div className="stat-card purple">
            <span>Total Members</span>
            <strong>{totalMembers}</strong>
          </div>

          <div className="stat-card green">
            <span>Messages</span>
            <strong>0</strong>
          </div>
        </div>

        {loading ? (
          <p className="loading-text">Loading...</p>
        ) : (
          <div className="circles-grid">
            {circles.map((circle) => (
              <div key={circle._id} className="circle-card">
                <h3 onClick={() => navigate(`/circles/${circle._id}`)}>{circle.name}</h3>

                <p>{circle.description}</p>

                <div className="circle-footer">
                  <span>{circle.members.length} members</span>

                  <div className="circle-actions">
                    <button className="btn btn-primary" onClick={() => navigate(`/circles/${circle._id}`)}>
                      Open
                    </button>

                    {isOwner(circle) ? (
                      <button className="btn btn-danger" onClick={() => setDeleteId(circle._id)}>
                        Delete
                      </button>
                    ) : (
                      <button className="btn btn-danger" onClick={() => setLeaveId(circle._id)}>
                        Leave
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <CreateCircleModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />

        <ConfirmDeleteModal
          isOpen={Boolean(deleteId)}
          loading={deleting}
          onClose={() => setDeleteId(null)}
          onConfirm={async () => {
            setDeleting(true);
            await deleteCircle(deleteId);
            setCircles((current) => current.filter((item) => item._id !== deleteId));
            setDeleteId(null);
            setDeleting(false);
          }}
        />

        <ConfirmLeaveCircleModal
          isOpen={Boolean(leaveId)}
          loading={leaving}
          onClose={() => setLeaveId(null)}
          onConfirm={async () => {
            setLeaving(true);
            await leaveCircle(leaveId);
            setCircles((current) => current.filter((item) => item._id !== leaveId));
            setLeaveId(null);
            setLeaving(false);
          }}
        />
      </main>
    </div>
  );
}

export default Dashboard;
