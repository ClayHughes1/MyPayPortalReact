// src/features/payments/pages/PaymentsPage.jsx

import { useEffect, useState } from "react";

import PaymentForm from "../components/PaymentForm";
import PaymentList from "../components/PaymentList";

import usePayments from "../hooks/usePayments";
import LoanAccountEditModal from "../components/LoanAccountEditModal";

export default function PaymentsPage() {

    console.log("PaymentsPage");
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


        console.log("Stored user:", storedUser);


        if (storedUser) {

            const user = JSON.parse(storedUser);


            console.log("Parsed user:", user);

            console.log("User Id:", user.id);


            setCurrentUser(user);

        }
        else {

            console.warn("No logged-in user found.");

        }


    }, []);

    const handleEditLoanAccount = (payment) => {
        console.log("Edit clicked:", payment);
        setEditingPayment(payment);
    };

    const handleSaveLoanAccount = async (
        loanAccountId,
        loanAccountData
    ) => {

        console.log(
            "Loan Account ID:",
            loanAccountId
        );

        console.log(
            "Loan Account Data:",
            loanAccountData
        );

    };

    return (

        <div className="container-fluid py-4">


            <h1>
                Payment Management
            </h1>


            <p>
                Manage your MyPay payment accounts.
            </p>


            {
                currentUser &&

                <div className="alert alert-info">

                    Logged in user:

                    {" "}

                    {currentUser.firstName} {currentUser.lastName}

                    {" "}

                    (Customer ID: {currentUser.id})

                </div>

            }



            {
                error &&

                <div className="alert alert-danger">

                    {error}

                </div>

            }



            <div className="row">


                {/* <div className="col-lg-5">


                    <div className="card shadow">


                        <div className="card-header">

                            Create AutoPay Payment

                        </div>


                        <div className="card-body">


                            <PaymentForm

                                onSubmit={handleCreatePayment}

                            />


                        </div>


                    </div>


                </div> */}




                <div className="col-lg-7">


                    <div className="card shadow">


                        <div className="card-header">

                            Existing Payments

                        </div>


                        <div className="card-body">


                            {/* <PaymentList

                                payments={payments}

                                loading={loading}

                                onDelete={deletePayment}

                                onUpdate={updatePayment}

                            /> */}

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