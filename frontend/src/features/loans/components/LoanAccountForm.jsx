import { useEffect, useState } from "react";

export default function LoanAccountForm({
    account,
    onSubmit,
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


    useEffect(() => {

        if (account) {

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

        }
        else {

            setLenderName("");
            setLoanName("");
            setLoanAccountNumber("");
            setCurrentBalance("");

        }

    }, [account]);


    const handleSubmit = async (e) => {

        e.preventDefault();

        await onSubmit({

            lenderName,

            loanName,

            loanAccountNumber,

            currentBalance:
                Number(currentBalance)

        });

    };


    return (

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
                    step="0.01"
                    min="0"
                    className="form-control"
                    value={currentBalance}
                    onChange={(e) =>
                        setCurrentBalance(
                            e.target.value
                        )
                    }
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
                    {account
                        ? "Update Loan Account"
                        : "Create Loan Account"}
                </button>

            </div>

        </form>

    );
}