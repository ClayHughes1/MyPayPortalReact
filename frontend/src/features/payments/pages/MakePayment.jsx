import { useState } from "react";
import usePayments from "../hooks/usePayments";

export default function MakePayment() {

    console.log("Make a Payment");

    const {
        payments,
        loading,
        error,
        makePayment
    } = usePayments();

    const [selectedPayment, setSelectedPayment] =
        useState(null);

    const [paymentAmount, setPaymentAmount] =
        useState("");


    const handlePay = (payment) => {

        setSelectedPayment(payment);

        setPaymentAmount("");

    };


    const handleCancel = () => {

        setSelectedPayment(null);

        setPaymentAmount("");

    };


    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!selectedPayment) {
            return;
        }

        try {

            const storedUser =
                localStorage.getItem("user");

            const user =
                storedUser
                    ? JSON.parse(storedUser)
                    : null;

            const customerId = user?.id;

            if (!customerId) {
                throw new Error(
                    "Customer information was not found."
                );
            }

            const request = {

                customerId,

                loanAccountId:
                    selectedPayment.loanAccountId,

                paymentAmount:
                    Number(paymentAmount),

                paymentDate:
                    new Date().toISOString()

            };

            console.log(
                "Submitting payment:",
                request
            );

            await makePayment(request);

            alert("Payment submitted successfully.");

            setSelectedPayment(null);
            setPaymentAmount("");

        }
        catch (error) {

            console.error(
                "Payment processing failed:",
                error
            );

            alert(
                error.message ||
                "Unable to process payment."
            );

        }

    };

    if (loading) {

        return (

            <div className="container-fluid py-4">

                <div className="text-center">

                    <div
                        className="spinner-border"
                        role="status"
                    >
                        <span className="visually-hidden">
                            Loading...
                        </span>
                    </div>

                </div>

            </div>

        );

    }


    if (error) {

        return (

            <div className="container-fluid py-4">

                <div className="alert alert-danger">
                    {error}
                </div>

            </div>

        );

    }


    return (

        <div className="container-fluid py-4">

            <h1 className="mb-4">
                Make A Payment
            </h1>


            {/* Loan Accounts */}

            {!payments || payments.length === 0 ? (

                <div className="alert alert-info">
                    No payment accounts have been created.
                </div>

            ) : (

                <div className="table-responsive">

                    <table className="table table-striped table-hover">

                        <thead>

                            <tr>
                                <th>Loan Vendor</th>
                                <th>Account Number</th>
                                <th>Current Balance</th>
                                <th>Action</th>
                            </tr>

                        </thead>

                        <tbody>

                            {payments.map(payment => (

                                <tr key={payment.id}>

                                    <td>
                                        {payment.lenderName}
                                    </td>

                                    <td>
                                        ****
                                        {payment.accountNumber?.slice(-4)}
                                    </td>

                                    <td>
                                        ${Number(
                                            payment.currentBalance || 0
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
                                            className="btn btn-primary"
                                            onClick={() =>
                                                handlePay(payment)
                                            }
                                        >
                                            Pay
                                        </button>

                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            )}


            {/* Payment Form */}

            {selectedPayment && (

                <div className="card mt-4">

                    <div className="card-body">

                        <h4 className="mb-4">
                            Make Payment
                        </h4>


                        <form onSubmit={handleSubmit}>

                            <div className="mb-3">

                                <label className="form-label">
                                    Loan Vendor
                                </label>

                                <input
                                    type="text"
                                    className="form-control"
                                    value={
                                        selectedPayment.lenderName || ""
                                    }
                                    disabled
                                />

                            </div>


                            <div className="mb-3">

                                <label className="form-label">
                                    Account Number
                                </label>

                                <input
                                    type="text"
                                    className="form-control"
                                    value={
                                        selectedPayment.accountNumber || ""
                                    }
                                    disabled
                                />

                            </div>


                            <div className="mb-3">

                                <label className="form-label">
                                    Current Balance
                                </label>

                                <input
                                    type="text"
                                    className="form-control"
                                    value={
                                        `$${Number(
                                            selectedPayment.currentBalance || 0
                                        ).toLocaleString(
                                            "en-US",
                                            {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            }
                                        )}`
                                    }
                                    disabled
                                />

                            </div>


                            <div className="mb-3">

                                <label className="form-label">
                                    Payment Amount
                                </label>

                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    max={
                                        selectedPayment.currentBalance
                                    }
                                    className="form-control"
                                    value={paymentAmount}
                                    onChange={(e) =>
                                        setPaymentAmount(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter payment amount"
                                    required
                                />

                            </div>


                            <div className="d-flex gap-2">

                                <button
                                    type="submit"
                                    className="btn btn-success"
                                >
                                    Submit Payment
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleCancel}
                                >
                                    Cancel
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>

    );

}