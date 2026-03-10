import "./sidebar.css";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import MyAccountModal from "./MyAccountModal";

function Sidebar({ circles, activeCircleId, onSelectCircle }) {
  const { user } = useAuth();
  const [openAccount, setOpenAccount] = useState(false);

  return (
    <>
      <aside className="sidebar">
        {/* PROFILE */}
        <div className="sidebar-profile">
          <div
            className="profile-avatar"
            onClick={() => setOpenAccount(true)}
          >
            <img
              src={user?.avatar || "/default-avatar.png"}
              alt="Profile"
            />
          </div>

          <button
            className="account-btn"
            onClick={() => setOpenAccount(true)}
          >
            My Account
          </button>
        </div>

        {/* CIRCLES */}
        <div className="sidebar-section">
          <p className="sidebar-title">Your Circles</p>

          {circles.map((circle) => (
            <div
              key={circle._id}
              className={`circle-item ${
                activeCircleId === circle._id ? "active" : ""
              }`}
              onClick={() => onSelectCircle(circle._id)}
            >
              <div className="circle-avatar">
                {circle.name.charAt(0).toUpperCase()}
              </div>

              <div className="circle-info">
                <div className="circle-name">{circle.name}</div>
                <div className="circle-meta">
                  {circle.members.length} members
                </div>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* ACCOUNT MODAL */}
      <MyAccountModal
        isOpen={openAccount}
        onClose={() => setOpenAccount(false)}
      />
    </>
  );
}

export default Sidebar;
