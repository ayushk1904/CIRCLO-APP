import { useRef, useState } from "react";
import Cropper from "react-easy-crop";
import { uploadAvatar } from "../services/user.service";
import { useAuth } from "../context/AuthContext";
import { getCroppedImg } from "../utils/cropImage";
import "./myAccountModal.css";

function MyAccountModal({ isOpen, onClose }) {
  const { user, setUser, logout } = useAuth();
  const fileInputRef = useRef(null);

  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  if (!isOpen || !user) return null;

  /* ================= FILE SELECT ================= */
  const onSelectFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageSrc(URL.createObjectURL(file));
  };

  /* ================= UPLOAD CROPPED IMAGE ================= */
  const uploadCroppedImage = async () => {
    try {
      setLoading(true);

      const blob = await getCroppedImg(imageSrc, croppedArea);
      const file = new File([blob], "avatar.jpg", {
        type: "image/jpeg",
      });

      const res = await uploadAvatar(file);
      setUser(res.user); // ✅ keep session alive
      setImageSrc(null);
    } catch (err) {
      console.error(err);
      alert("Avatar upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="account-overlay" onClick={onClose}>
      <div
        className="account-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="account-header">
          <h2>My Account</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* ================= CROP MODE ================= */}
        {imageSrc ? (
          <>
            <div className="crop-container">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, area) =>
                  setCroppedArea(area)
                }
              />
            </div>

            <div className="crop-actions">
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(e.target.value)}
              />

              <button
                className="btn primary"
                onClick={uploadCroppedImage}
                disabled={loading}
              >
                {loading ? "Uploading..." : "Save Avatar"}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* ================= PROFILE ================= */}
            <div className="account-profile">
              <div
                className="avatar-wrapper"
                onClick={() =>
                  fileInputRef.current.click()
                }
              >
                <img
                  src={
                    user.avatar || "/default-avatar.png"
                  }
                  alt="avatar"
                  className="account-avatar"
                />
                <span className="avatar-edit">
                  Change
                </span>
              </div>

              <input
                type="file"
                hidden
                ref={fileInputRef}
                accept="image/*"
                onChange={onSelectFile}
              />

              <div className="account-info">
                <h3>{user.name}</h3>
                <p className="account-email">
                  {user.email}
                </p>
              </div>
            </div>

            {/* ================= LOGOUT ================= */}
            <div className="account-actions">
              {!confirmLogout ? (
                <button
                  className="logout-btn"
                  onClick={() =>
                    setConfirmLogout(true)
                  }
                >
                  Logout
                </button>
              ) : (
                <div className="logout-confirm">
                  <p>Are you sure?</p>
                  <div className="confirm-actions">
                    <button
                      className="btn cancel"
                      onClick={() =>
                        setConfirmLogout(false)
                      }
                    >
                      Cancel
                    </button>
                    <button
                      className="btn danger"
                      onClick={logout}
                    >
                      Yes, Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default MyAccountModal;
