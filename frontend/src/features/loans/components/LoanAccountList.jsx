export default function LoanAccountList({
    accounts,
    onEdit,
    onDelete
}) {

    if (!accounts || accounts.length === 0) {

        return (
            <div className="alert alert-info">
                No loan accounts have been created.
            </div>
        );

    }

    return (

        <div className="table-responsive">

            <table className="table table-striped table-hover">

                <thead>

                    <tr>
                        <th>Loan Vendor</th>
                        <th>Loan Name</th>
                        <th>Account Number</th>
                        <th>Current Balance</th>
                        <th>Actions</th>
                    </tr>

                </thead>

                <tbody>

                    {accounts.map(account => (

                        <tr key={account.id}>

                            <td>
                                {account.lenderName}
                            </td>

                            <td>
                                {account.loanName}
                            </td>

                            <td>
                                ****
                                {account.loanAccountNumber?.slice(-4)}
                            </td>

                            <td>
                                $
                                {Number(
                                    account.currentBalance || 0
                                ).toLocaleString(
                                    "en-US",
                                    {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    }
                                )}
                            </td>

                            <td>

                                <button
                                    type="button"
                                    className="btn btn-sm btn-primary me-2"
                                    onClick={() =>
                                        onEdit(account)
                                    }
                                >
                                    Edit
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-sm btn-danger"
                                    onClick={() =>
                                        onDelete(account)
                                    }
                                >
                                    Delete
                                </button>

                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>

    );
}