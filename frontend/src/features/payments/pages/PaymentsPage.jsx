// src/features/payments/pages/PaymentsPage.jsx

import { useEffect, useState } from "react";

import PaymentForm from "../components/PaymentForm";
import PaymentList from "../components/PaymentList";

import usePayments from "../hooks/usePayments";
import LoanAccountEditModal from "../components/LoanAccountEditModal";

export default function PaymentsPage() {

    const [currentUser, setCurrentUser] = useState(null);
    const [editingPayment, setEditingPayment] = useState(null);
    const [savingLoanAccount, setSavingLoanAccount] =
        useState(false);
        
    const {

        payments,

        loading,

        error,

        createPayment,

        updatePayment,

        deletePayment


    } = usePayments();



    useEffect(() => {

        const storedUser = localStorage.getItem("user");

        if (storedUser) {

            const user = JSON.parse(storedUser);
            setCurrentUser(user);

        }
        else {

            console.warn("No logged-in user found.");

        }


    }, []);

    const handleEditLoanAccount = (payment) => {
        setEditingPayment(payment);
    };

    const handleSaveLoanAccount = async (
        loanAccountId,
        loanAccountData
    ) => {

    };

    return (

        <div className="container-fluid py-4">


            <h1>
                Payment Management
            </h1>


            <p>
                Manage your payment accounts.
            </p>

            {
                error &&

                <div className="alert alert-danger">

                    {error}

                </div>

            }


            <div className="row">
                <div className="col-lg-12">


                    <div className="card">


                        <div className="card-header">

                            Existing Payments

                        </div>


                        <div className="card-body">
                            <PaymentList
                                payments={payments}
                                loading={loading}
                                onDelete={deletePayment}
                                onUpdate={handleEditLoanAccount}
                            />
                        </div>

                        {editingPayment && (
                            <LoanAccountEditModal
                                payment={editingPayment}
                                onSave={handleSaveLoanAccount}
                                onClose={() => setEditingPayment(null)}
                                saving={savingLoanAccount}
                            />
                        )}

                    </div>


                </div>


            </div>


        </div>

    );

}