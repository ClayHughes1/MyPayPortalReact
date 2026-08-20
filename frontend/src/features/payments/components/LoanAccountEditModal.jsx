import { useEffect, useRef, useState } from "react";

export default function LoanAccountEditModal({
    payment,
    onSave,
    onClose,
    saving
}) {

    const loanTypeRef = useRef(null);

    const [formData, setFormData] = useState({
        loanType: "",
        loanName: "",
        lenderName: "",
        accountNumber: "",
        currentBalance: "",
        interestRate: "",
        paymentAmount: "",
        paymentFrequency: "",
        paymentDate: ""
    });

    useEffect(() => {

        if (!payment) {
            return;
        }

        setFormData({
            loanType: payment.loanType || "",
            loanName: payment.loanName || "",
            lenderName: payment.lenderName || "",
            accountNumber: payment.maskedAccountNumber || "",
            currentBalance: payment.currentBalance ?? "",
            interestRate: payment.interestRate ?? "",
            paymentAmount: payment.paymentAmount ?? "",
            paymentFrequency: payment.paymentFrequency || "",
            paymentDate: payment.paymentDate
                ? payment.paymentDate.substring(0, 10)
                : ""
        });

        setTimeout(() => {
            loanTypeRef.current?.focus();
        }, 100);

    }, [payment]);


    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData(previous => ({
            ...previous,
            [name]: value
        }));

    };


    const handleSubmit = async (e) => {

        e.preventDefault();

        await onSave(
            payment.loanAccountId,
            formData
        );

    };


    if (!payment) {
        return null;
    }


    return (

        <div
            className="modal fade show d-block"
            tabIndex="-1"
            role="dialog"
            style={{
                backgroundColor: "rgba(0, 0, 0, 0.5)"
            }}
        >

            <div className="modal-dialog modal-lg modal-dialog-centered">

                <div className="modal-content">


                    {/* Modal Header */}

                    <div className="modal-header">

                        <h5 className="modal-title">
                            Edit Loan Account
                        </h5>

                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                            disabled={saving}
                        />

                    </div>


                    {/* Modal Form */}

                    <form onSubmit={handleSubmit}>

                        <div className="modal-body">


                            {/* Loan Type */}

                            <div className="mb-3">

                                <label className="form-label">
                                    Loan Type
                                </label>

                                <input
                                    ref={loanTypeRef}
                                    type="text"
                                    name="loanType"
                                    className="form-control"
                                    value={formData.loanType}
                                    onChange={handleChange}
                                    required
                                />

                            </div>


                            {/* Loan Name */}

                            <div className="mb-3">

                                <label className="form-label">
                                    Loan Name
                                </label>

                                <input
                                    type="text"
                                    name="loanName"
                                    className="form-control"
                                    value={formData.loanName}
                                    onChange={handleChange}
                                />

                            </div>


                            {/* Lender */}

                            <div className="mb-3">

                                <label className="form-label">
                                    Lender Name
                                </label>

                                <input
                                    type="text"
                                    name="lenderName"
                                    className="form-control"
                                    value={formData.lenderName}
                                    onChange={handleChange}
                                    required
                                />

                            </div>


                            {/* Account Number */}

                            <div className="mb-3">

                                <label className="form-label">
                                    Account Number
                                </label>

                                <input
                                    type="text"
                                    name="accountNumber"
                                    className="form-control"
                                    value={formData.accountNumber}
                                    onChange={handleChange}
                                />

                            </div>


                            {/* Balance / Interest Rate */}

                            <div className="row">

                                <div className="col-md-6 mb-3">

                                    <label className="form-label">
                                        Current Balance
                                    </label>

                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        name="currentBalance"
                                        className="form-control"
                                        value={formData.currentBalance}
                                        onChange={handleChange}
                                        required
                                    />

                                </div>


                                <div className="col-md-6 mb-3">

                                    <label className="form-label">
                                        Interest Rate
                                    </label>

                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        name="interestRate"
                                        className="form-control"
                                        value={formData.interestRate}
                                        onChange={handleChange}
                                    />

                                </div>

                            </div>


                            {/* Payment Amount / Frequency */}

                            <div className="row">

                                <div className="col-md-6 mb-3">

                                    <label className="form-label">
                                        AutoPay Amount
                                    </label>

                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        name="paymentAmount"
                                        className="form-control"
                                        value={formData.paymentAmount}
                                        onChange={handleChange}
                                        required
                                    />

                                </div>


                                <div className="col-md-6 mb-3">

                                    <label className="form-label">
                                        Payment Frequency
                                    </label>

                                    <select
                                        name="paymentFrequency"
                                        className="form-select"
                                        value={formData.paymentFrequency}
                                        onChange={handleChange}
                                        required
                                    >

                                        <option value="">
                                            Select Frequency
                                        </option>

                                        <option value="Weekly">
                                            Weekly
                                        </option>

                                        <option value="Biweekly">
                                            Biweekly
                                        </option>

                                        <option value="Monthly">
                                            Monthly
                                        </option>

                                        <option value="Quarterly">
                                            Quarterly
                                        </option>

                                        <option value="Yearly">
                                            Yearly
                                        </option>

                                    </select>

                                </div>

                            </div>


                            {/* Payment Date */}

                            <div className="mb-3">

                                <label className="form-label">
                                    Next Payment Date
                                </label>

                                <input
                                    type="date"
                                    name="paymentDate"
                                    className="form-control"
                                    value={formData.paymentDate}
                                    onChange={handleChange}
                                />

                            </div>

                        </div>


                        {/* Modal Footer */}

                        <div className="modal-footer">

                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={onClose}
                                disabled={saving}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={saving}
                            >

                                {saving
                                    ? "Saving..."
                                    : "Save Changes"}

                            </button>

                        </div>

                    </form>

                </div>

            </div>

        </div>

    );
}