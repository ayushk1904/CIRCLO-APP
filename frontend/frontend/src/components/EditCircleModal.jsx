import { useState, useEffect } from "react";
import { updateCircle } from "../services/circle.service";
import "./modal.css";

function EditCircleModal({ isOpen, onClose, circle, onUpdated = () => {} }) {
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
      const res = await updateCircle(circle._id, { name, description });
      onUpdated(res.data.circle);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update circle");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay-shared">
      <div className="modal-card-shared">
        <h3 className="modal-title-shared">Edit Circle</h3>

        {error && <p className="modal-error-shared">{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            className="modal-field-shared"
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            disabled={loading}
            className="modal-textarea-shared"
          />

          <div className="modal-actions-shared">
            <button type="button" className="modal-btn-shared" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="modal-btn-shared modal-btn-primary" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditCircleModal;
