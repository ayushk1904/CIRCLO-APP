import { useState } from "react";
import axios from "../services/api";

function ProfileAvatar({ user, onUpdate }) {
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    setLoading(true);
    const res = await axios.post("/users/avatar", formData);
    setLoading(false);

    onUpdate(res.data.avatar);
  };

  return (
    <div>
      <img
        src={user.avatar || "/avatar-placeholder.png"}
        alt="avatar"
        style={{ width: 80, height: 80, borderRadius: "50%" }}
      />

      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={loading}
      />
    </div>
  );
}

export default ProfileAvatar;
