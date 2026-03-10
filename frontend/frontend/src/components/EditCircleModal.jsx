import { useState, useEffect } from "react";
import { updateCircle } from "../services/circle.service";

function EditCircleModal({ isOpen, onClose, circle, onUpdated }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (circle) {
      setName(circle.name);
      setDescription(circle.description || "");
    }
  }, [circle]);

  if (!isOpen || !circle) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Circle name is required");
      return;
    }

    try {
      setLoading(true);

      const res = await updateCircle(circle._id, {
        name,
        description,
      });

      onUpdated(res.data.circle);
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update circle"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h3>Edit Circle</h3>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            style={{ width: "100%", marginBottom: 8 }}
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            disabled={loading}
            style={{ width: "100%", marginBottom: 8 }}
          />

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button type="button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalStyle = {
  background: "#fff",
  padding: 20,
  borderRadius: 8,
  width: 400,
};

export default EditCircleModal;
