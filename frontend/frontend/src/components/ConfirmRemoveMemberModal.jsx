import "./modal.css";

function ConfirmRemoveMemberModal({
  isOpen,
  onClose,
  onConfirm,
  loading,
  memberName,
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay-shared">
      <div className="modal-card-shared">
        <h3 className="modal-title-shared">Remove Member</h3>
        <p className="modal-text-shared">
          Are you sure you want to remove <strong>{memberName}</strong> from this
          circle?
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
            {loading ? "Removing..." : "Remove"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmRemoveMemberModal;
