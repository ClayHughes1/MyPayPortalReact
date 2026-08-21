import { useState, useRef, useEffect } from "react";
import usePayments from "../hooks/usePayments";

export default function MakePayment() {
    const paymentAmountRef = useRef(null);
    const loanNameRef = useRef(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const {
        payments,
        loading,
        error,
        makePayment
    } = usePayments();

    // console.log("Selected Payment: \n",payments);


    const [selectedPayment, setSelectedPayment] =
        useState(null);

    const [paymentAmount, setPaymentAmount] =
        useState("");

   const [loanName, setLoanName] =
        useState("");

    // const handlePay = (payment) => {

    //     setSelectedPayment(payment);

    //     setPaymentAmount("");

    // };

    const handlePay = (payment) => {
        setSelectedPayment(payment);

        console.log("Selected Payment: \n",payment);
        setLoanName(payment.loanName || "");
        console.log("Selected Payment: \n",selectedPayment);


        setPaymentAmount("");
        setShowPaymentModal(true);
    };

    useEffect(() => {
        if (showPaymentModal) {
            paymentAmountRef.current?.focus();
        }
    }, [showPaymentModal]);

    const handleCancel = () => {

        setSelectedPayment(null);

        setPaymentAmount("");

        setLoanName("");

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

                loanName: 
                    loanName,

                paymentDate:
                    new Date().toISOString()

            };

            await makePayment(request);

            setSelectedPayment(null);
            setPaymentAmount("");
            setLoanName("");
        }
        catch (error) {

            console.error(
                "Payment processing failed:",
                error
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
                <div
                    className={`modal fade ${showPaymentModal ? "show" : ""}`}
                    style={{
                        display: showPaymentModal ? "block" : "none"
                    }}
                    tabIndex="-1"
                    role="dialog"
                    aria-modal={showPaymentModal}
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">

                            <div className="modal-header">

                                <h4 className="modal-title">
                                    Make Payment
                                </h4>

                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={handleCancel}
                                    aria-label="Close"
                                />

                            </div>

                            <form onSubmit={handleSubmit}>

                                <div className="modal-body">

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
                                            Loan Name
                                        </label>

                                        <input
                                            ref={loanNameRef}
                                            type="text"
                                            className="form-control"
                                            value={loanName}
                                            onChange={(e) =>
                                                setLoanName(
                                                    e.target.value
                                                )
                                            }
                                            disabled
                                        />

                                        {/* <input
                                            ref={loanNameRef}
                                            type="text"
                                            className="form-control"
                                            value={selectedPayment.loanName}
                                            onChange={(e) =>
                                                setLoanName(
                                                    e.target.value
                                                )
                                            }
                                        /> */}

                                    </div>


                                    <div className="mb-3">

                                        <label className="form-label">
                                            Account Number
                                        </label>

                                        {/* <input
                                            type="text"
                                            className="form-control"
                                            value={
                                                selectedPayment.loanAccountNumber || ""
                                            }
                                            disabled
                                        /> */}


                                        <input
                                            type="text"
                                            className="form-control"
                                            value={
                                                selectedPayment.loanAccountNumber
                                                    ? `****${selectedPayment.loanAccountNumber.slice(-4)}`
                                                    : ""
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
                                            ref={paymentAmountRef}
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

                                </div>

                                <div className="modal-footer">

                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={handleCancel}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="btn btn-success"
                                    >
                                        Submit Payment
                                    </button>

                                </div>

                            </form>

                        </div>
                    </div>
                </div>
            )}



       </div>

    );

}

