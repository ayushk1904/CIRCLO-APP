import "./confirmLeaveCircleModal.css";

function ConfirmLeaveCircleModal({
  isOpen,
  onClose,
  onConfirm,
  loading,
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3 className="modal-title">Leave Circle</h3>

        <p className="modal-text">
          Are you sure you want to leave this circle?
        </p>

        <div className="modal-actions">
          <button
            className="btn btn-outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Leaving..." : "Leave"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmLeaveCircleModal;
