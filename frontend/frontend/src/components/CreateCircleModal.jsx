import { useState } from "react";
import { createCircle } from "../services/circle.service";
import "./modal.css";

function CreateCircleModal({ isOpen, onClose, onCreated = () => {} }) {
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
      const circle = res?.data?.circle || res?.data?.data || res?.data;

      if (circle && circle.name) {
        onCreated(circle);
        onClose();
      } else {
        setError("Unexpected server response");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create circle");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay-shared">
      <div className="modal-card-shared">
        <h3 className="modal-title-shared">Create Circle</h3>

        {error && <p className="modal-error-shared">{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            name="name"
            placeholder="Circle name"
            required
            disabled={loading}
            className="modal-field-shared"
          />

          <textarea
            name="description"
            placeholder="Description (optional)"
            rows={3}
            disabled={loading}
            className="modal-textarea-shared"
          />

          <div className="modal-actions-shared">
            <button type="button" className="modal-btn-shared" onClick={onClose} disabled={loading}>
              Cancel
            </button>

            <button type="submit" className="modal-btn-shared modal-btn-primary" disabled={loading}>
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateCircleModal;
