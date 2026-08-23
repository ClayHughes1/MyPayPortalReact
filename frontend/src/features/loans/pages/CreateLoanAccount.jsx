// src/features/loans/pages/CreateLoanAccount.jsx

import { useState } from "react";

export default function CreateLoanAccount({
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


    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");


        try {

            /*
             * API integration will be added when
             * useLoanAccounts is implemented.
             *
             * For now, create the object that will
             * eventually be passed to the hook.
             */

            const loanAccount = {

                lenderName,

                loanName,

                loanAccountNumber,

                currentBalance:
                    Number(currentBalance)

            };


            /*
             * Temporary behavior.
             *
             * This allows the page workflow to be
             * tested before the API is connected.
             */
            if (onSuccess) {

                onSuccess({
                    ...loanAccount,
                    id: Date.now()
                });

            }

        }
        catch (err) {

            console.error(
                "Unable to create loan account:",
                err
            );

            setError(
                err.message ||
                "Unable to create loan account."
            );

        }

    };


    return (

        <div className="container-fluid py-4">

            <div className="mb-4">

                <h1>
                    Create Loan Account
                </h1>

                <p className="text-muted">
                    Create a new loan account.
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
                                        placeholder="Enter loan vendor"
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
                                        placeholder="Enter loan name"
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
                                        placeholder="Enter loan account number"
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
                                        placeholder="0.00"
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
                                        Create Loan Account
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