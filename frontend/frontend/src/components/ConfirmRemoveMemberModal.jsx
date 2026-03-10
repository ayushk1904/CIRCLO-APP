function ConfirmRemoveMemberModal({
  isOpen,
  onClose,
  onConfirm,
  loading,
  memberName,
}) {
  if (!isOpen) return null;

  return (
    <div style={overlay}>
      <div style={modal}>
        <h3>Remove Member</h3>
        <p>
          Are you sure you want to remove{" "}
          <strong>{memberName}</strong> from this circle?
        </p>

        <div style={{ marginTop: 16 }}>
          <button onClick={onClose} disabled={loading}>
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              marginLeft: 8,
              background: "red",
              color: "white",
            }}
          >
            {loading ? "Removing..." : "Remove"}
          </button>
        </div>
      </div>
    </div>
  );
}

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modal = {
  background: "white",
  padding: 20,
  borderRadius: 6,
  width: 350,
};

export default ConfirmRemoveMemberModal;
