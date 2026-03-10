import "./modal.css";

function ConfirmDeleteModal({ isOpen, onClose, onConfirm, loading }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay-shared">
      <div className="modal-card-shared">
        <h3 className="modal-title-shared">Delete Circle</h3>
        <p className="modal-text-shared">
          Are you sure you want to delete this circle?
        </p>

        <div className="modal-actions-shared">
          <button className="modal-btn-shared" onClick={onClose} disabled={loading}>
            Cancel
          </button>

          <button
            className="modal-btn-shared modal-btn-danger"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDeleteModal;
