// src/features/loans/pages/LoanAccount.jsx

import { useState } from "react";

import CreateLoanAccount from "./CreateLoanAccount";
import EditLoanAccount from "./EditLoanAccount";
import useLoanAccounts from "../hooks/useLoanAccounts";



export default function LoanAccount() {

    const [view, setView] =
        useState("list");

    const [selectedAccount, setSelectedAccount] =
        useState(null);


    /*
     * Temporary loan account data.
     *
     * This will be replaced by useLoanAccounts()
     * when we build the hook.
     */
    // const [loanAccounts, setLoanAccounts] =
    //     useState([]);


    const {
        loanAccounts,
        loading,
        error,
        createLoanAccount,
        updateLoanAccount,
        deleteLoanAccount
    } = useLoanAccounts();

    const handleCreate = () => {

        setSelectedAccount(null);

        setView("create");

    };


    const handleEdit = (account) => {

        setSelectedAccount(account);

        setView("edit");

    };


    const handleCreateSuccess = (account) => {

        setLoanAccounts(previous =>
            [...previous, account]
        );

        setView("list");

    };


    const handleUpdateSuccess = (updatedAccount) => {

        setLoanAccounts(previous =>
            previous.map(account =>
                account.id === updatedAccount.id
                    ? updatedAccount
                    : account
            )
        );

        setSelectedAccount(null);

        setView("list");

    };


    const handleCancel = () => {

        setSelectedAccount(null);

        setView("list");

    };


    /*
     * Create Loan Account
     */
    if (view === "create") {

        return (

            <CreateLoanAccount
                onSuccess={handleCreateSuccess}
                onCancel={handleCancel}
            />

        );

    }


    /*
     * Edit Loan Account
     */
    if (view === "edit" && selectedAccount) {

        return (

            <EditLoanAccount
                account={selectedAccount}
                onSuccess={handleUpdateSuccess}
                onCancel={handleCancel}
            />

        );

    }


    /*
     * Loan Account List
     */
    return (

        <div className="container-fluid py-4">

            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>

                    <h1 className="mb-1">
                        Loan Accounts
                    </h1>

                    <p className="text-muted mb-0">
                        Manage your loan accounts.
                    </p>

                </div>


                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleCreate}
                >
                    Create Loan Account
                </button>

            </div>


            {loanAccounts.length === 0 ? (

                <div className="alert alert-info">

                    No loan accounts have been created.

                </div>

            ) : (

                <div className="table-responsive">

                    <table className="table table-striped table-hover">

                        <thead>

                            <tr>

                                <th>
                                    Loan Vendor
                                </th>

                                <th>
                                    Loan Name
                                </th>

                                <th>
                                    Account Number
                                </th>

                                <th>
                                    Current Balance
                                </th>

                                <th>
                                    Actions
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {loanAccounts.map(account => (

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
                                            className="btn btn-sm btn-primary"
                                            onClick={() =>
                                                handleEdit(account)
                                            }
                                        >
                                            Edit
                                        </button>

                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            )}

        </div>

    );

}