import { useState } from "react";
import { createCircle } from "../services/circle.service";

function CreateCircleModal({ isOpen, onClose, onCreated }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.target);
    const name = formData.get("name")?.trim();
    const description = formData.get("description")?.trim();

    if (!name) {
      setError("Circle name is required");
      return;
    }

    try {
      setLoading(true);

      const res = await createCircle({ name, description });

      const circle =
        res?.data?.circle ||
        res?.data?.data ||
        res?.data;

      if (circle && circle.name) {
        onCreated(circle);
        onClose();
      } else {
        setError("Unexpected server response");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to create circle"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h3>Create Circle</h3>

        {error && (
          <p style={{ color: "red", marginBottom: 8 }}>
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <input
            name="name"
            placeholder="Circle name"
            required
            disabled={loading}
            style={{ width: "100%", marginBottom: 8 }}
          />

          <textarea
            name="description"
            placeholder="Description (optional)"
            rows={3}
            disabled={loading}
            style={{ width: "100%", marginBottom: 8 }}
          />

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button type="button" onClick={onClose} disabled={loading}>
              Cancel
            </button>

            <button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create"}
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

export default CreateCircleModal;




