import { useRef } from "react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

function AvatarUpload({ avatar, size = 40 }) {
  const fileRef = useRef(null);
  const { user, setUser } = useAuth();

  const handleClick = () => {
    fileRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await API.post("/users/avatar", formData);
      setUser((prev) => ({
        ...prev,
        avatar: res.data.avatar,
      }));
    } catch (err) {
      alert("Avatar upload failed");
    }
  };

  return (
    <>
      <img
        src={
          avatar ||
          `https://ui-avatars.com/api/?name=${user.name}&background=6c63ff&color=fff`
        }
        alt="avatar"
        onClick={handleClick}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          cursor: "pointer",
          objectFit: "cover",
        }}
      />

      <input
        type="file"
        accept="image/*"
        ref={fileRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </>
  );
}

export default AvatarUpload;
