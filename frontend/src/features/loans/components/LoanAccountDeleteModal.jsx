export default function LoanAccountDeleteModal({
    account,
    onConfirm,
    onCancel
}) {

    if (!account) {
        return null;
    }

    return (

        <div
            className="modal fade show"
            style={{
                display: "block"
            }}
            tabIndex="-1"
            role="dialog"
            aria-modal="true"
        >

            <div className="modal-dialog modal-dialog-centered">

                <div className="modal-content">

                    <div className="modal-header">

                        <h5 className="modal-title">
                            Delete Loan Account
                        </h5>

                        <button
                            type="button"
                            className="btn-close"
                            onClick={onCancel}
                            aria-label="Close"
                        />

                    </div>

                    <div className="modal-body">

                        <p>
                            Are you sure you want to delete
                            this loan account?
                        </p>

                        <strong>
                            {account.loanName}
                        </strong>

                        <p className="text-muted mt-2">
                            This action cannot be undone.
                        </p>

                    </div>

                    <div className="modal-footer">

                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onCancel}
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            className="btn btn-danger"
                            onClick={onConfirm}
                        >
                            Delete
                        </button>

                    </div>

                </div>

            </div>

        </div>

    );
}