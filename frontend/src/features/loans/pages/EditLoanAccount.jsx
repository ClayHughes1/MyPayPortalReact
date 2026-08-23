// src/features/loans/pages/EditLoanAccount.jsx

import { useEffect, useState } from "react";

export default function EditLoanAccount({
    account,
    onSuccess,
    onCancel
}) {

    const [lenderName, setLenderName] =
        useState("");

    const [loanName, setLoanName] =
        useState("");

    const [loanAccountNumber, setLoanAccountNumber] =
        useState("");

    const [currentBalance, setCurrentBalance] =
        useState("");


    const [error, setError] =
        useState("");


    useEffect(() => {

        if (!account) {
            return;
        }


        setLenderName(
            account.lenderName || ""
        );

        setLoanName(
            account.loanName || ""
        );

        setLoanAccountNumber(
            account.loanAccountNumber || ""
        );

        setCurrentBalance(
            account.currentBalance ?? ""
        );

    }, [account]);


    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");


        try {

            /*
             * API integration will be added when
             * useLoanAccounts is implemented.
             */

            const updatedAccount = {

                ...account,

                lenderName,

                loanName,

                loanAccountNumber,

                currentBalance:
                    Number(currentBalance)

            };


            if (onSuccess) {

                onSuccess(updatedAccount);

            }

        }
        catch (err) {

            console.error(
                "Unable to update loan account:",
                err
            );

            setError(
                err.message ||
                "Unable to update loan account."
            );

        }

    };


    if (!account) {

        return (

            <div className="container-fluid py-4">

                <div className="alert alert-warning">

                    Loan account information was not found.

                </div>

                <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={onCancel}
                >
                    Return to Loan Accounts
                </button>

            </div>

        );

    }


    return (

        <div className="container-fluid py-4">

            <div className="mb-4">

                <h1>
                    Edit Loan Account
                </h1>

                <p className="text-muted">
                    Update your loan account information.
                </p>

            </div>


            {error && (

                <div className="alert alert-danger">

                    {error}

                </div>

            )}


            <div className="row">

                <div className="col-lg-6">

                    <div className="card shadow">

                        <div className="card-header">

                            <h5 className="mb-0">
                                Loan Account Information
                            </h5>

                        </div>


                        <div className="card-body">

                            <form onSubmit={handleSubmit}>

                                <div className="mb-3">

                                    <label className="form-label">
                                        Loan Vendor
                                    </label>

                                    <input
                                        type="text"
                                        className="form-control"
                                        value={lenderName}
                                        onChange={(e) =>
                                            setLenderName(
                                                e.target.value
                                            )
                                        }
                                        required
                                    />

                                </div>


                                <div className="mb-3">

                                    <label className="form-label">
                                        Loan Name
                                    </label>

                                    <input
                                        type="text"
                                        className="form-control"
                                        value={loanName}
                                        onChange={(e) =>
                                            setLoanName(
                                                e.target.value
                                            )
                                        }
                                        required
                                    />

                                </div>


                                <div className="mb-3">

                                    <label className="form-label">
                                        Loan Account Number
                                    </label>

                                    <input
                                        type="text"
                                        className="form-control"
                                        value={loanAccountNumber}
                                        onChange={(e) =>
                                            setLoanAccountNumber(
                                                e.target.value
                                            )
                                        }
                                        required
                                    />

                                </div>


                                <div className="mb-3">

                                    <label className="form-label">
                                        Current Balance
                                    </label>

                                    <input
                                        type="number"
                                        className="form-control"
                                        value={currentBalance}
                                        onChange={(e) =>
                                            setCurrentBalance(
                                                e.target.value
                                            )
                                        }
                                        min="0"
                                        step="0.01"
                                        required
                                    />

                                </div>


                                <div className="d-flex gap-2">

                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={onCancel}
                                    >
                                        Cancel
                                    </button>


                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                    >
                                        Save Changes
                                    </button>

                                </div>

                            </form>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

}