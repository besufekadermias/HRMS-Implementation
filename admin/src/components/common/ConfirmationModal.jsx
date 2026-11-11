import Modal from './Modal.jsx'
import Icon from './Icon.jsx'

export default function ConfirmationModal({
  title,
  children,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirm',
  destructive = false,
}) {
  return (
    <Modal title={title} onClose={onCancel}>
      <div className="confirmation-copy">{children}</div>
      <div className="modal-actions">
        <button
          type="button"
          className="button button-secondary"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="button"
          className={`button ${destructive ? 'button-danger' : 'button-primary'}`}
          onClick={onConfirm}
        >
          {destructive && <Icon name="trash" size={17} />}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
